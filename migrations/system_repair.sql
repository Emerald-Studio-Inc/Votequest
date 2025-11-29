-- VoteQuest System Repair SQL
-- Run these queries in Supabase SQL Editor to fix data inconsistencies

-- ==========================================
-- 1. FIX VOTE COUNTS
-- ==========================================
-- Recalculate votes_count for all users
UPDATE users
SET votes_count = (
  SELECT COUNT(*) 
  FROM votes 
  WHERE votes.user_id = users.id
),
updated_at = NOW();

-- Verify vote counts
SELECT 
  u.wallet_address,
  u.votes_count as displayed_count,
  (SELECT COUNT(*) FROM votes WHERE user_id = u.id) as actual_votes,
  CASE 
    WHEN u.votes_count = (SELECT COUNT(*) FROM votes WHERE user_id = u.id) 
    THEN '✅ OK' 
    ELSE '❌ MISMATCH' 
  END as status
FROM users u
ORDER BY u.created_at DESC
LIMIT 10;

-- ==========================================
-- 2. FIX PROPOSAL PARTICIPANTS
-- ==========================================
-- Recalculate participants for all proposals
UPDATE proposals
SET participants = (
  SELECT COUNT(DISTINCT user_id)
  FROM votes
  WHERE votes.proposal_id = proposals.id
),
updated_at = NOW();

-- ==========================================
-- 3. FIX OPTION VOTE COUNTS
-- ==========================================
-- Recalculate votes for all options
UPDATE proposal_options
SET votes = (
  SELECT COUNT(*)
  FROM votes
  WHERE votes.option_id = proposal_options.id
);

-- ==========================================
-- 4. CHECK FOR ORPHANED VOTES
-- ==========================================
-- Find votes for proposals that don't exist
SELECT 
  v.id as vote_id,
  v.user_id,
  v.proposal_id,
  v.voted_at,
  CASE 
    WHEN p.id IS NULL THEN '❌ ORPHANED (no proposal)'
    WHEN po.id IS NULL THEN '❌ ORPHANED (no option)'
    ELSE '✅ OK'
  END as status
FROM votes v
LEFT JOIN proposals p ON v.proposal_id = p.id
LEFT JOIN proposal_options po ON v.option_id = po.id
WHERE p.id IS NULL OR po.id IS NULL;

-- ==========================================
-- 5. CHECK BLOCKCHAIN SYNC
-- ==========================================
-- Identify proposals without blockchain_id
SELECT 
  id,
  title,
  blockchain_id,
  created_at,
  CASE 
    WHEN blockchain_id IS NULL THEN '⚠️ NOT SYNCED'
    ELSE '✅ SYNCED'
  END as sync_status
FROM proposals
ORDER BY created_at DESC;

-- ==========================================
-- 6. SUMMARY REPORT
-- ==========================================
SELECT 
  'Total Users' as metric,
  COUNT(*)::text as value
FROM users
UNION ALL
SELECT 
  'Total Proposals',
  COUNT(*)::text
FROM proposals
UNION ALL
SELECT 
  'Total Votes',
  COUNT(*)::text
FROM votes
UNION ALL
SELECT 
  'Votes Last 24h',
  COUNT(*)::text
FROM votes
WHERE voted_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT
  'Proposals with blockchain_id',
  COUNT(*)::text
FROM proposals
WHERE blockchain_id IS NOT NULL;
