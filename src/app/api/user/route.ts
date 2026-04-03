export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';

// GET: fetch user profile
export async function GET() {
    const session: any = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    try {
        const db = getAdminDb();
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const userData = userDoc.data();

        // Fetch recent transactions
        const transactionsSnap = await db.collection('transactions')
            .where('userId', '==', userId)
            // .orderBy('createdAt', 'desc') // Need composite index for this
            .limit(10)
            .get();

        const transactions = transactionsSnap.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

        return NextResponse.json({ 
            user: {
                id: userDoc.id,
                ...userData
            },
            transactions 
        });
    } catch (error: any) {
        console.error('User GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }
}

// DELETE: clear account data (partial reset)
export async function DELETE() {
    const session: any = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    try {
        const db = getAdminDb();
        // Delete resumes
        const resumesSnap = await db.collection('resumes').where('userId', '==', userId).get();
        const batch = db.batch();
        resumesSnap.docs.forEach(doc => batch.delete(doc.ref));

        // Delete trackings
        const trackerSnap = await db.collection('trackings').where('userId', '==', userId).get();
        trackerSnap.docs.forEach(doc => batch.delete(doc.ref));

        await batch.commit();

        return NextResponse.json({ success: true, message: 'All data cleared successfully.' });
    } catch (error: any) {
        console.error('User data clear error:', error);
        return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 });
    }
}
