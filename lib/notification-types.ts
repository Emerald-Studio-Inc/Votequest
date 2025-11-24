export type NotificationType =
    | 'vote_received'           // ✅ Already implemented
    | 'proposal_ending'         // ⚠️ New - 24h warning
    | 'proposal_ended'          // ⚠️ New - show results
    | 'coins_earned'           // ⚠️ New - VQC reward notification
    | 'streak_warning'         // ⚠️ New - haven't voted today
    | 'achievement_unlocked'   // ⚠️ New - gamification
    | 'new_proposal'           // ⚠️ New - in followed category
    | 'boost_activated'        // ⚠️ New - confirmation
    | 'proposal_featured';     // ⚠️ New - confirmation

export interface NotificationPayload {
    type: NotificationType;
    title: string;
    message: string;
    proposal_id?: string;
    metadata?: Record<string, any>;
}

export interface Notification {
    id: string;
    user_id: string;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    proposal_id?: string;
    metadata?: Record<string, any>;
}

// Notification message templates
export const NOTIFICATION_TEMPLATES = {
    coins_earned: (amount: number, reason: string) => ({
        title: `🪙 Earned ${amount} VQC!`,
        message: `You received ${amount} coins for ${reason}`
    }),

    proposal_ending: (title: string, hoursLeft: number) => ({
        title: '⏰ Proposal Ending Soon',
        message: `"${title}" ends in ${hoursLeft} hours`
    }),

    proposal_ended: (title: string, winningOption: string) => ({
        title: '🏁 Voting Ended',
        message: `"${title}" concluded. Winner: ${winningOption}`
    }),

    streak_warning: (streak: number) => ({
        title: '🔥 Maintain Your Streak!',
        message: `Don't lose your ${streak}-day streak! Vote today.`
    }),

    achievement_unlocked: (achievementName: string, xpReward: number) => ({
        title: '🏆 Achievement Unlocked!',
        message: `${achievementName} (+${xpReward} XP)`
    }),

    boost_activated: (proposalTitle: string) => ({
        title: '🚀 Vote Boosted!',
        message: `Your vote on "${proposalTitle}" now counts 2x`
    }),

    proposal_featured: (proposalTitle: string) => ({
        title: '📌 Proposal Featured',
        message: `"${proposalTitle}" is now pinned for 24 hours`
    })
} as const;
