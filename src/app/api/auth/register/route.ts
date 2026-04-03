export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { email, password, name } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const auth = getAdminAuth();
        const db = getAdminDb();

        // 1. Create user in Firebase Auth
        const userRecord = await auth.createUser({
            email,
            password,
            displayName: name || email.split('@')[0],
        });

        // 2. Hash password for local Firestore storage (optional, for manual verification)
        const hashedPassword = await bcrypt.hash(password, 12);

        // 3. Initialize user document in Firestore with welcome credits
        const userRef = db.collection('users').doc(userRecord.uid);
        
        await db.runTransaction(async (transaction) => {
            transaction.set(userRef, {
                id: userRecord.uid,
                email,
                name: name || email.split('@')[0],
                password: hashedPassword, // Stored for manual verification if needed
                credits: 10, // Initial welcome credits
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            // Log the "Welcome Bonus" transaction
            const transRef = db.collection('transactions').doc();
            transaction.set(transRef, {
                userId: userRecord.uid,
                amount: 10,
                type: 'BONUS',
                description: 'Welcome Bonus',
                createdAt: new Date().toISOString(),
            });
        });

        return NextResponse.json({ 
            success: true, 
            userId: userRecord.uid,
            message: 'User registered successfully with 10 welcome credits.' 
        });

    } catch (error: any) {
        console.error('Registration error:', error);
        
        if (error.code === 'auth/email-already-exists') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }
        
        return NextResponse.json({ error: error.message || 'Internal server error during registration' }, { status: 500 });
    }
}
