
// Shared in-memory store for verification codes
// Note: In production with multiple server instances or serverless functions,
// this should be replaced with Redis or a database table.

interface VerificationData {
    code: string;
    expiry: number;
}

// Use global object to persist store across hot reloads in development
const globalStore = global as any;

if (!globalStore.verificationCodes) {
    globalStore.verificationCodes = new Map<string, VerificationData>();
}

const store = globalStore.verificationCodes as Map<string, VerificationData>;

export function storeVerificationCode(roomId: string, email: string, code: string) {
    const key = `${roomId}:${email.toLowerCase()}`;
    const expiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    store.set(key, { code, expiry });
    console.log(`[STORE] Stored code for ${key}`);
}

export function validateVerificationCode(roomId: string, email: string, code: string): { success: boolean; error?: string } {
    const key = `${roomId}:${email.toLowerCase()}`;
    const stored = store.get(key);

    console.log(`[STORE] Verifying ${key}. Found: ${!!stored}`);

    if (!stored) {
        return { success: false, error: 'No code found. Please request a new one.' };
    }

    if (Date.now() > stored.expiry) {
        store.delete(key);
        return { success: false, error: 'Code expired. Please request a new one.' };
    }

    if (stored.code !== code) {
        return { success: false, error: 'Invalid code' };
    }

    // Success - clean up
    store.delete(key);
    return { success: true };
}
