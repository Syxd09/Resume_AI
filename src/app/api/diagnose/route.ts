import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const secret = searchParams.get('secret');
        if (secret !== 'saturn-diagnose-123') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        const info = {
            env: {
                projectId: projectId || 'missing',
                clientEmail: clientEmail ? `${clientEmail.substring(0, 10)}...` : 'missing',
                privateKey: privateKey ? {
                    length: privateKey.length,
                    startsWithHeader: privateKey.includes('-----BEGIN PRIVATE KEY-----'),
                    endsWithFooter: privateKey.includes('-----END PRIVATE KEY-----'),
                    hasNewlines: privateKey.includes('\n'),
                    hasCarriageReturns: privateKey.includes('\r'),
                    hasEscapedNewlines: privateKey.includes('\\n'),
                } : 'missing',
            },
            firestoreTest: 'not_started',
        };

        try {
            const db = getAdminDb();
            // Test query on users collection (limit 1)
            const snap = await db.collection('users').limit(1).get();
            info.firestoreTest = `success (empty: ${snap.empty})`;
        } catch (dbErr: any) {
            info.firestoreTest = `error: ${dbErr.message || dbErr}`;
        }

        return NextResponse.json(info);
    } catch (err: any) {
        return NextResponse.json({ error: err.message || err }, { status: 500 });
    }
}
