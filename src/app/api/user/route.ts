export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

// GET: fetch user profile
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({ 
            user: { id: userDoc.id, ...userDoc.data() } 
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH: update profile
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    try {
        const { name, email } = await req.json();

        // Check if email is taken by another user
        if (email) {
            const existingSnap = await adminDb.collection('users')
                .where('email', '==', email)
                .get();
            
            const otherUser = existingSnap.docs.find(doc => doc.id !== userId);
            if (otherUser) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
        }

        const userRef = adminDb.collection('users').doc(userId);
        const updateData: any = {
            updatedAt: new Date().toISOString()
        };
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        await userRef.update(updateData);
        const updated = await userRef.get();

        return NextResponse.json({ 
            user: { id: updated.id, ...updated.data() } 
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE: delete account
export async function DELETE() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    try {
        await adminDb.collection('users').doc(userId).delete();
        // Note: In a real app, you'd also delete their resumes, etc., or use a Cloud Function
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
