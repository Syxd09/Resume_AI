import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: fetch user profile
export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, credits: true, createdAt: true },
    });

    return NextResponse.json({ user });
}

// PATCH: update profile
export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    const { name, email } = await req.json();

    // Check if email is taken by another user
    if (email) {
        const existing = await prisma.user.findFirst({ where: { email, NOT: { id: userId } } });
        if (existing) return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { ...(name && { name }), ...(email && { email }) },
        select: { id: true, name: true, email: true },
    });

    return NextResponse.json({ user: updated });
}

// DELETE: delete account
export async function DELETE() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = (session.user as any).id;
    await prisma.user.delete({ where: { id: userId } });

    return NextResponse.json({ success: true });
}
