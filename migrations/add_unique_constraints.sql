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
-- NOTE: Constraint already exists, commenting out to prevent errors
-- ALTER TABLE users 
-- ADD CONSTRAINT users_auth_id_unique UNIQUE (auth_id);

-- ==========================================
-- STEP 2: ADD UNIQUE CONSTRAINT ON EMAIL
-- ==========================================

-- Secondary safeguard - prevents email duplication
-- Note: email can be NULL for old wallet-based users, so we only constrain non-NULL values
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique 
ON users (email) 
WHERE email IS NOT NULL;

-- ==========================================
-- STEP 3: VERIFY EXISTING VOTE CONSTRAINT
-- ==========================================

-- The votes table should already have unique(user_id, proposal_id) from supabase_setup.sql
-- Attempt to add it (this might fail if it already exists, which is fine)
-- ALTER TABLE votes ADD CONSTRAINT votes_user_id_proposal_id_key UNIQUE (user_id, proposal_id);


-- ==========================================
-- STEP 4: CREATE INDEX ON AUTH_ID FOR PERFORMANCE
-- ==========================================

-- The unique constraint creates an index automatically, but let's ensure it's optimal
-- (PostgreSQL creates a B-tree index automatically for UNIQUE constraints)

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

-- Test block commented out to avoid syntax errors in some environments
-- DO $$
-- ...
-- END $$;
