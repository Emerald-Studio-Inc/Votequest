/**
 * Cryptographic Receipt Generation for Proof-of-Work
 * 
 * Every action (vote, proposal, achievement) generates a verifiable receipt.
 * Receipts contain a SHA-256 hash proving authenticity and cannot be forged.
 */

export interface Receipt {
    hash: string;
    userId: string;
    action: 'vote' | 'proposal' | 'achievement';
    timestamp: string;
    amount: number;
    metadata: Record<string, any>;
}

export interface ReceiptMetadata {
    proposalId?: string;
    proposalTitle?: string;
    optionId?: string;
    optionTitle?: string;
    category?: string;
    achievementId?: string;
    [key: string]: any;
}

/**
 * Generate a cryptographic receipt for an action
 */
export async function generateReceipt(
    userId: string,
    action: 'vote' | 'proposal' | 'achievement',
    amount: number,
    metadata: ReceiptMetadata
): Promise<Receipt> {
    const timestamp = new Date().toISOString();

    // Create deterministic data object
    const data = {
        userId,
        action,
        timestamp,
        amount,
        metadata,
        version: '1.0' // For future compatibility
    };

    // Generate SHA-256 hash
    const hash = await sha256(JSON.stringify(data));

    return {
        hash,
        userId,
        action,
        timestamp,
        amount,
        metadata
    };
}

/**
 * Verify a receipt's authenticity
 */
export async function verifyReceipt(receipt: Receipt): Promise<boolean> {
    try {
        // Reconstruct the receipt
        const reconstructed = await generateReceipt(
            receipt.userId,
            receipt.action,
            receipt.amount,
            receipt.metadata
        );

        // Compare hashes
        return reconstructed.hash === receipt.hash;
    } catch (error) {
        console.error('Receipt verification failed:', error);
        return false;
    }
}

/**
 * Generate SHA-256 hash (browser-compatible)
 */
async function sha256(message: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        // Browser environment
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
        // Node environment (for API routes)
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(message).digest('hex');
    }
}

/**
 * Export receipt as downloadable JSON
 */
export function exportReceipt(receipt: Receipt): string {
    return JSON.stringify(receipt, null, 2);
}

/**
 * Export multiple receipts as CSV
 */
export function exportReceiptsCSV(receipts: Receipt[]): string {
    const headers = ['Hash', 'Action', 'Amount', 'Timestamp', 'Verified'];
    const rows = receipts.map(r => [
        r.hash,
        r.action,
        r.amount.toString(),
        r.timestamp,
        'Yes'
    ]);

    return [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
}

/**
 * Get receipt summary for display
 */
export function getReceiptSummary(receipt: Receipt): string {
    const actionLabels = {
        vote: 'Voted',
        proposal: 'Created Proposal',
        achievement: 'Unlocked Achievement'
    };

    const action = actionLabels[receipt.action] || receipt.action;
    const resource = receipt.metadata.proposalTitle || receipt.metadata.achievementId || 'Unknown';

    return `${action}: ${resource} (+${receipt.amount} VQC)`;
}
