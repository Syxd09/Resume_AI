import { callAI } from '@/lib/ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkCredits, deductCredits } from '@/lib/credits';
import prisma from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = (session.user as any).id;

        const { id } = await params;
        const { jobDescription } = await req.json();

        // Fetch the saved resume
        const resume = await prisma.resume.findFirst({
            where: { id, userId },
            select: { data: true, title: true },
        });

        if (!resume) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        // Pre-check credits
        const creditCheck = await checkCredits(userId, 'COVER_LETTER');
        if (!creditCheck.allowed) {
            return NextResponse.json({ error: `Insufficient credits. Need ${creditCheck.cost}, have ${creditCheck.balance}.` }, { status: 402 });
        }

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const resumeData = resume.data as any;

        const prompt = `You are an expert career coach and professional copywriter.
Write a highly persuasive, customized, and professional cover letter based on the provided resume and job description.

REQUIREMENTS:
1. The cover letter must be written in the first person ("I").
2. Begin immediately with "Dear Hiring Manager," — do NOT include generic header blocks with name/date/address placeholders.
3. Structure: 
    - Engaging opening stating the target role.
    - 2-3 body paragraphs highlighting the MOST RELEVANT experience and skills from the resume.
    - Strong closing paragraph expressing enthusiasm.
4. Keep it concise (300-400 words). Do NOT hallucinate skills or experiences. DO NOT use bracketed placeholders like "[Company Name]" — if the company name isn't in the job description, just refer to "your company" or "the team".
5. Return the output as formatted markdown.

Resume Data:
${JSON.stringify(resumeData, null, 2)}

Job Description:
${jobDescription ? jobDescription.substring(0, 3000) : `General application for ${resumeData?.targetRole || 'this role'}. Focus on the resume strengths.`}
`;

        const aiResult = await callAI({
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.6,
            max_tokens: 1000,
        });

        const coverLetter = aiResult.content;

        if (!coverLetter) {
            return NextResponse.json({ error: 'AI returned an empty response. Please try again.' }, { status: 500 });
        }

        // SUCCESS — deduct credits
        await deductCredits(userId, 'COVER_LETTER', `Cover letter for: ${resume.title}`);

        return NextResponse.json({ coverLetter });
    } catch (err) {
        console.error('Cover letter from resume error:', err);
        return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
    }
}
