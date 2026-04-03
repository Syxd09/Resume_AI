export const dynamic = 'force-dynamic';
import { callAI } from '@/lib/ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { deductCredits, checkCredits } from '@/lib/credits';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const { personalInfo, experience, education, skills, projects, targetRole } = await req.json();

        if (!personalInfo || !experience || !education || !skills || !projects || !targetRole) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as any).id;
        const db = getAdminDb();

        const creditCheck = await checkCredits(userId, 'GENERATE_RESUME');
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: `Insufficient credits. Need ${creditCheck.cost}, have ${creditCheck.balance}.` }, { status: 402 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Config error' }, { status: 500 });
        }

        const prompt = `You are a world-class resume writer and career expert. Create a highly professional, modern, and ATS-optimized resume using the provided details. Use the target role to tailor the tone and keywords.

PERSONAL INFO:
${JSON.stringify(personalInfo)}

TARGET ROLE:
${targetRole}

EXPERIENCE:
${JSON.stringify(experience)}

EDUCATION:
${JSON.stringify(education)}

SKILLS:
${JSON.stringify(skills)}

PROJECTS:
${JSON.stringify(projects)}

Rules:
1. Synthesize a powerful "Professional Summary" (3-4 sentences).
2. For each experience/project role, create 3-5 concise, impact-driven bullet points starting with strong action verbs. Quantify achievements where possible.
3. Include relevant technical and soft skills.
4. Ensure the output is high-quality, professional, and grammatically perfect.
5. Return ONLY the modified JSON structure.

JSON Structure:
{
  "professionalSummary": "...",
  "experience": [
    {
      "company": "...",
      "role": "...",
      "period": "...",
      "bullets": ["Bullet 1", "Bullet 2"]
    }
  ],
  "education": [...SAME AS INPUT...],
  "skills": [...SAME AS INPUT...],
  "projects": [...SAME AS INPUT...]
}
`;

        const aiResult = await callAI({
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 2000,
        });

        const resumeData = aiResult.content;

        if (!resumeData) {
            return NextResponse.json({ error: 'AI returned an empty response. Please try again.' }, { status: 500 });
        }

        let parsedResumeData;
        try {
            const cleanJson = resumeData.replace(/```json|```/g, '').trim();
            parsedResumeData = JSON.parse(cleanJson);
        } catch (e) {
            console.error('Resume JSON parse error:', e);
            return NextResponse.json({ error: 'Failed to synthesize resume. Please try again.' }, { status: 500 });
        }

        // Add additional metadata from inputs
        const finalizedData = {
            ...parsedResumeData,
            personalInfo,
            targetRole,
        };

        // SUCCESS — Deduct credits using atomic transaction
        const creditResult = await deductCredits(userId, 'GENERATE_RESUME', `Generated resume for: ${targetRole}`);
        
        if (!creditResult.success) {
            return NextResponse.json({ error: creditResult.error }, { status: 402 });
        }

        // Save to Firestore
        const now = new Date().toISOString();
        const resumeRef = await db.collection('resumes').add({
            userId,
            title: `Resume - ${targetRole} (${new Date().toLocaleDateString()})`,
            data: finalizedData,
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json({ 
            id: resumeRef.id,
            resume: finalizedData 
        });
    } catch (err) {
        console.error('Resume generation error:', err);
        return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
    }
}
