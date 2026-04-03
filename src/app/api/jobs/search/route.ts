export const dynamic = 'force-dynamic';
import { callAI } from '@/lib/ai';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get('query') || '';
        const resumeId = searchParams.get('resumeId') || '';
        const page = parseInt(searchParams.get('page') || '1');

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const db = getAdminDb();

        let technicalSkills = '';
        let contextName = 'Global Opportunities';

        // 1. Fetch Context from Resume if resumeId is provided
        if (resumeId) {
            try {
                const resumeDoc = await db.collection('resumes').doc(resumeId).get();
                if (resumeDoc.exists && resumeDoc.data()?.userId === userId) {
                    const resumeData = resumeDoc.data()!;
                    contextName = resumeData.title || 'Latest Resume';
                    technicalSkills = (resumeData.data as any)?.skills?.join(', ') || '';
                }
            } catch (err) {
                console.error('Error fetching resume for context:', err);
            }
        } else if (!query) {
            // If no query and no resumeId, fall back to the most recent resume
            try {
                const resumesSnap = await db.collection('resumes')
                    .where('userId', '==', userId)
                    .limit(1)
                    .get();

                if (!resumesSnap.empty) {
                    const resumeData = resumesSnap.docs[0].data();
                    contextName = resumeData.title || 'Latest Resume';
                    technicalSkills = (resumeData.data as any)?.skills?.join(', ') || '';
                }
            } catch (err) {
                console.error('Error fetching default resume context:', err);
            }
        }

        const finalQuery = query || technicalSkills || 'Software Developer';

        const prompt = `You are a professional job search assistant. Based on the user's query and their background, generate 5-8 highly relevant, realistic job listings.

User Query: ${finalQuery}
User Technical Context: ${technicalSkills || 'Not provided'}
Current Location: India (Default)

Rules for the response:
1. Provide a variety of roles that match the tech stack.
2. For each job, include: title, company, location, salary (estimate), summary, and 3-4 key requirements.
3. Return the response as a JSON array of objects.

JSON Format:
[
  {
    "id": "unique-string-\${Math.random()}",
    "title": "Software Engineer",
    "company": "Tech Corp",
    "location": "San Francisco, CA",
    "salary": "$120k - $160k",
    "summary": "Looking for a full-stack developer...",
    "requirements": ["React", "Node.js", "PostgreSQL"],
    "postedAt": "Just now"
  }
]
`;

        const aiResult = await callAI({
            messages: [{ role: 'system', content: 'You are a career scan engine. Return ONLY valid JSON.' }, { role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 1500,
        });

        let jobs = [];
        try {
            const content = aiResult.content.replace(/```json|```/g, '').trim();
            jobs = JSON.parse(content);
        } catch (e) {
            console.error('Job search parse error:', e);
            return NextResponse.json({ error: 'Failed to synthesize job results. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({
            jobs,
            query: finalQuery,
            context: contextName,
            total: jobs.length,
            status: 'global'
        });
    } catch (err) {
        console.error('Job search API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
