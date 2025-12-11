-- VoteQuest - Cleanup Duplicate User Profiles
-- Run this BEFORE applying unique constraints on auth_id and email
-- 
-- WHY THIS IS NEEDED:
-- If duplicate profiles already exist in the database (same auth_id or email),
-- PostgreSQL will REJECT the unique constraint with an error like:
-- "ERROR: could not create unique index - duplicate key value violates unique constraint"
--
-- This script identifies and consolidates duplicate profiles to prevent that error.

-- ==========================================
-- STEP 1: IDENTIFY DUPLICATE PROFILES
-- ==========================================

-- Check for duplicate auth_id values
SELECT 
    auth_id,
    COUNT(*) as profile_count,
    ARRAY_AGG(id) as user_ids,
    ARRAY_AGG(email) as emails,
    ARRAY_AGG(created_at ORDER BY created_at) as creation_dates
FROM users
WHERE auth_id IS NOT NULL
GROUP BY auth_id
HAVING COUNT(*) > 1
ORDER BY profile_count DESC;

-- Check for duplicate email values
SELECT 
    email,
    COUNT(*) as profile_count,
    ARRAY_AGG(id) as user_ids,
    ARRAY_AGG(auth_id) as auth_ids,
    ARRAY_AGG(created_at ORDER BY created_at) as creation_dates
FROM users
WHERE email IS NOT NULL
GROUP BY email
HAVING COUNT(*) > 1
ORDER BY profile_count DESC;

-- ==========================================
-- STEP 2: BACKUP DUPLICATE PROFILES
-- ==========================================

-- Create a backup table for duplicate profiles before cleanup
-- Create a backup table for duplicate profiles using CTAS (Create Table As Select)
-- This avoids column mismatch errors if the users table has more columns than we expect
DROP TABLE IF EXISTS users_duplicate_backup;

CREATE TABLE users_duplicate_backup AS
SELECT 
    u.*,
    now() as backed_up_at,
    NULL::uuid as primary_user_id,
    'Duplicate auth_id'::text as reason
FROM users u
WHERE auth_id IN (
    SELECT auth_id
    FROM users
    WHERE auth_id IS NOT NULL
    GROUP BY auth_id
    HAVING COUNT(*) > 1
);

-- ==========================================
-- STEP 3: CONSOLIDATE DUPLICATE PROFILES
-- ==========================================

-- Strategy: Keep the OLDEST profile (first created) for each auth_id
-- Merge data from newer profiles into the oldest one

-- For each duplicate auth_id, merge stats into the oldest profile
WITH duplicates AS (
    SELECT 
        auth_id,
        MIN(created_at) as oldest_created_at
    FROM users
    WHERE auth_id IS NOT NULL
    GROUP BY auth_id
    HAVING COUNT(*) > 1
),
primary_users AS (
    SELECT 
        u.id as primary_id,
        u.auth_id
    FROM users u
    INNER JOIN duplicates d ON u.auth_id = d.auth_id AND u.created_at = d.oldest_created_at
),
aggregated_stats AS (
    SELECT 
        pu.primary_id,
        pu.auth_id,
        MAX(u.xp) as max_xp,  -- Keep highest XP
        MAX(u.level) as max_level,  -- Keep highest level
        SUM(u.coins) as total_coins,  -- Sum all coins
        SUM(u.votes_count) as total_votes,  -- Sum all votes
        MAX(u.voting_power) as max_power,  -- Keep highest power
        MAX(u.streak) as max_streak,  -- Keep longest streak
        MIN(u.global_rank) as best_rank  -- Keep best rank (lowest number)
    FROM users u
    INNER JOIN primary_users pu ON u.auth_id = pu.auth_id
    GROUP BY pu.primary_id, pu.auth_id
)
UPDATE users u
SET 
    xp = agg.max_xp,
    level = agg.max_level,
    coins = agg.total_coins,
    votes_count = agg.total_votes,
    voting_power = agg.max_power,
    streak = agg.max_streak,
    global_rank = agg.best_rank,
    updated_at = now()
FROM aggregated_stats agg
WHERE u.id = agg.primary_id;

-- ==========================================
-- STEP 4: UPDATE FOREIGN KEY REFERENCES
-- ==========================================

-- Update votes table to point to primary user
WITH primary_users AS (
    SELECT 
        u.id as primary_id,
        u.auth_id,
        u.created_at
    FROM users u
    WHERE auth_id IN (
        SELECT auth_id
        FROM users
        WHERE auth_id IS NOT NULL
        GROUP BY auth_id
        HAVING COUNT(*) > 1
    )
    AND created_at = (
        SELECT MIN(created_at)
        FROM users u2
        WHERE u2.auth_id = u.auth_id
    )
),
duplicate_users AS (
    SELECT 
        u.id as duplicate_id,
        pu.primary_id
    FROM users u
    INNER JOIN primary_users pu ON u.auth_id = pu.auth_id
    WHERE u.id != pu.primary_id
)
UPDATE votes v
SET user_id = du.primary_id
FROM duplicate_users du
WHERE v.user_id = du.duplicate_id
AND NOT EXISTS (
    -- Don't update if it would create a duplicate vote
    SELECT 1 FROM votes v2
    WHERE v2.user_id = du.primary_id
    AND v2.proposal_id = v.proposal_id
);

