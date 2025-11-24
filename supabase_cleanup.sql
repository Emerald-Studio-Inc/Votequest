-- ==================================================
-- VoteQuest Production Cleanup Script
-- ==================================================
-- Run this in Supabase SQL Editor to remove all mock/seed data
-- and start fresh for production deployment
-- ==================================================

-- Remove all votes (will be empty anyway since these are fake proposals)
DELETE FROM votes;

-- Remove all proposal options
DELETE FROM proposal_options;

-- Remove all proposals
DELETE FROM proposals;

-- Remove all user achievements
DELETE FROM user_achievements;

-- Remove all users (they'll be recreated when real users connect wallets)
DELETE FROM users;

-- Keep the achievements table structure but remove seed achievements
-- You can optionally keep these if you want the achievement system ready:
-- DELETE FROM achievements;

-- ==================================================
-- Verification Queries
-- ==================================================
-- Run these after cleanup to verify everything is clean:

SELECT COUNT(*) as remaining_proposals FROM proposals;
-- Expected: 0

SELECT COUNT(*) as remaining_votes FROM votes;
-- Expected: 0

SELECT COUNT(*) as remaining_users FROM users;
-- Expected: 0

SELECT COUNT(*) as remaining_options FROM proposal_options;
-- Expected: 0

-- ==================================================
-- Ready for Production!
-- ==================================================
-- After running this cleanup:
-- 1. Only real blockchain proposals will be synced
-- 2. Only real users who connect wallets will be tracked
-- 3. Only real votes cast through the app will be recorded
-- ==================================================
