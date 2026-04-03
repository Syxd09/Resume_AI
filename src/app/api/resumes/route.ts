export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const db = getAdminDb();

        const resumesSnap = await db.collection('resumes')
            .where('userId', '==', userId)
            // .orderBy('updatedAt', 'desc') // Need composite index for this
            .get();

        const resumes = resumesSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        // Sort manually for now
        resumes.sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

        return NextResponse.json({ resumes });
    } catch (error) {
        console.error('Resumes API error:', error);
        return NextResponse.json({ error: 'Failed to fetch resumes' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const db = getAdminDb();

        const now = new Date().toISOString();
        const resumeRef = await db.collection('resumes').add({
            userId,
            ...body,
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json({ id: resumeRef.id, ...body });
    } catch (error) {
        console.error('Resumes API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
