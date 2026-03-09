import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import Razorpay from 'razorpay';

const PACKAGES: Record<string, { amount: number; tokens: number; name: string }> = {
    starter: { amount: 500, tokens: 50, name: 'Starter Token Bundle' }, // ₹5.00
    professional: { amount: 1500, tokens: 200, name: 'Professional Token Bundle' }, // ₹15.00
    elite: { amount: 3000, tokens: 500, name: 'Elite Token Bundle' }, // ₹30.00
};

export async function POST(req: Request) {
    try {
        const session: any = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const key_id = process.env.RAZORPAY_KEY_ID;
        const key_secret = process.env.RAZORPAY_KEY_SECRET;

        if (!key_id || !key_secret) {
            return NextResponse.json({ error: 'Razorpay keys are missing' }, { status: 500 });
        }

        const { packageId } = await req.json();
        const pkg = PACKAGES[packageId];

        if (!pkg) {
            return NextResponse.json({ error: 'Invalid package selected' }, { status: 400 });
        }

        const razorpay = new Razorpay({
            key_id,
            key_secret,
        });

        // pkg.amount is already in paise according to PACKAGES definition
        const amountInPaise = pkg.amount;

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${Date.now()}_${session.user.id}`.substring(0, 40),
            notes: {
                userId: session.user.id,
                tokensToAdd: pkg.tokens.toString(),
                packageId: packageId
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            keyId: key_id,
            tokens: pkg.tokens,
            name: pkg.name
        });

    } catch (error: any) {
        console.error('Razorpay Create Order Error:', error);
        return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
    }
}
