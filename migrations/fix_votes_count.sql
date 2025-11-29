-- Fix vote_count inconsistency
-- Problem: users.votes_count doesn't match actual vote records in votes table
-- Solution: Recalculate votes_count from actual votes

-- Update all users' vote counts based on actual votes table
UPDATE users
SET votes_count = (
  SELECT COUNT(*)
  FROM votes
  WHERE votes.user_id = users.id
),
updated_at = NOW();

-- Verify the fix
SELECT 
  u.wallet_address,
  u.votes_count as stored_count,
  (SELECT COUNT(*) FROM votes WHERE user_id = u.id) as actual_count,
  CASE 
    WHEN u.votes_count = (SELECT COUNT(*) FROM votes WHERE user_id = u.id) 
    THEN '✅ SYNCED' 
    ELSE '❌ MISMATCH' 
  END as status
FROM users u
WHERE u.votes_count > 0 OR (SELECT COUNT(*) FROM votes WHERE user_id = u.id) > 0;
