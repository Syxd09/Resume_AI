export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';
import { callAI } from '@/lib/ai';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { resumeId, jobDescription } = await req.json();

        if (!resumeId || !jobDescription) {
            return NextResponse.json({ error: 'Missing resumeId or jobDescription' }, { status: 400 });
        }

        // 1. Fetch the source resume
        const resumeRef = adminDb.collection('resumes').doc(resumeId);
        const resumeDoc = await resumeRef.get();

        if (!resumeDoc.exists || resumeDoc.data()?.userId !== session.user.id) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        const resume = resumeDoc.data()!;

        // 2. Preparation: Extract existing narrative
        const currentData = resume.data as any;

        // 3. AI Neural Tailoring
        const tailorPrompt = `
            You are a "Neural Resume Architect". 
            Your goal is to surgically rewrite a professional resume to align perfectly with a specific Job Description (JD).
            
            SOURCE RESUME DATA:
            ${JSON.stringify(currentData)}

            TARGET JOB DESCRIPTION:
            ${jobDescription}

            INSTRUCTIONS:
            1. Analyze the JD for key skills, keywords, and specific responsibilities.
            2. Rewrite the "Experience" bullet points to highlight achievements directly relevant to the JD.
            3. Use strong action verbs and metrics.
            4. Adjust the "Professional Summary" to mirror the JD's requirements.
            5. Ensure the "Skills" section prioritizes technologies mentioned in the JD.
            6. DO NOT make up fake companies or dates.
            7. Maintain high professional integrity while maximizing ATS (Applicant Tracking System) compatibility.
            
            Return ONLY the modified JSON structure matching the EXACT same schema as the source.
            Format: { "professionalSummary": "...", "experience": [...], "skills": [...], "projects": [...], ... }
        `;

        const aiResponse = await callAI({
            messages: [{ role: 'user', content: tailorPrompt }],
            temperature: 0.3
        });
        
        let tailoredData;
        try {
            const cleanJson = aiResponse.content.replace(/```json|```/g, '').trim();
            tailoredData = JSON.parse(cleanJson);
        } catch (e) {
            console.error('Tailoring Parse Error:', e);
            return NextResponse.json({ error: 'Failed to synthesize tailored resume' }, { status: 500 });
        }

        // 4. Create a NEW resume record as a tailored version
        const now = new Date().toISOString();
        const newResumeRef = await adminDb.collection('resumes').add({
            userId: session.user.id,
            title: `${resume.title} (Tailored for ${tailoredData.targetCompany || 'Specific Role'})`,
            data: tailoredData as any,
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json({ 
            success: true, 
            resumeId: newResumeRef.id,
            preview: tailoredData 
        });

    } catch (error) {
        console.error('Tailor Route Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
