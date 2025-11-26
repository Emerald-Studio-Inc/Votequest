-- Quick manual ranking update script
-- Run this in Supabase SQL editor to update all user rankings immediately

SELECT update_global_rankings();

-- View top 10 users by rank
SELECT 
    global_rank,
    wallet_address,
    level,
    xp,
    votes_count,
    voting_power,
    streak
FROM users
WHERE global_rank > 0
ORDER BY global_rank ASC
LIMIT 10;
