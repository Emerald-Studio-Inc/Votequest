-- VoteQuest - Add Unique Constraints for Vote Integrity
-- Run this AFTER cleanup_duplicate_profiles.sql

-- ==========================================
-- PURPOSE
-- ==========================================
-- This migration adds unique constraints to prevent:
-- 1. Multiple user profiles for the same auth_id (prevents duplicate voting)
-- 2. Multiple user profiles for the same email (prevents account confusion)
--
-- CRITICAL: This fixes the vote integrity vulnerability where users could
-- vote multiple times by logging in from different devices.

-- ==========================================
-- STEP 1: ADD UNIQUE CONSTRAINT ON AUTH_ID
-- ==========================================

-- This is the PRIMARY fix for vote integrity
-- Ensures one Supabase auth user = one VoteQuest profile
ALTER TABLE users 
ADD CONSTRAINT users_auth_id_unique UNIQUE (auth_id);

-- ==========================================
-- STEP 2: ADD UNIQUE CONSTRAINT ON EMAIL
-- ==========================================

-- Secondary safeguard - prevents email duplication
-- Note: email can be NULL for old wallet-based users, so we only constrain non-NULL values
CREATE UNIQUE INDEX users_email_unique 
ON users (email) 
WHERE email IS NOT NULL;

-- ==========================================
-- STEP 3: VERIFY EXISTING VOTE CONSTRAINT
-- ==========================================

-- The votes table should already have unique(user_id, proposal_id) from supabase_setup.sql
-- Let's verify it exists, and create it if missing

DO $$
BEGIN
    -- Check if constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'votes_user_id_proposal_id_key'
    ) THEN
        -- Add the constraint if missing
        ALTER TABLE votes 
        ADD CONSTRAINT votes_user_id_proposal_id_key UNIQUE (user_id, proposal_id);
        
        RAISE NOTICE 'Added missing unique constraint on votes(user_id, proposal_id)';
    ELSE
        RAISE NOTICE 'Unique constraint on votes(user_id, proposal_id) already exists';
    END IF;
END $$;

-- ==========================================
-- STEP 4: CREATE INDEX ON AUTH_ID FOR PERFORMANCE
-- ==========================================

-- The unique constraint creates an index automatically, but let's ensure it's optimal
-- (PostgreSQL creates a B-tree index automatically for UNIQUE constraints, so this is just for verification)

-- Verify the index exists
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'users' 
AND indexname LIKE '%auth_id%';

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Verify all constraints are in place
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    'users' as table_name
FROM pg_constraint
WHERE conrelid = 'users'::regclass
AND conname LIKE '%auth_id%' OR conname LIKE '%email%'

UNION ALL

SELECT 
    conname as constraint_name,
    contype as constraint_type,
    'votes' as table_name
FROM pg_constraint
WHERE conrelid = 'votes'::regclass
AND conname LIKE '%user_id%proposal_id%';

-- Test that constraints are working
DO $$
DECLARE
    test_auth_id uuid := gen_random_uuid();
    test_email text := 'test_' || gen_random_uuid() || '@example.com';
    test_user_id uuid;
    duplicate_error boolean := false;
BEGIN
    -- Insert a test user
    INSERT INTO users (auth_id, email, username, age_verified, xp, level, coins, votes_count, voting_power, streak, global_rank)
    VALUES (test_auth_id, test_email, 'test_user', true, 0, 1, 0, 0, 100, 0, 0)
    RETURNING id INTO test_user_id;
    
    RAISE NOTICE 'Created test user: %', test_user_id;
    
    -- Try to create duplicate with same auth_id (should fail)
    BEGIN
        INSERT INTO users (auth_id, email, username, age_verified, xp, level, coins, votes_count, voting_power, streak, global_rank)
        VALUES (test_auth_id, 'different@example.com', 'test_user2', true, 0, 1, 0, 0, 100, 0, 0);
        
        RAISE EXCEPTION 'ERROR: Duplicate auth_id was allowed! Constraint not working!';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'SUCCESS: Duplicate auth_id correctly rejected';
            duplicate_error := true;
    END;
    
    -- Try to create duplicate with same email (should fail)
    BEGIN
        INSERT INTO users (auth_id, email, username, age_verified, xp, level, coins, votes_count, voting_power, streak, global_rank)
        VALUES (gen_random_uuid(), test_email, 'test_user3', true, 0, 1, 0, 0, 100, 0, 0);
        
        RAISE EXCEPTION 'ERROR: Duplicate email was allowed! Constraint not working!';
    EXCEPTION
        WHEN unique_violation THEN
            RAISE NOTICE 'SUCCESS: Duplicate email correctly rejected';
    END;
    
    -- Clean up test data
    DELETE FROM users WHERE id = test_user_id;
    RAISE NOTICE 'Cleaned up test user';
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CONSTRAINT VERIFICATION COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'All constraints are working correctly!';
    RAISE NOTICE 'Users can no longer create duplicate profiles';
    RAISE NOTICE 'Vote integrity vulnerability is FIXED';
END $$;
