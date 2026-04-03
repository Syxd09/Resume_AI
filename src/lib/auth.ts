import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import LinkedInProvider from 'next-auth/providers/linkedin';
import { getAdminAuth, getAdminDb } from '@/lib/firebase-admin';

const providers: NextAuthOptions['providers'] = [
    CredentialsProvider({
        name: 'Firebase',
        credentials: {
            idToken: { label: 'Token', type: 'text' },
        },
        async authorize(credentials) {
            if (!credentials?.idToken) {
                console.error('[Auth] [Credentials] 401: No idToken provided in request body');
                return null;
            }

            try {
                const auth = getAdminAuth();
                const db = getAdminDb();

                console.log('[Auth] [Credentials] Attempting to verify ID Token...');
                const decodedToken = await auth.verifyIdToken(credentials.idToken);
                
                if (!decodedToken) {
                    console.error('[Auth] [Credentials] 401: verifyIdToken returned null or undefined');
                    return null;
                }

                const { email, name, picture, uid } = decodedToken;
                console.log(`[Auth] [Credentials] Identity verified: ${email} (UID: ${uid})`);

                if (!email) {
                    console.error('[Auth] [Credentials] 401: Decoded token matches a user but contains no email scope');
                    return null;
                }

                try {
                    const userRef = db.collection('users').doc(uid);
                    const userDoc = await userRef.get();

                    let userData;
                    if (!userDoc.exists) {
                        console.log(`[Auth] [Credentials] Initializing first-time profile for: ${email}`);
                        userData = {
                            id: uid,
                            email,
                            name: name || email.split('@')[0],
                            image: picture || null,
                            credits: 10,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        };
                        await userRef.set(userData);
                    } else {
                        userData = userDoc.data();
                    }

                    return { 
                        id: uid, 
                        email: userData?.email, 
                        name: userData?.name, 
                        credits: userData?.credits,
                        image: userData?.image 
                    };
                } catch (dbError: any) {
                    console.error('[Auth] [Credentials] 500: Datastore sync failed during authorization:', dbError.message || dbError);
                    // We throw here so NextAuth captures the error rather than a silent 401
                    throw new Error(`Datastore Error: ${dbError.message || 'Unknown'}`);
                }
            } catch (error: any) {
                console.error('[Auth] [Credentials] 401: Firebase Admin verification failed:', error.message || error);
                return null;
            }
        },
    }),
];

// Add Google OAuth if configured (Fallback for direct NextAuth usage)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        })
    );
}

export const authOptions: NextAuthOptions = {
    // We are no longer using PrismaAdapter to avoid Supabase dependency
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: 'jwt' },
    pages: { signIn: '/auth/signin' },
    providers,
    callbacks: {
        async signIn({ user, account }) {
            // Silently synchronize user to Firestore if signing in via non-credentials provider
            if (account && account.provider !== 'credentials' && user.email) {
                try {
                    const db = getAdminDb();
                    const userRef = db.collection('users').doc(user.id);
                    const userDoc = await userRef.get();
                    if (!userDoc.exists) {
                        await userRef.set({
                            id: user.id || account.providerAccountId,
                            email: user.email,
                            name: user.name || user.email.split('@')[0],
                            image: user.image || null,
                            credits: 10,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                        });
                    }
                } catch (err) {
                    console.error('[Auth] OAuth Sync Error:', err);
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.credits = (user as { credits?: number }).credits;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { id?: string }).id = token.id as string;

                try {
                    // Fetch latest user details from Firestore
                    const db = getAdminDb();
                    const userDoc = await db.collection('users').doc(token.id as string).get();
                    if (userDoc.exists) {
                        const dbUser = userDoc.data();
                        (session.user as any).credits = dbUser?.credits ?? 0;
                        (session.user as any).name = dbUser?.name;
                        (session.user as any).image = dbUser?.image;
                    }
                } catch (err) {
                    console.error('[Auth] Session Sync Error:', err);
                }
            }
            return session;
        },
    },
};
