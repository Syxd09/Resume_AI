import { NextResponse } from 'next/server';
import { getUserCredits } from '@/lib/credits';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = (session.user as any).id;
        const result = await getUserCredits(userId);

        return NextResponse.json(result);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 });
    }
}
