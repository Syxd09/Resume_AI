import * as admin from "firebase-admin";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

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
            // Fallback: This allows the app to start, though ID token verification might fail
            admin.initializeApp({ projectId });
            console.warn("[Firebase Admin] Initialized with Project ID only. Server-side session verification requires FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.");
        }
    } catch (error) {
        console.error("[Firebase Admin] Initialization error:", error);
    }
}

const adminAuth = admin.auth();
const adminDb = admin.firestore();

export { adminAuth, adminDb };
