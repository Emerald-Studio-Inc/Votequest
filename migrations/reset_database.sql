-- VoteQuest Database Reset Script
-- WARNING: This deletes ALL data. Use only for fresh start.

-- Delete all user-generated content
DELETE FROM votes;
DELETE FROM coin_transactions;
DELETE FROM user_achievements;
DELETE FROM proposals;
DELETE FROM proposal_options;
DELETE FROM share_analytics;

-- Delete all users (keeps table structure)
DELETE FROM users;

-- Reset sequences (if using serial/bigserial)
-- Note: Adjust if your IDs use different sequences
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS proposals_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS votes_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS coin_transactions_id_seq RESTART WITH 1;

-- Keep achievements table (system data)
-- DELETE FROM achievements; -- Uncomment to delete achievements too

-- Verify deletion
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Proposals:', COUNT(*) FROM proposals
UNION ALL
SELECT 'Votes:', COUNT(*) FROM votes
UNION ALL
SELECT 'Transactions:', COUNT(*) FROM coin_transactions;

-- Expected result: All counts should be 0
