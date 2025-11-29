-- COMPREHENSIVE CLEANUP: Delete all votes on duplicate proposals, then delete duplicates
-- Run this in Supabase SQL Editor

-- Step 1: Delete ALL votes on duplicate proposals (the ones we'll delete)
DELETE FROM votes
WHERE proposal_id IN (
  SELECT p1.id
  FROM proposals p1
  WHERE p1.blockchain_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM proposals p2 
      WHERE p2.blockchain_id = p1.blockchain_id 
        AND p2.created_at > p1.created_at
    )
);

-- Step 2: Now safe to delete duplicate proposals
DELETE FROM proposals
WHERE id IN (
  SELECT p1.id
  FROM proposals p1
  WHERE p1.blockchain_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM proposals p2 
      WHERE p2.blockchain_id = p1.blockchain_id 
        AND p2.created_at > p1.created_at
    )
);

-- Step 3: Verify - should show 8 proposals, each with blockchain_id 1-8
SELECT blockchain_id, COUNT(*) as count, title
FROM proposals
WHERE blockchain_id IS NOT NULL
GROUP BY blockchain_id, title
ORDER BY blockchain_id;

-- Step 4: Add unique constraint to prevent future duplicates
ALTER TABLE proposals
DROP CONSTRAINT IF EXISTS unique_blockchain_id;

ALTER TABLE proposals
ADD CONSTRAINT unique_blockchain_id UNIQUE (blockchain_id);

-- Step 5: Check total votes remaining
SELECT COUNT(*) as total_votes FROM votes;
