'use server';

import { supabaseAdmin } from './server-db';

/**
 * VQC Economy Security Module
 * 
 * Every coin transaction MUST go through this module to create
 * a verifiable receipt. Coins without receipts are invalid.
 */

export type ReceiptType = 'EARN' | 'SPEND' | 'TRANSFER' | 'MINT' | 'GIFT' | 'REFUND';

export interface CreateReceiptParams {
    userId: string;
    amount: number; // Positive for gains, negative for losses
    type: ReceiptType;
    reason: string;
    referenceId?: string;
    metadata?: Record<string, any>;
}

export interface Receipt {
    id: string;
    user_id: string;
    amount: number;
    type: ReceiptType;
    reason: string;
    reference_id: string | null;
    balance_before: number;
    balance_after: number;
    metadata: Record<string, any>;
    verified: boolean;
    created_at: string;
}

/**
 * Creates a receipt and updates user balance atomically.
 * This is the ONLY way to change a user's coin balance.
 */
export async function createCoinTransaction(params: CreateReceiptParams): Promise<{
    success: boolean;
    receipt?: Receipt;
    newBalance?: number;
    error?: string;
}> {
    const { userId, amount, type, reason, referenceId, metadata } = params;

    try {
        // 1. Get current balance
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('coins')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return { success: false, error: 'User not found' };
        }

        const balanceBefore = user.coins || 0;
        const balanceAfter = balanceBefore + amount;

        // 2. Validate transaction
        if (balanceAfter < 0) {
            return { success: false, error: 'Insufficient balance' };
        }

        // 3. Create receipt
        const { data: receipt, error: receiptError } = await supabaseAdmin
            .from('coin_receipts')
            .insert({
                user_id: userId,
                amount,
                type,
                reason,
                reference_id: referenceId || null,
                balance_before: balanceBefore,
                balance_after: balanceAfter,
                metadata: metadata || {},
                verified: true
            })
            .select()
            .single();

        if (receiptError) {
            console.error('Receipt creation failed:', receiptError);
            return { success: false, error: 'Failed to create receipt' };
        }

        // 4. Update user balance
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ coins: balanceAfter })
            .eq('id', userId);

        if (updateError) {
            // Rollback: Delete the receipt if balance update failed
            await supabaseAdmin
                .from('coin_receipts')
                .delete()
                .eq('id', receipt.id);

            console.error('Balance update failed:', updateError);
            return { success: false, error: 'Failed to update balance' };
        }

        return {
            success: true,
            receipt,
            newBalance: balanceAfter
        };

    } catch (error) {
        console.error('Transaction error:', error);
        return { success: false, error: 'Transaction failed' };
    }
}

/**
 * Verifies that a user's balance matches their receipt history.
 * Returns the discrepancy if any.
 */
export async function auditUserBalance(userId: string): Promise<{
    valid: boolean;
    currentBalance: number;
    calculatedBalance: number;
    discrepancy: number;
    receiptCount: number;
}> {
    // Get current balance
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('coins')
        .eq('id', userId)
        .single();

    const currentBalance = user?.coins || 0;

    // Sum all receipts
    const { data: receipts } = await supabaseAdmin
        .from('coin_receipts')
        .select('amount')
        .eq('user_id', userId);

    const calculatedBalance = (receipts || []).reduce((sum: number, r: { amount: number }) => sum + r.amount, 0);
    const discrepancy = currentBalance - calculatedBalance;

    return {
        valid: discrepancy === 0,
        currentBalance,
        calculatedBalance,
        discrepancy,
        receiptCount: receipts?.length || 0
    };
}

/**
 * Gets receipt history for a user
 */
export async function getUserReceipts(userId: string, limit = 50): Promise<Receipt[]> {
    const { data } = await supabaseAdmin
        .from('coin_receipts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    return data || [];
}

/**
 * Admin: Flags suspicious coins (balance without receipts)
 */
export async function scanForUnreceiptedCoins(): Promise<{
    flaggedUsers: Array<{ userId: string; discrepancy: number }>;
}> {
    // Get all users with coins
    const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, coins')
        .gt('coins', 0);

    const flaggedUsers: Array<{ userId: string; discrepancy: number }> = [];

    for (const user of users || []) {
        const audit = await auditUserBalance(user.id);
        if (!audit.valid && audit.discrepancy > 0) {
            flaggedUsers.push({
                userId: user.id,
                discrepancy: audit.discrepancy
            });
        }
    }

    return { flaggedUsers };
}
