export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const body = await req.json();
        const { name, phone, address, image } = body;

        const userRef = adminDb.collection('users').doc(userId);
        const updateData: any = {
            updatedAt: new Date().toISOString()
        };
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (image !== undefined) updateData.image = image;

        await userRef.update(updateData);
        const updated = await userRef.get();
        const userData = updated.data()!;

        return NextResponse.json({
            success: true,
            user: {
                id: updated.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                address: userData.address,
                image: userData.image
            }
        });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json(
            { error: error?.message || 'Internal server error while updating profile' },
            { status: 500 }
        );
    }
}
