export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

// GET: list user's resumes or a single resume
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    try {
        if (id) {
            const resumeDoc = await adminDb.collection('resumes').doc(id).get();
            if (!resumeDoc.exists) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            
            const resumeData = resumeDoc.data();
            if (resumeData?.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

            return NextResponse.json({ 
                resume: { id: resumeDoc.id, ...resumeData } 
            });
        }

        const resumesSnap = await adminDb.collection('resumes')
            .where('userId', '==', userId)
            // .orderBy('createdAt', 'desc') // Disabled until Firestore index is created
            .get();

        const resumes = resumesSnap.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title,
            createdAt: doc.data().createdAt,
            updatedAt: doc.data().updatedAt,
        }));

        // Manual sort by createdAt desc
        resumes.sort((a: any, b: any) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        return NextResponse.json({ resumes });
    } catch (error: any) {
        console.error('[API Resumes] GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: save a new resume
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const { title, data, markdown } = await req.json();

    try {
        const now = new Date().toISOString();
        const resumeRef = await adminDb.collection('resumes').add({
            userId,
            title: title || 'Untitled Resume',
            data: data || {},
            markdown: markdown || null,
            createdAt: now,
            updatedAt: now,
        });

        return NextResponse.json({ 
            resume: { id: resumeRef.id, title, data, markdown, userId } 
        });
    } catch (error: any) {
        console.error('[API Resumes] POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: delete a resume
export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Resume ID required' }, { status: 400 });

    try {
        const resumeRef = adminDb.collection('resumes').doc(id);
        const resumeDoc = await resumeRef.get();

        if (!resumeDoc.exists) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        if (resumeDoc.data()?.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        await resumeRef.delete();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API Resumes] DELETE Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT: update an existing resume
export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const { id, title, data, markdown } = await req.json();

    if (!id) return NextResponse.json({ error: 'Resume ID required' }, { status: 400 });

    try {
        const resumeRef = adminDb.collection('resumes').doc(id);
        const resumeDoc = await resumeRef.get();

        if (!resumeDoc.exists) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
        if (resumeDoc.data()?.userId !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const updateData: any = {
            updatedAt: new Date().toISOString()
        };
        if (title !== undefined) updateData.title = title;
        if (data !== undefined) updateData.data = data;
        if (markdown !== undefined) updateData.markdown = markdown;

        await resumeRef.update(updateData);

        const updated = await resumeRef.get();

        return NextResponse.json({ 
            resume: { id: updated.id, ...updated.data() } 
        });
    } catch (error: any) {
        console.error('[API Resumes] PUT Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
