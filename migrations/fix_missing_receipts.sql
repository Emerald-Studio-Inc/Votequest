-- Fix Missing Receipts - Run this in Supabase SQL Editor
-- This will generate receipts for ALL coin transactions that don't have them

-- ==========================================
-- 1. ENSURE COLUMNS EXIST
-- ==========================================

DO $$ 
BEGIN
  -- Add receipt_hash column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coin_transactions' AND column_name = 'receipt_hash'
  ) THEN
    ALTER TABLE coin_transactions ADD COLUMN receipt_hash TEXT;
  END IF;

  -- Add action_metadata column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coin_transactions' AND column_name = 'action_metadata'
  ) THEN
    ALTER TABLE coin_transactions ADD COLUMN action_metadata JSONB;
  END IF;

  -- Add verified column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coin_transactions' AND column_name = 'verified'
  ) THEN
    ALTER TABLE coin_transactions ADD COLUMN verified BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Create index for receipt lookups
CREATE INDEX IF NOT EXISTS idx_coin_transactions_receipt ON coin_transactions(receipt_hash);

-- ==========================================
-- 2. BACKFILL MISSING RECEIPTS
-- ==========================================

-- Generate SHA-256 receipts for transactions without receipts
UPDATE coin_transactions
SET receipt_hash = encode(
  digest(
    user_id::text || 
    '|' ||
    amount::text || 
    '|' ||
    COALESCE(reason, 'unknown') ||
    '|' ||
    created_at::text,
    'sha256'
  ),
  'hex'
),
verified = TRUE
WHERE receipt_hash IS NULL;

-- ==========================================
-- 3. BACKFILL METADATA FOR OLD TRANSACTIONS
-- ==========================================

-- Add metadata to transactions that don't have it
UPDATE coin_transactions ct
SET action_metadata = jsonb_build_object(
  'reason', ct.reason,
  'amount', ct.amount,
  'legacy', true,
  'backfilled', true,
  'backfill_date', NOW()
)
WHERE action_metadata IS NULL;

-- ==========================================
-- 4. UPDATE METADATA FOR VOTE TRANSACTIONS
-- ==========================================

-- Enhance metadata for voting transactions with proposal info
UPDATE coin_transactions ct
SET action_metadata = ct.action_metadata || jsonb_build_object(
  'proposalTitle', p.title,
  'voteType', 'database'
)
FROM proposals p
WHERE ct.proposal_id = p.id
  AND ct.reason IN ('vote_cast', 'earn_vote')
  AND NOT (ct.action_metadata ? 'proposalTitle');

-- ==========================================
-- 5. VERIFICATION
-- ==========================================

-- Check: Should show 0 transactions without receipts
SELECT 
    COUNT(*) as total_transactions,
    COUNT(receipt_hash) as with_receipts,
    COUNT(*) - COUNT(receipt_hash) as missing_receipts
FROM coin_transactions;

-- Check: Show breakdown by user
SELECT 
    u.email,
    u.coins as user_coins,
    COUNT(ct.id) as total_transactions,
    COUNT(ct.receipt_hash) as transactions_with_receipts,
    SUM(ct.amount) as total_earned
FROM users u
LEFT JOIN coin_transactions ct ON u.id = ct.user_id
GROUP BY u.id, u.email, u.coins
HAVING COUNT(ct.id) > 0
ORDER BY total_earned DESC;

-- Check: Show sample receipts
SELECT 
    ct.id,
    ct.amount,
    ct.reason,
    LEFT(ct.receipt_hash, 16) || '...' as receipt_preview,
    ct.action_metadata->>'legacy' as is_legacy,
    ct.verified,
    ct.created_at
FROM coin_transactions ct
ORDER BY ct.created_at DESC
LIMIT 10;

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
DECLARE
    total_count INT;
    receipts_count INT;
BEGIN
    SELECT COUNT(*), COUNT(receipt_hash) 
    INTO total_count, receipts_count
    FROM coin_transactions;
    
    RAISE NOTICE '✅ Receipt Migration Complete!';
    RAISE NOTICE 'Total transactions: %', total_count;
    RAISE NOTICE 'Transactions with receipts: %', receipts_count;
    RAISE NOTICE 'Missing receipts: %', total_count - receipts_count;
END $$;
