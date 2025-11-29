-- Add missing columns to existing tables for coin and notification features
-- SAFE TO RUN MULTIPLE TIMES

-- ==================== VOTES TABLE ====================
-- Add power boost columns for voting power boost feature

DO $$ 
BEGIN
  -- Add power_boost column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'votes' AND column_name = 'power_boost'
  ) THEN
    ALTER TABLE votes ADD COLUMN power_boost BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add boost_multiplier column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'votes' AND column_name = 'boost_multiplier'
  ) THEN
    ALTER TABLE votes ADD COLUMN boost_multiplier NUMERIC(3,1) DEFAULT 1.0;
  END IF;
END $$;

-- ==================== PROPOSALS TABLE ====================
-- Add featured columns for proposal highlight feature

DO $$ 
BEGIN
  -- Add featured column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proposals' AND column_name = 'featured'
  ) THEN
    ALTER TABLE proposals ADD COLUMN featured BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add featured_until column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proposals' AND column_name = 'featured_until'
  ) THEN
    ALTER TABLE proposals ADD COLUMN featured_until TIMESTAMP DEFAULT NULL;
  END IF;
END $$;

-- Create index for featured proposals
CREATE INDEX IF NOT EXISTS idx_proposals_featured ON proposals(featured, featured_until) WHERE featured = true;

-- Add comments for documentation
COMMENT ON COLUMN votes.power_boost IS 'Whether this vote has been boosted with coins (2x multiplier)';
COMMENT ON COLUMN votes.boost_multiplier IS 'Vote power multiplier (1.0 = normal, 2.0 = boosted)';
COMMENT ON COLUMN proposals.featured IS 'Whether this proposal is currently featured/highlighted';
COMMENT ON COLUMN proposals.featured_until IS 'When the featured status expires (24 hours from highlight)';
