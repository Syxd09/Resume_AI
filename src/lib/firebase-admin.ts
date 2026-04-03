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
        // Handle literal "\n" characters
        if (privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
        }
        
        // Remove surrounding double quotes
        if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
            privateKey = privateKey.substring(1, privateKey.length - 1);
        }
    }

    try {
        if (clientEmail && privateKey && projectId) {
            return admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        } else {
            // Fallback for build time or locally unconfigured environments
            return admin.initializeApp({ projectId });
        }
    } catch (error: any) {
        // Only log errors if we're NOT in the build phase, or if it's a real runtime error
        console.error("[Firebase Admin] Initialization error:", error.message);
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
