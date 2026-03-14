import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL?.trim();

function createPrismaClient() {
    if (!dbUrl) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('DATABASE_URL is missing in production.');
        }
        // Fallback for local development
        return new PrismaClient();
    }

    try {
        // Test if URL is valid before creating the pool
        new URL(dbUrl);
    } catch (e) {
        console.error('[Prisma] CRITICAL: The DATABASE_URL environment variable is not a valid URL. Ensure special characters in your password are URL encoded (e.g., # as %23).');
        // In production, we want to crash rather than continue with a broken client
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Invalid DATABASE_URL format.');
        }
    }

    // Prisma 7 requires an adapter or accelerateUrl for direct TCP connections
    // Supabase requires SSL for all external connections.
    // The pooler hostname ends in .supabase.com, while direct ends in .supabase.co.
    const isSupabase = dbUrl.includes('supabase.co') || dbUrl.includes('supabase.com');

    const pool = new pg.Pool({
        connectionString: dbUrl,
        ssl: isSupabase ? { rejectUnauthorized: false } : false
    });

    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
