require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seed() {
    // Achievements
    await supabase.from('achievements').upsert([
        { code: 'first_vote', name: 'First Vote', description: 'Cast your first vote', icon: '🏆', xp_reward: 100 },
        { code: 'week_streak', name: 'Week Streak', description: 'Vote 7 days in a row', icon: '🔥', xp_reward: 200 },
        { code: 'level_5', name: 'Level 5', description: 'Reach level 5', icon: '⭐', xp_reward: 300 },
        { code: 'proposal_creator', name: 'Proposal Creator', description: 'Create a proposal', icon: '📝', xp_reward: 250 },
    ]);

    // Proposals (active for next few days)
    const { data: p1 } = await supabase.from('proposals').insert({
        title: 'Upgrade UI',
        description: 'Add a new dark‑mode toggle to the app',
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: null,
        status: 'active',
        participants: 0,
    }).select('id').single();

    const { data: p2 } = await supabase.from('proposals').insert({
        title: 'New Token',
        description: 'Introduce a governance token for voting weight',
        end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        created_by: null,
        status: 'active',
        participants: 0,
    }).select('id').single();

    if (p1 && p2) {
        await supabase.from('proposal_options').insert([
            { proposal_id: p1.id, option_number: 1, title: 'Add toggle', description: 'Simple dark‑mode switch', votes: 0 },
            { proposal_id: p1.id, option_number: 2, title: 'Full redesign', description: 'Complete UI overhaul', votes: 0 },
            { proposal_id: p2.id, option_number: 1, title: 'ERC‑20 token', description: 'Standard fungible token', votes: 0 },
            { proposal_id: p2.id, option_number: 2, title: 'ERC‑721 NFT', description: 'Governance NFT', votes: 0 },
        ]);
    }

    console.log('✅ Seed data inserted');
}

seed().catch(err => console.error('Seed error:', err));
