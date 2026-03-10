import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('CRITICAL: DATABASE_URL is missing in production environment!');
    }
    console.warn('[Prisma] WARNING: DATABASE_URL is missing, falling back to local dev port 5434.');
}

if (connectionString?.includes('[YOUR-PASSWORD]')) {
    console.error('[Prisma] CRITICAL: DATABASE_URL contains unreplaced "[YOUR-PASSWORD]" placeholder!');
}

// Diagnostic Log (Masked)
try {
    if (connectionString) {
        const url = new URL(connectionString);
        console.log(`[Prisma] Initializing with DB Host: ${url.host} (Port: ${url.port || 'default'})`);
    } else {
        console.log('[Prisma] No connection string found, using local fallback host.');
    }
} catch (e: any) {
    console.error('[Prisma] Connection string present but malformed:', e.message);
}

const finalConnectionString = (process.env.NODE_ENV === 'production' && connectionString)
    ? connectionString
    : (connectionString || 'postgresql://postgres:password@localhost:5434/resumebuilder');

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    let sslOptions: any = false;

    // The pg module's connection string parser overrides explicit ssl options if sslmode is in the query.
    // We remove it here so our explicit sslOptions take precedence.
    let connectionUrlForParsing = finalConnectionString;
    try {
        const urlArgs = new URL(connectionUrlForParsing);
        urlArgs.searchParams.delete('sslmode');
        connectionUrlForParsing = urlArgs.toString();
    } catch (e) {
        // Ignore URL parsing errors
    }

    if (process.env.NODE_ENV === 'production' || connectionUrlForParsing.includes('aivencloud.com') || connectionUrlForParsing.includes('supabase.co')) {
        try {
            if (process.env.DATABASE_CA_CERT) {
                // If provided via environment variable (useful for Vercel/Netlify)
                // Replace literal \n with actual newlines in case it was stored as a single line
                const caContent = process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n');
                sslOptions = {
                    rejectUnauthorized: true,
                    ca: caContent
                };
            } else {
                // Read the CA cert from disk (useful for local dev or Docker)
                const caPath = path.resolve(process.cwd(), 'prisma', 'ca.pem');
                if (fs.existsSync(caPath)) {
                    sslOptions = {
                        rejectUnauthorized: true,
                        ca: fs.readFileSync(caPath).toString()
                    };
                } else {
                    // Fallback to ignoring unauthorized if cert is missing but required
                    sslOptions = { rejectUnauthorized: false };
                }
            }
        } catch (e) {
            console.error('Error loading CA certificate:', e);
            sslOptions = { rejectUnauthorized: false };
        }
    }

    const pool = new pg.Pool({
        connectionString: connectionUrlForParsing,
        ssl: sslOptions
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter } as unknown as any);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
