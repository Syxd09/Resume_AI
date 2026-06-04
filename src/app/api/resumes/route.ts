export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        if (!userId) {
            console.error('[Resumes GET] Error: session.user.id is undefined');
            return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
        }
        const db = getAdminDb();

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (id) {
            const resumeDoc = await db.collection('resumes').doc(id).get();
            if (!resumeDoc.exists) {
                return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
            }
            const resumeData = resumeDoc.data()!;
            if (resumeData.userId !== userId) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
            return NextResponse.json({ resume: { id: resumeDoc.id, ...resumeData } });
        }

        const resumesSnap = await db.collection('resumes')
            .where('userId', '==', userId)
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
        if (!userId) {
            console.error('[Resumes POST] Error: session.user.id is undefined');
            return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
        }
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

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        if (!userId) {
            console.error('[Resumes DELETE] Error: session.user.id is undefined');
            return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Resume ID is required' }, { status: 400 });
        }

        const db = getAdminDb();
        const resumeRef = db.collection('resumes').doc(id);
        const resumeDoc = await resumeRef.get();

        if (!resumeDoc.exists) {
            return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        }

        const resumeData = resumeDoc.data()!;
        if (resumeData.userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await resumeRef.delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete resume error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
