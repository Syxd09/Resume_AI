export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import bcrypt from 'bcryptjs';

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Both current and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });
    }

    try {
        const userRef = adminDb.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        if (!userDoc.exists || !userData?.password) {
            return NextResponse.json({ error: 'Password not set for this account (OAuth account?).' }, { status: 400 });
        }

        const valid = await bcrypt.compare(currentPassword, userData.password);
        if (!valid) {
            return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 403 });
        }

        const hashed = await bcrypt.hash(newPassword, 12);

        // Update both Firebase Auth and Firestore
        await Promise.all([
            adminAuth.updateUser(userId, { password: newPassword }),
            userRef.update({ password: hashed, updatedAt: new Date().toISOString() })
        ]);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[Password Update] Error:', error);
        return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
    }
}
