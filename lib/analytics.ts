import { supabase } from './supabase'

// Analytics Functions
export async function getUserVotingHistory(userId: string): Promise<{ date: string; votes: number }[]> {
    try {
        const { data, error } = await supabase
            .from('votes')
            .select('voted_at')
            .eq('user_id', userId)
            .order('voted_at', { ascending: true });

        if (error) {
            console.error('Error fetching voting history:', error);
            return [];
        }

        // Group votes by date
        const votesByDate: { [key: string]: number } = {};
        data?.forEach((vote: { voted_at: string }) => {
            const date = new Date(vote.voted_at).toISOString().split('T')[0];
            votesByDate[date] = (votesByDate[date] || 0) + 1;
        });

        // Convert to array and fill in missing dates for the last 30 days
        const result: { date: string; votes: number }[] = [];
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            result.push({
                date: dateStr,
                votes: votesByDate[dateStr] || 0
            });
        }

        return result;
    } catch (error) {
        console.error('Error fetching voting history:', error);
        return [];
    }
}

export async function getUserCategoryBreakdown(userId: string): Promise<{ name: string; value: number; color: string }[]> {
    try {
        const { data, error } = await supabase
            .from('votes')
            .select('proposal_id, proposals(category)')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching category breakdown:', error);
            return [];
        }

        // Count votes by category
        const categoryCounts: { [key: string]: number } = {};
        let total = 0;

        data?.forEach((vote: any) => {
            const category = vote.proposals?.category || 'Uncategorized';
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            total++;
        });

        if (total === 0) {
            return [];
        }

        // Define colors for categories
        const colors = [
            '#3b82f6', // blue
            '#8b5cf6', // purple
            '#10b981', // green
            '#f59e0b', // orange
            '#ef4444', // red
            '#06b6d4', // cyan
        ];

        // Convert to array with colors
        return Object.entries(categoryCounts)
            .map(([name, count], index) => ({
                name,
                value: Math.round((count / total) * 100),
                color: colors[index % colors.length]
            }))
            .sort((a, b) => b.value - a.value);
    } catch (error) {
        console.error('Error fetching category breakdown:', error);
        return [];
    }
}
