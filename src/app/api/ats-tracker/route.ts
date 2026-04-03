export const dynamic = 'force-dynamic';
import { callAI } from '@/lib/ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkCredits, deductCredits } from '@/lib/credits';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';
import { runATSAnalysis } from '@/lib/ats-engine';

// GET: return all ATS scores for the user, grouped by resume
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as any).id;

        // Fetch scores
        const scoresSnap = await adminDb.collection('ats_scores')
            .where('userId', '==', userId)
            // .orderBy('createdAt', 'desc') // Requires index
            .limit(50)
            .get();

        const scores = scoresSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Sort manually
        scores.sort((a: any, b: any) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        // Also get user's resumes for the "Run Analysis" picker
        const resumesSnap = await adminDb.collection('resumes')
            .where('userId', '==', userId)
            // .orderBy('createdAt', 'desc') // Requires index
            .get();

        const resumes = resumesSnap.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title
        }));

        return NextResponse.json({ scores, resumes });
    } catch (err: any) {
        console.error('ATS tracker GET error:', err);
        return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
    }
}

// Convert structured resume JSON into readable text for accurate ATS analysis
function resumeDataToText(data: any): string {
    const lines: string[] = [];
    if (data.personal) {
        const p = data.personal;
        if (p.fullName) lines.push(p.fullName);
        const contactParts = [p.location, p.phone, p.email, p.linkedin, p.github, p.portfolio].filter(Boolean);
        if (contactParts.length > 0) lines.push(contactParts.join(' | '));
    }
    if (data.summary) lines.push('', 'Professional Summary', data.summary);
    if (Array.isArray(data.skills) && data.skills.length > 0) lines.push('', 'Skills', data.skills.join(', '));
    if (Array.isArray(data.experience) && data.experience.length > 0) {
        lines.push('', 'Professional Experience');
        for (const exp of data.experience) {
            lines.push(`${exp.jobTitle || 'Role'} at ${exp.company || 'Company'}`);
            if (exp.startDate || exp.endDate) lines.push(`${exp.startDate || ''} - ${exp.endDate || 'Present'}`);
            if (exp.location) lines.push(exp.location);
            if (Array.isArray(exp.bullets)) {
                for (const b of exp.bullets) if (b && b.trim()) lines.push(`- ${b.trim()}`);
            }
        }
    }
    if (Array.isArray(data.projects) && data.projects.length > 0) {
        lines.push('', 'Projects');
        for (const proj of data.projects) {
            lines.push(`${proj.name || 'Project'}${proj.techStack ? ' (' + proj.techStack + ')' : ''}`);
            if (proj.description) lines.push(proj.description);
            if (proj.link) lines.push(proj.link);
        }
    }
    if (Array.isArray(data.education) && data.education.length > 0) {
        lines.push('', 'Education');
        for (const edu of data.education) {
            lines.push(`${edu.degree || 'Degree'}, ${edu.institution || 'Institution'}, ${edu.year || ''}`);
            if (edu.gpa) lines.push(`GPA: ${edu.gpa}`);
        }
    }
    if (Array.isArray(data.certifications) && data.certifications.length > 0) lines.push('', 'Certifications', data.certifications.join(', '));
    if (Array.isArray(data.languages) && data.languages.length > 0) lines.push('', 'Languages', data.languages.join(', '));
    if (data.targetRole) lines.push('', `Target Role: ${data.targetRole}`);
    return lines.join('\n');
}

