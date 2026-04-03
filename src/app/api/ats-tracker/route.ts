export const dynamic = 'force-dynamic';
import { callAI } from '@/lib/ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const db = getAdminDb();

        const resumesSnap = await db.collection('resumes')
            .where('userId', '==', userId)
            .get();

        const resumes = resumesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        const trackingsSnap = await db.collection('trackings')
            .where('userId', '==', userId)
            .get();

        const trackings = trackingsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        trackings.sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

        return NextResponse.json({ scores: trackings, resumes });
    } catch (err) {
        console.error('ATS Tracker GET error:', err);
        return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { resumeId, resumeText, jobDescription } = await req.json();

        if ((!resumeId && !resumeText) || !jobDescription) {
            return NextResponse.json({ error: 'Missing resume or job description' }, { status: 400 });
        }

        const db = getAdminDb();
        let resumeContent = resumeText || '';
        let resumeTitle = 'Uploaded Resume';

        if (resumeId) {
            const resumeDoc = await db.collection('resumes').doc(resumeId).get();
            if (resumeDoc.exists) {
                const data = resumeDoc.data()!;
                resumeContent = JSON.stringify(data.data || data.markdown || '');
                resumeTitle = data.title || 'Selected Resume';
            }
        }

        // 1. Perform AI Analysis
        const prompt = `You are an ATS (Applicant Tracking System) Specialist. Perform a deep structural audit of this resume against the job description.

JOB DESCRIPTION:
${jobDescription.substring(0, 2000)}

RESUME CONTENT:
${resumeContent.substring(0, 4000)}

RULES:
1. Provide a score from 0-100.
2. matchedKeywords: list of keywords found.
3. missingKeywords: list of keywords missing.
4. suggestions: list of improvement tips.
5. Provide component scores for: keywordScore, sectionScore, bulletScore, readabilityScore, formatScore.
6. overallVerdict: A 2-sentence professional summary of the match.

RETURN ONLY VALID JSON matching this schema:
{
  "score": number,
  "keywordScore": number,
  "sectionScore": number,
  "bulletScore": number,
  "readabilityScore": number,
  "formatScore": number,
  "matched": ["string"],
  "missing": ["string"],
  "suggestions": ["string"],
  "overallVerdict": "string"
}
`;

        const aiResult = await callAI({
            messages: [
                { role: 'system', content: 'You are a career terminal. Return ONLY valid JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.3,
        });

        let detailedResult;
        try {
            const cleanJson = aiResult.content.replace(/```json|```/g, '').trim();
            detailedResult = JSON.parse(cleanJson);
        } catch (e) {
            console.error('ATS Analysis Parse Error:', e);
            return NextResponse.json({ error: 'Failed to synthesize audit result.' }, { status: 500 });
        }

        // 2. Save result to Firestore
        const now = new Date().toISOString();
        const scoreData = {
            userId,
            resume: { id: resumeId || 'external', title: resumeTitle },
            score: detailedResult.score,
            matched: detailedResult.matched,
            missing: detailedResult.missing,
            suggestions: detailedResult.suggestions,
            jdSnippet: jobDescription.substring(0, 100),
            fullResult: detailedResult,
            createdAt: now,
            updatedAt: now,
        };

        const trackingRef = await db.collection('trackings').add(scoreData);

        return NextResponse.json({ 
            success: true, 
            score: { id: trackingRef.id, ...scoreData },
            result: detailedResult 
        });

    } catch (err) {
        console.error('ATS Tracker POST error:', err);
        return NextResponse.json({ error: 'Internal server error while analyzing' }, { status: 500 });
    }
}