-- Handle duplicate votes (same user voting twice on same proposal due to multiple profiles)
-- Delete the newer duplicate votes
WITH duplicate_votes AS (
    SELECT 
        v.id,
        ROW_NUMBER() OVER (PARTITION BY v.user_id, v.proposal_id ORDER BY v.voted_at ASC) as rn
    FROM votes v
)
DELETE FROM votes
WHERE id IN (
    SELECT id FROM duplicate_votes WHERE rn > 1
);

-- Update proposals created_by to point to primary user
WITH primary_users AS (
    SELECT 
        u.id as primary_id,
        u.auth_id
    FROM users u
    WHERE auth_id IN (
        SELECT auth_id
        FROM users
        WHERE auth_id IS NOT NULL
        GROUP BY auth_id
        HAVING COUNT(*) > 1
    )
    AND created_at = (
        SELECT MIN(created_at)
        FROM users u2
        WHERE u2.auth_id = u.auth_id
    )
),
duplicate_users AS (
    SELECT 
        u.id as duplicate_id,
        pu.primary_id
    FROM users u
    INNER JOIN primary_users pu ON u.auth_id = pu.auth_id
    WHERE u.id != pu.primary_id
)
UPDATE proposals p
SET created_by = du.primary_id
FROM duplicate_users du
WHERE p.created_by = du.duplicate_id;

-- Update coin_transactions if table exists
-- Update coin_transactions directly (assumes table exists)
WITH primary_users AS (
    SELECT 
        u.id as primary_id,
        u.auth_id
    FROM users u
    WHERE auth_id IN (
        SELECT auth_id
        FROM users
        WHERE auth_id IS NOT NULL
        GROUP BY auth_id
        HAVING COUNT(*) > 1
    )
    AND created_at = (
        SELECT MIN(created_at)
        FROM users u2
        WHERE u2.auth_id = u.auth_id
    )
),
duplicate_users AS (
    SELECT 
        u.id as duplicate_id,
        pu.primary_id
    FROM users u
    INNER JOIN primary_users pu ON u.auth_id = pu.auth_id
    WHERE u.id != pu.primary_id
)
UPDATE coin_transactions ct
SET user_id = du.primary_id
FROM duplicate_users du
WHERE ct.user_id = du.duplicate_id;

-- ==========================================
-- STEP 5: DELETE DUPLICATE PROFILES
-- ==========================================

-- Record which profiles are being deleted and map to primary
UPDATE users_duplicate_backup
SET primary_user_id = pu.primary_id
FROM (
    SELECT 
        u.id as primary_id,
        u.auth_id
    FROM users u
    WHERE auth_id IN (
        SELECT auth_id
        FROM users
        WHERE auth_id IS NOT NULL
        GROUP BY auth_id
        HAVING COUNT(*) > 1
    )
    AND created_at = (
        SELECT MIN(created_at)
        FROM users u2
        WHERE u2.auth_id = u.auth_id
    )
) pu
WHERE users_duplicate_backup.auth_id = pu.auth_id
AND users_duplicate_backup.id != pu.primary_id;

-- Delete duplicate profiles (keep only the oldest one per auth_id)
WITH primary_users AS (
    SELECT 
        u.id as primary_id,
        u.auth_id
    FROM users u
    WHERE auth_id IN (
        SELECT auth_id
        FROM users
        WHERE auth_id IS NOT NULL
        GROUP BY auth_id
        HAVING COUNT(*) > 1
    )
    AND created_at = (
        SELECT MIN(created_at)
        FROM users u2
        WHERE u2.auth_id = u.auth_id
    )
)
DELETE FROM users
WHERE auth_id IN (
    SELECT auth_id
    FROM users
    WHERE auth_id IS NOT NULL
    GROUP BY auth_id
    HAVING COUNT(*) > 1
)
AND id NOT IN (SELECT primary_id FROM primary_users);

-- ==========================================
-- STEP 6: VERIFICATION
-- ==========================================

-- Verify no duplicates remain
SELECT 'Duplicate auth_id check:' as check_type, COUNT(*) as should_be_zero
FROM (
    SELECT auth_id
    FROM users
    WHERE auth_id IS NOT NULL
    GROUP BY auth_id
    HAVING COUNT(*) > 1
) duplicates;

SELECT 'Duplicate email check:' as check_type, COUNT(*) as should_be_zero
FROM (
    SELECT email
    FROM users
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
) duplicates;

-- Show backup summary
SELECT 
    COUNT(*) as total_profiles_backed_up,
    COUNT(DISTINCT auth_id) as unique_auth_ids,
    COUNT(DISTINCT primary_user_id) as primary_profiles_kept
FROM users_duplicate_backup;

-- Show cleanup results
SELECT 
    'Cleanup complete!' as status,
    'Ready to apply unique constraints' as next_step;
