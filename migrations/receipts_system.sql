-- VoteQuest - Proof-of-Work Receipt System Migration

-- ==========================================
-- 1. UPDATE COIN_TRANSACTIONS FOR RECEIPTS
-- ==========================================

-- Add receipt hash and metadata columns
ALTER TABLE coin_transactions
  ADD COLUMN IF NOT EXISTS receipt_hash TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS action_metadata JSONB,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT TRUE;

-- Create index for receipt lookups
CREATE INDEX IF NOT EXISTS idx_coin_transactions_receipt ON coin_transactions(receipt_hash);

-- ==========================================
-- 2. BACKFILL EXISTING TRANSACTIONS
-- ==========================================

-- Generate receipts for existing coin transactions
-- Using MD5 of transaction data for backward compatibility
UPDATE coin_transactions
SET receipt_hash = md5(
  user_id::text || 
  amount::text || 
  reason || 
  created_at::text
)
WHERE receipt_hash IS NULL;

-- Add basic metadata to existing transactions
UPDATE coin_transactions ct
SET action_metadata = jsonb_build_object(
  'reason', ct.reason,
  'amount', ct.amount,
  'legacy', true,
  'backfilled', true
)
WHERE action_metadata IS NULL;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check receipt_hash uniqueness
SELECT receipt_hash, COUNT(*) as count
FROM coin_transactions
WHERE receipt_hash IS NOT NULL
GROUP BY receipt_hash
HAVING COUNT(*) > 1;

-- View sample receipts
SELECT 
  user_id,
  amount,
  reason,
  receipt_hash,
  action_metadata,
  created_at
FROM coin_transactions
ORDER BY created_at DESC
LIMIT 10;
