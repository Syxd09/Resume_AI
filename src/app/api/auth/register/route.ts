import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { name, email: rawEmail, password } = await req.json();
        const email = rawEmail?.toLowerCase().trim();

        if (!email || !password || password.length < 6) {
            return NextResponse.json({ error: 'Valid email and password (min 6 chars) are required.' }, { status: 400 });
        }

        // Use a transaction to ensure both user and signup bonus are created or none
        const result = await prisma.$transaction(async (tx) => {
            const existing = await tx.user.findUnique({ where: { email } });
            if (existing) {
                throw new Error('ALREADY_EXISTS');
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const user = await tx.user.create({
                data: {
                    name: name || email.split('@')[0],
                    email,
                    password: hashedPassword,
                    credits: 10,
                },
            });

            await tx.transaction.create({
                data: {
                    userId: user.id,
                    amount: 10,
                    type: 'BONUS',
                    description: 'Welcome bonus — 10 free credits on signup',
                },
            });

            return user;
        });

        return NextResponse.json({
            success: true,
            user: { id: result.id, name: result.name, email: result.email, credits: result.credits },
        });
    } catch (err: any) {
        if (err.message === 'ALREADY_EXISTS') {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }
        console.error('[Register] Registration error:', err);
        return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }
}
