import { supabaseAdmin } from './server-db';
import { generateReceipt, type ReceiptMetadata } from './receipts';

/**
 * Award coins to a user and create a transaction record
 */
export async function awardCoins(
    userId: string,
    amount: number,
    reason: string,
    proposalId?: string,
    receiptMetadata?: ReceiptMetadata
): Promise<boolean> {
    try {
        // 1. Generate cryptographic receipt for proof-of-work
        let action: 'vote' | 'proposal' | 'achievement' = 'achievement';
        if (reason.includes('vote')) action = 'vote';
        if (reason.includes('proposal')) action = 'proposal';

        const receipt = await generateReceipt(
            userId,
            action,
            amount,
            receiptMetadata || {}
        );

        console.log(`📝 Generated receipt ${receipt.hash.slice(0, 12)}... for ${action}`);

        // 2. Update user's coin balance
        const { data: user, error: userError } = await supabaseAdmin
            .from('users')
            .select('coins')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            console.error('Error fetching user for coins:', userError);
            return false;
        }

        const newBalance = (user.coins || 0) + amount;

        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({ coins: newBalance })
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating user coins:', updateError);
            return false;
        }

        // 3. Create transaction record with receipt
        const { error: txError } = await supabaseAdmin
            .from('coin_transactions')
            .insert({
                user_id: userId,
                amount,
                reason,
                proposal_id: proposalId || null,
                receipt_hash: receipt.hash,
                action_metadata: receipt.metadata,
                verified: true
            });

        if (txError) {
            console.error('Error creating coin transaction:', txError);
            return false;
        }

        // 4. Create notification for coin reward
        await createNotification(
            userId,
            'coins_earned',
            `Earned ${amount} VQC!`,
            `You earned ${amount} VoteQuest Coins for ${reason.replace('_', ' ')}`,
            proposalId,
            { coins: amount }
        );

        console.log(`✅ Awarded ${amount} coins to user ${userId} for ${reason}`);
        return true;
    } catch (error) {
        console.error('Error awarding coins:', error);
        return false;
    }
}

/**
 * Create a notification for a user
 */
export async function createNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    proposalId?: string,
    metadata?: any
): Promise<boolean> {
    try {
        const { error } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_id: userId,
                type,
                title,
                message,
                proposal_id: proposalId || null,
                metadata: metadata || null,
                read: false
            });

        if (error) {
            console.error('Error creating notification:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error creating notification:', error);
        return false;
    }
}

/**
 * Get user's unread notifications
 */
export async function getUnreadNotifications(userId: string) {
    const { data, error } = await supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return data || [];
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

    if (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }

    return true;
}

/**
 * Get coin leaderboard (top users by coins)
 */
export async function getCoinLeaderboard(limit: number = 10) {
    const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, wallet_address, coins, level, xp')
        .order('coins', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
    }

    return data || [];
}

/**
 * Get user's coin transaction history
 */
export async function getCoinTransactions(userId: string, limit: number = 20) {
    const { data, error } = await supabaseAdmin
        .from('coin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching coin transactions:', error);
        return [];
    }

    return data || [];
}
