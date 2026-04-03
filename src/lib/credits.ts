import { adminDb } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

// Credit costs for each action
export const CREDIT_COSTS: Record<string, number> = {
    GENERATE_RESUME: 2,
    PARSE_RESUME: 1,
    ATS_SCORE: 1,
    COVER_LETTER: 2,
    REWRITE_BULLETS: 1,
    AI_SUGGEST: 0, // free
};

export interface CreditResult {
    success: boolean;
    remaining: number;
    error?: string;
}

/**
 * Deduct credits from a user's account and log the transaction.
 */
export async function deductCredits(
    userId: string,
    action: keyof typeof CREDIT_COSTS,
    description: string
): Promise<CreditResult> {
    const cost = CREDIT_COSTS[action];

    if (cost === 0) {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        return { success: true, remaining: userDoc.data()?.credits ?? 0 };
    }

    try {
        const result = await adminDb.runTransaction(async (transaction) => {
            const userRef = adminDb.collection('users').doc(userId);
            const userDoc = await transaction.get(userRef);

            if (!userDoc.exists) {
                throw new Error('User not found');
            }

            const currentCredits = userDoc.data()?.credits ?? 0;

            if (currentCredits < cost) {
                return { 
                    success: false, 
                    remaining: currentCredits, 
                    error: `Insufficient credits. Need ${cost}, have ${currentCredits}.` 
                };
            }

            const newCredits = currentCredits - cost;

            // Update user credits
            transaction.update(userRef, { 
                credits: newCredits,
                updatedAt: new Date().toISOString()
            });

            // Log transaction
            const transRef = adminDb.collection('transactions').doc();
            transaction.set(transRef, {
                userId,
                amount: -cost,
                type: 'USAGE',
                description,
                createdAt: new Date().toISOString()
            });

            return { success: true, remaining: newCredits };
        });

        return result;
    } catch (error: any) {
        console.error('[Credits] Deduction error:', error);
        return { success: false, remaining: 0, error: error.message };
    }
}

/**
 * Check if a user has enough credits for an action WITHOUT deducting.
 */
export async function checkCredits(
    userId: string,
    action: keyof typeof CREDIT_COSTS
): Promise<{ allowed: boolean; balance: number; cost: number }> {
    const cost = CREDIT_COSTS[action];
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) return { allowed: false, balance: 0, cost };
    
    const balance = userDoc.data()?.credits ?? 0;
    
    if (cost === 0) return { allowed: true, balance, cost: 0 };
    
    return { allowed: balance >= cost, balance, cost };
}

/**
 * Refund credits back to a user.
 */
export async function refundCredits(
    userId: string,
    action: keyof typeof CREDIT_COSTS,
    reason: string
): Promise<CreditResult> {
    const cost = CREDIT_COSTS[action];
    const userRef = adminDb.collection('users').doc(userId);

    if (cost === 0) {
        const userDoc = await userRef.get();
        return { success: true, remaining: userDoc.data()?.credits ?? 0 };
    }

    try {
        await userRef.update({
            credits: FieldValue.increment(cost),
            updatedAt: new Date().toISOString()
        });

        const transRef = adminDb.collection('transactions').doc();
        await transRef.set({
            userId,
            amount: cost,
            type: 'REFUND',
            description: `Refund: ${reason}`,
            createdAt: new Date().toISOString()
        });

        const userDoc = await userRef.get();
        return { success: true, remaining: userDoc.data()?.credits ?? 0 };
    } catch (error: any) {
        console.error('[Credits] Refund error:', error);
        return { success: false, remaining: 0, error: error.message };
    }
}

/**
 * Add credits to a user's account.
 */
export async function addCredits(
    userId: string,
    amount: number,
    type: 'PURCHASE' | 'BONUS',
    description: string
): Promise<CreditResult> {
    const userRef = adminDb.collection('users').doc(userId);

    try {
        await userRef.update({
            credits: FieldValue.increment(amount),
            updatedAt: new Date().toISOString()
        });

        const transRef = adminDb.collection('transactions').doc();
        await transRef.set({
            userId,
            amount,
            type,
            description,
            createdAt: new Date().toISOString()
        });

        const userDoc = await userRef.get();
        return { success: true, remaining: userDoc.data()?.credits ?? 0 };
    } catch (error: any) {
        console.error('[Credits] Add credits error:', error);
        return { success: false, remaining: 0, error: error.message };
    }
}

/**
 * Get a user's credit balance and recent transactions.
 */
export async function getUserCredits(userId: string) {
    try {
        const userDoc = await adminDb.collection('users').doc(userId).get();
        
        const transactionsSnap = await adminDb.collection('transactions')
            .where('userId', '==', userId)
            // .orderBy('createdAt', 'desc') // Temporarily disabled: requires Firestore index
            .limit(20)
            .get();

        const transactions = transactionsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        // Sort manually for now to avoid requiring a composite index immediately
        transactions.sort((a: any, b: any) => 
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );

        return {
            balance: userDoc.data()?.credits ?? 0,
            transactions,
        };
    } catch (error: any) {
        console.error('[Credits] getUserCredits error:', error);
        return {
            balance: 0,
            transactions: [],
            error: error.message
        };
    }
}