// POST: run ATS analysis on a resume + JD, save score
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const userId = (session.user as any).id;

        const { resumeId, resumeText, jobDescription } = await req.json();
        if (!jobDescription) return NextResponse.json({ error: 'Job description is required' }, { status: 400 });

        let resumeContent = '';
        let resumeTitle = 'Uploaded Resume';
        let linkedResumeId = resumeId || null;

        if (resumeId) {
            const resumeDoc = await adminDb.collection('resumes').doc(resumeId).get();
            if (!resumeDoc.exists) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
            
            const resume = resumeDoc.data()!;
            resumeTitle = resume.title;
            if (resume.data && typeof resume.data === 'object' && resume.data.personal) {
                resumeContent = resumeDataToText(resume.data);
            } else if (resume.markdown) {
                resumeContent = resume.markdown;
            } else {
                return NextResponse.json({ error: 'Resume is empty' }, { status: 404 });
            }
        } else if (resumeText && resumeText.trim().length > 20) {
            resumeContent = resumeText;
            linkedResumeId = null;
        } else {
            return NextResponse.json({ error: 'Please select a resume or upload a document' }, { status: 400 });
        }

        // Pre-check credits
        const creditCheck = await checkCredits(userId, 'ATS_SCORE');
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: `Insufficient credits. Need ${creditCheck.cost}, have ${creditCheck.balance}.` }, { status: 402 });
        }

        // Run Deterministic ATS Engine
        const engineResult = runATSAnalysis(resumeContent, jobDescription);

        // Qualitative Commentary (Optional/AI)
        const matchedKws = engineResult.keywords.filter(k => k.found).map(k => k.keyword);
        const missingKws = engineResult.keywords.filter(k => !k.found).map(k => k.keyword);

        const prompt = `You are a professional resume reviewer. Qualitative commentary ONLY (JSON).
Computed scores (ignore logic, just provide text): Score ${engineResult.overallScore}%, Keywords ${engineResult.keywordScore}%.
Focus on feedback for: ${missingKws.join(', ')}`;

        let aiCommentary: any = {};
        try {
            const aiResult = await callAI({
                messages: [
                    { role: 'system', content: 'Return ONLY valid JSON: {"overallVerdict":"string","suggestions":["string"],"strengthAreas":["string"],"formatIssues":["string"],"sectionFeedback":{"contactInfo":"string","summary":"string","experience":"string","skills":"string","education":"string","projects":"string","formatting":"string"}}' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.2,
                max_tokens: 800,
            });
            let content = aiResult.content;
            content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
            aiCommentary = JSON.parse(content);
        } catch (err) {
            console.error('AI Qualitative parse failed.', err);
        }

        // SUCCESS — deduct credits
        await deductCredits(userId, 'ATS_SCORE', `ATS analysis: ${resumeTitle}`);

        const fullResult = {
            score: engineResult.overallScore,
            keywordScore: engineResult.keywordScore,
            sectionScore: engineResult.sectionScore,
            bulletScore: engineResult.bulletScore,
            readabilityScore: engineResult.readabilityScore,
            formatScore: engineResult.formatScore,
            matched: matchedKws,
            missing: missingKws,
            keywords: engineResult.keywords,
            sections: engineResult.sections,
            bulletAnalysis: engineResult.bulletAnalysis,
            readabilityMetrics: engineResult.readabilityMetrics,
            formatMetrics: engineResult.formatMetrics,
            overallVerdict: aiCommentary.overallVerdict || '',
            suggestions: aiCommentary.suggestions || [],
            strengthAreas: aiCommentary.strengthAreas || [],
            formatIssues: aiCommentary.formatIssues || [],
            sectionFeedback: aiCommentary.sectionFeedback || {},
        };

        const now = new Date().toISOString();
        const scoreEntry = {
            resumeId: linkedResumeId,
            userId,
            score: engineResult.overallScore,
            jdSnippet: jobDescription.substring(0, 500),
            matched: matchedKws,
            missing: missingKws,
            suggestions: aiCommentary.suggestions || [],
            fullResult,
            createdAt: now,
            resume: { id: linkedResumeId || '', title: resumeTitle }
        };

        if (linkedResumeId) {
            const savedDoc = await adminDb.collection('ats_scores').add(scoreEntry);
            return NextResponse.json({ score: { id: savedDoc.id, ...scoreEntry }, result: fullResult });
        } else {
            return NextResponse.json({
                score: { id: 'upload-' + Date.now(), ...scoreEntry },
                result: fullResult
            });
        }
    } catch (err: any) {
        console.error('ATS tracker POST error:', err);
        return NextResponse.json({ error: err.message || 'Unexpected error' }, { status: 500 });
    }
}
