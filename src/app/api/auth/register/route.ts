import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        console.log('[Register] Starting registration process...');

        const { name, email, password } = await req.json();
        console.log('[Register] Request body parsed, email:', email);

        if (!email || !password) {
            console.log('[Register] Validation failed: missing email or password');
            return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
        }

        if (password.length < 6) {
            console.log('[Register] Validation failed: password too short');
            return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
        }

        console.log('[Register] Checking for existing user...');
        // Check if email already exists
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            console.log('[Register] User already exists:', email);
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }

        console.log('[Register] Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 12);

        console.log('[Register] Creating user in database...');
        const user = await prisma.user.create({
            data: {
                name: name || email.split('@')[0],
                email,
                password: hashedPassword,
                credits: 10,
            },
        });
        console.log('[Register] User created successfully, id:', user.id);

        // Log the signup bonus
        console.log('[Register] Creating transaction for signup bonus...');
        await prisma.transaction.create({
            data: {
                userId: user.id,
                amount: 10,
                type: 'BONUS',
                description: 'Welcome bonus — 10 free credits on signup',
            },
        });
        console.log('[Register] Transaction created successfully');

        return NextResponse.json({
            success: true,
            user: { id: user.id, name: user.name, email: user.email, credits: user.credits },
        });
    } catch (err: any) {
        console.error('[Register] Registration error:', err);
        console.error('[Register] Error name:', err.name);
        console.error('[Register] Error message:', err.message);
        console.error('[Register] Error code:', err.code);
        console.error('[Register] Error stack:', err.stack);
        return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }
}
