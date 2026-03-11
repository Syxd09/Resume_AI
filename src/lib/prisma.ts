import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error('[Prisma] CRITICAL: DATABASE_URL is not defined in environment variables.');
} else {
    try {
        const url = new URL(dbUrl);
        console.log(`[Prisma] Database URL detected. Host: ${url.host}`);
    } catch (e) {
        console.error('[Prisma] DATABASE_URL is present but not a valid URL.');
    }
}

const prismaClientOptions: any = {
    datasourceUrl: dbUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
