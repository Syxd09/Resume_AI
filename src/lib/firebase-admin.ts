import * as admin from "firebase-admin";

/**
 * Lazy initializer for Firebase Admin SDK.
 * This prevents the SDK from trying to initialize during Next.js build-time static analysis,
 * which often fails due to missing or improperly formatted environment variables.
 */
function initializeFirebaseAdmin(): admin.app.App {
    if (admin.apps.length > 0) return admin.apps[0]!;

    let privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    if (privateKey) {
        // 1. Clean the string of all potential formatting quirks:
        // - Convert literal "\\n" to actual newlines
        // - Strip Windows-specific carriage returns (\r) which break PEM headers
        // - Remove surrounding quotes added by some .env loaders
        privateKey = privateKey
            .replace(/\\n/g, '\n')
            .replace(/\r/g, '')
            .replace(/^"(.*)"$/, '$1')
            .trim();
            
        // 2. Ensure basic PEM structure:
        // If it starts with the header but has no newlines in the body (one-liner),
        // we must at least separate the header and footer for many Node.js versions.
        if (privateKey.startsWith('-----BEGIN PRIVATE KEY-----') && !privateKey.includes('\n', 27)) {
             privateKey = privateKey
                 .replace('-----BEGIN PRIVATE KEY-----', '-----BEGIN PRIVATE KEY-----\n')
                 .replace('-----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----');
        }
    }

    try {
        if (clientEmail && privateKey && projectId) {
            console.log(`[Firebase Admin] Initializing for project: ${projectId}`);
            return admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        } else {
            // Log exactly what is missing to help with debugging the 401
            const missing = [];
            if (!projectId) missing.push('PROJECT_ID');
            if (!clientEmail) missing.push('CLIENT_EMAIL');
            if (!privateKey) missing.push('PRIVATE_KEY');
            
            console.warn(`[Firebase Admin] Missing required credentials: ${missing.join(', ')}. Falling back...`);
            return admin.initializeApp({ projectId: projectId || 'fallback-id' });
        }
    } catch (error: any) {
        console.error("[Firebase Admin] Initialization error during runtime:", error.message);
        throw error;
    }
}

/**
 * Getter for Firebase Auth Admin.
 * Call this inside your API routes or server actions to ensure lazy initialization.
 */
export const getAdminAuth = () => {
    return admin.auth(initializeFirebaseAdmin());
};

/**
 * Getter for Firestore Admin.
 * Call this inside your API routes or server actions to ensure lazy initialization.
 */
export const getAdminDb = () => {
    return admin.firestore(initializeFirebaseAdmin());
};

// Also export the raw admin object if needed, but discouraged for direct service access
export { admin as firebaseAdmin };
