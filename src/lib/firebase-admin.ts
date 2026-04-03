import * as admin from "firebase-admin";

let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey) {
    // 1. Handle literal "\n" characters commonly found in .env files or copy-pasted keys
    if (privateKey.includes('\\n')) {
        privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    // 2. Remove any surrounding double quotes that might have been accidentally pasted in Vercel/env
    if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.substring(1, privateKey.length - 1);
    }
}

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

if (!admin.apps.length) {
    try {
        if (clientEmail && privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
            console.log("[Firebase Admin] Initialized with Service Account");
        } else {
            // Fallback: This allows the app to start, but server-side functionality will be limited
            admin.initializeApp({ projectId });
            console.warn("[Firebase Admin] Initialized with Project ID only. (Missing clientEmail or privateKey)");
        }
    } catch (error: any) {
        // Log more detail to help debug Vercel build issues
        console.error("[Firebase Admin] Initialization error:", error.message);
        if (error.stack) console.debug(error.stack);
    }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
