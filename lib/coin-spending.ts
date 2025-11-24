import { supabase } from './supabase';
import type { NotificationPayload } from './notification-types';

export const SPENDING_COSTS = {
    VOTING_BOOST: 500,
    PROPOSAL_HIGHLIGHT: 200,
    CUSTOM_BADGE: 1000
} as const;

// ==================== Notification Functions ====================

export async function createNotification(
    userId: string,
    payload: NotificationPayload
): Promise<void> {
    try {
        await supabase.from('notifications').insert({
            user_id: userId,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            proposal_id: payload.proposal_id,
            metadata: payload.metadata,
            read: false
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
}

// ==================== Coin Spending Functions ====================

export async function boostVotingPower(
    userId: string,
    proposalId: string,
    optionId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // 1. Check user has enough coins
        const { data: user } = await supabase
            .from('users')
            .select('coins')
            .eq('id', userId)
            .single();

        if (!user || (user.coins || 0) < SPENDING_COSTS.VOTING_BOOST) {
            return { success: false, error: 'Insufficient coins' };
        }

        // 2. Check if user already voted on this proposal
        const { data: existingVote } = await supabase
            .from('votes')
            .select('power_boost')
            .eq('user_id', userId)
            .eq('proposal_id', proposalId)
            .single();

        if (!existingVote) {
            return { success: false, error: 'You must vote first before boosting' };
        }

        if (existingVote.power_boost) {
            return { success: false, error: 'Already boosted this vote' };
        }

        // 3. Deduct coins (atomic operation to prevent race condition)
        // Use RPC to ensure atomic update with balance check
        const { data: updatedUser, error: updateError } = await supabase
            .rpc('deduct_coins', {
                user_id: userId,
                amount: SPENDING_COSTS.VOTING_BOOST
            });

        if (updateError || !updatedUser) {
            return { success: false, error: 'Insufficient coins or update failed' };
        }

        // 4. Record transaction
        await supabase.from('coin_transactions').insert({
            user_id: userId,
            amount: -SPENDING_COSTS.VOTING_BOOST,
            transaction_type: 'spend_boost',
            description: 'Boosted voting power',
            proposal_id: proposalId,
            metadata: { option_id: optionId }
        });

        // 5. Update vote with boost flag
        await supabase
            .from('votes')
            .update({
                power_boost: true,
                boost_multiplier: 2.0
            })
            .eq('user_id', userId)
            .eq('proposal_id', proposalId);

        // 6. Notify user
        await createNotification(userId, {
            type: 'boost_activated',
            title: '🚀 Vote Boosted!',
            message: 'Your vote now counts 2x on this proposal',
            proposal_id: proposalId
        });

        return { success: true };
    } catch (error) {
        console.error('Boost error:', error);
        return { success: false, error: 'Failed to boost vote' };
    }
}

export async function highlightProposal(
    userId: string,
    proposalId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // 1. Check user has enough coins
        const { data: user } = await supabase
            .from('users')
            .select('coins')
            .eq('id', userId)
            .single();

        if (!user || (user.coins || 0) < SPENDING_COSTS.PROPOSAL_HIGHLIGHT) {
            return { success: false, error: 'Insufficient coins' };
        }

        // 2. Check if user is the proposal creator
        const { data: proposal } = await supabase
            .from('proposals')
            .select('created_by, featured, title')
            .eq('id', proposalId)
            .single();

        if (!proposal) {
            return { success: false, error: 'Proposal not found' };
        }

        if (proposal.created_by !== userId) {
            return { success: false, error: 'Only the creator can highlight their proposal' };
        }

        if (proposal.featured) {
            return { success: false, error: 'Proposal is already featured' };
        }

        // 3. Deduct coins (atomic operation to prevent race condition)
        // Use RPC to ensure atomic update with balance check
        const { data: updatedUser, error: updateError } = await supabase
            .rpc('deduct_coins', {
                user_id: userId,
                amount: SPENDING_COSTS.PROPOSAL_HIGHLIGHT
            });

        if (updateError || !updatedUser) {
            return { success: false, error: 'Insufficient coins or update failed' };
        }

        // 4. Record transaction
        await supabase.from('coin_transactions').insert({
            user_id: userId,
            amount: -SPENDING_COSTS.PROPOSAL_HIGHLIGHT,
            transaction_type: 'spend_highlight',
            description: 'Featured proposal for 24 hours',
            proposal_id: proposalId
        });

        // 5. Feature the proposal for 24 hours
        const featuredUntil = new Date();
        featuredUntil.setHours(featuredUntil.getHours() + 24);

        await supabase
            .from('proposals')
            .update({
                featured: true,
                featured_until: featuredUntil.toISOString()
            })
            .eq('id', proposalId);

        // 6. Notify user
        await createNotification(userId, {
            type: 'proposal_featured',
            title: '📌 Proposal Featured',
            message: `"${proposal.title}" is now pinned for 24 hours`,
            proposal_id: proposalId
        });

        return { success: true };
    } catch (error) {
        console.error('Highlight error:', error);
        return { success: false, error: 'Failed to highlight proposal' };
    }
}
