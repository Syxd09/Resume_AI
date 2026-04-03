export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAdminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!(session?.user as any)?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session!.user as any).id;
        const { provider } = await req.json();

        if (!provider || typeof provider !== 'string') {
            return NextResponse.json({ error: 'Provider is required' }, { status: 400 });
        }

        const db = getAdminDb();
        // Attempt to delete the account binding from Firestore 'accounts' collection
        const accountsRef = db.collection('accounts');
        const querySnapshot = await accountsRef
            .where('userId', '==', userId)
            .where('provider', '==', provider.toLowerCase())
            .get();

        if (querySnapshot.empty) {
            return NextResponse.json({ error: 'No matching account found to disconnect.' }, { status: 404 });
        }

        const batch = db.batch();
        querySnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();

        return NextResponse.json({ success: true, message: `Successfully disconnected ${provider}.` });
    } catch (error: any) {
        console.error('Profile disconnect error:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal server error while disconnecting profile' },
            { status: 500 }
        );
    }
}
