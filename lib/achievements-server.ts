import { supabaseAdmin } from './server-db';

export async function getAchievements() {
    const { data, error } = await supabaseAdmin
        .from('achievements')
        .select('*')
        .order('xp_reward', { ascending: true });

    if (error) {
        console.error('Error fetching achievements:', error);
        return [];
    }
    return data;
}

export async function getUserAchievements(userId: string) {
    const { data, error } = await supabaseAdmin
        .from('user_achievements')
        .select('*, achievement:achievements(*)')
        .eq('user_id', userId);

    if (error) {
        console.error('Error fetching user achievements:', error);
        return [];
    }
    return data;
}

export async function checkAndAwardAchievements(userId: string) {
    const { data: userData } = await supabaseAdmin.from('users').select('*').eq('id', userId).single();

    if (!userData) return false;

    const achievements = await getAchievements();
    const userAchievements = await getUserAchievements(userId);
    const earnedCodes = new Set(userAchievements.map((ua: any) => ua.achievement.code));

    const newAchievements = [];

    // Check 'first_vote'
    if (!earnedCodes.has('first_vote') && userData.votes_count > 0) {
        newAchievements.push('first_vote');
    }

    // Check 'week_streak'
    if (!earnedCodes.has('week_streak') && userData.streak >= 7) {
        newAchievements.push('week_streak');
    }

    // Check 'level_5'
    if (!earnedCodes.has('level_5') && userData.level >= 5) {
        newAchievements.push('level_5');
    }

    // Check 'proposal_creator'
    if (!earnedCodes.has('proposal_creator')) {
        const { count } = await supabaseAdmin
            .from('proposals')
            .select('*', { count: 'exact', head: true })
            .eq('created_by', userId);

        if (count && count > 0) {
            newAchievements.push('proposal_creator');
        }
    }

    for (const code of newAchievements) {
        const achievement = achievements.find((a: any) => a.code === code);
        if (achievement) {
            await supabaseAdmin.from('user_achievements').insert({
                user_id: userId,
                achievement_id: achievement.id
            });

            // Award XP
            const newXP = userData.xp + achievement.xp_reward;
            const newLevel = Math.floor(Math.sqrt(newXP / 100));

            await supabaseAdmin
                .from('users')
                .update({ xp: newXP, level: newLevel, updated_at: new Date().toISOString() })
                .eq('id', userId);
        }
    }

    return newAchievements.length > 0;
}
