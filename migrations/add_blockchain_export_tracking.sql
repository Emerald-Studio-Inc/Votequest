-- Add blockchain export tracking to coin_transactions
-- Run this in Supabase SQL Editor

ALTER TABLE coin_transactions
  ADD COLUMN IF NOT EXISTS blockchain_exported BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS blockchain_tx_hash TEXT,
  ADD COLUMN IF NOT EXISTS blockchain_exported_at TIMESTAMP;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_coin_tx_blockchain 
  ON coin_transactions(blockchain_exported, created_at);

-- Verification: View export status
SELECT 
  COUNT(*) FILTER (WHERE blockchain_exported = TRUE) as exported,
  COUNT(*) FILTER (WHERE blockchain_exported IS NULL OR blockchain_exported = FALSE) as pending,
  COUNT(*) as total
FROM coin_transactions
WHERE receipt_hash IS NOT NULL;

-- Expected result: 
-- exported: 0
-- pending: (number of transactions with receipts)
-- total: (number of transactions with receipts)
