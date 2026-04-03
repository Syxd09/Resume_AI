export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { name, email: rawEmail, password } = await req.json();
        const email = rawEmail?.toLowerCase().trim();

        if (!email || !password || password.length < 6) {
            return NextResponse.json({ error: 'Valid email and password (min 6 chars) are required.' }, { status: 400 });
        }

        // 1. Check if user already exists in Firebase Auth
        try {
            await adminAuth.getUserByEmail(email);
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        } catch (authErr: any) {
            // Error means user doesn't exist, which is what we want
            if (authErr.code !== 'auth/user-not-found') {
                throw authErr;
            }
        }

        // 2. Create user in Firebase Auth
        const hashedPassword = await bcrypt.hash(password, 12);
        const userRecord = await adminAuth.createUser({
            email,
            password, // Firebase handles its own hashing, but we can store the bcrypt one in DB if needed. 
                      // Actually, if using Firebase Auth, we don't need bcrypt here, 
                      // but let's keep the user's password in Firestore for compatibility if they were using it.
            displayName: name || email.split('@')[0],
        });

        const uid = userRecord.uid;

        // 3. Create Firestore records atomically
        await adminDb.runTransaction(async (transaction) => {
            const userRef = adminDb.collection('users').doc(uid);
            const transRef = adminDb.collection('transactions').doc();

            const userData = {
                id: uid,
                name: name || email.split('@')[0],
                email,
                password: hashedPassword, // Store hash for custom server-side verification
                credits: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const bonusTransaction = {
                userId: uid,
                amount: 10,
                type: 'BONUS',
                description: 'Welcome bonus — 10 free credits on signup',
                createdAt: new Date().toISOString(),
            };

            transaction.set(userRef, userData);
            transaction.set(transRef, bonusTransaction);
        });

        return NextResponse.json({
            success: true,
            user: { id: uid, name: name || email.split('@')[0], email, credits: 10 },
        });
    } catch (err: any) {
        console.error('[Register] Registration error:', err);
        return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }
}
