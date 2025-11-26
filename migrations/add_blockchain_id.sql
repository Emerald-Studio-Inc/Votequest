-- Add blockchain_id column to proposals table for tracking on-chain proposals
-- This allows us to link Supabase proposals to their blockchain counterparts

ALTER TABLE proposals
ADD COLUMN IF NOT EXISTS blockchain_id INTEGER DEFAULT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_proposals_blockchain_id ON proposals(blockchain_id);

-- Add comment for documentation
COMMENT ON COLUMN proposals.blockchain_id IS 'Blockchain proposal ID if this proposal was created on-chain. NULL for database-only proposals.';
