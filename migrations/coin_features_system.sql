-- Coin Features System for VoteQuest
-- Implements purchasable features using VQC coins

-- ============================================================================
-- Table: coin_features
-- Tracks which coin features have been purchased for which rooms
-- ============================================================================
CREATE TABLE IF NOT EXISTS coin_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES voting_rooms(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN (
    'ranked_choice_voting',
    'anonymous_voting',
    'weighted_voting',
    'instant_tabulation',
    'audit_trail',
    'custom_branding',
    'extended_window',
    'qr_code',
    'extra_voters'
  )),
  cost_vqc INT NOT NULL,
  purchased_by UUID NOT NULL REFERENCES users(id),
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- NULL = permanent, or expiry date
  data JSONB DEFAULT NULL, -- Store feature-specific data (e.g., extension days, voter count)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coin_features_room ON coin_features(room_id);
CREATE INDEX IF NOT EXISTS idx_coin_features_type ON coin_features(feature_type);
CREATE INDEX IF NOT EXISTS idx_coin_features_user ON coin_features(purchased_by);

-- ============================================================================
-- Update voting_rooms table
-- Add coin feature flags
-- ============================================================================
ALTER TABLE voting_rooms
ADD COLUMN IF NOT EXISTS ranked_choice_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS anonymous_voting_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS weighted_voting_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS instant_tabulation_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS audit_trail_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS custom_branding_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS extra_voters_added INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS extended_until TIMESTAMP WITH TIME ZONE;

-- ============================================================================
-- Update voter_eligibility table
-- Add voting weight support
-- ============================================================================
ALTER TABLE voter_eligibility
ADD COLUMN IF NOT EXISTS vote_weight INT DEFAULT 1 CHECK (vote_weight > 0);

-- ============================================================================
-- Update voting_options table (if exists)
-- For ranked choice voting support
-- ============================================================================
-- Note: voting_options stores the choices for voting_rooms
ALTER TABLE IF EXISTS voting_options
ADD COLUMN IF NOT EXISTS ranking_position INT DEFAULT NULL;

-- ============================================================================
-- Coin Feature Pricing & Info
-- ============================================================================
-- This is reference data (in comments for documentation)
-- Room Add-ons:
--   1 coin = 10 extra voters
--   5 coins = Extend room by 30 days
--   3 coins = Add advanced analytics (audit trail)
--
-- Feature Upgrades:
--   2 coins = Unlock ranked choice voting
--   2 coins = Enable anonymous voting
--   2 coins = Enable weighted voting
--   1 coin = Custom branding for one room
--
-- Quick Services:
--   1 coin = Generate voter QR code
--   2 coins = Instant vote tabulation
--   2 coins = Unlock voting audit trail
--   1 coin = Extended voting window (7 days)

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to check if room has a coin feature
CREATE OR REPLACE FUNCTION has_coin_feature(p_room_id UUID, p_feature_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  feature_count INT;
  expiry_time TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT COUNT(*), MAX(expires_at) INTO feature_count, expiry_time
  FROM coin_features
  WHERE room_id = p_room_id 
  AND feature_type = p_feature_type;
  
  -- If no features found, return false
  IF feature_count = 0 THEN
    RETURN false;
  END IF;
  
  -- If feature has expiry, check if expired
  IF expiry_time IS NOT NULL AND expiry_time < NOW() THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to get total extra voters added via coins
CREATE OR REPLACE FUNCTION get_extra_voters_count(p_room_id UUID)
RETURNS INT AS $$
DECLARE
  extra_voters INT;
BEGIN
  SELECT COALESCE(SUM((data->>'voter_count')::INT), 0)
  INTO extra_voters
  FROM coin_features
  WHERE room_id = p_room_id
  AND feature_type = 'extra_voters'
  AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN COALESCE(extra_voters, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate weighted vote
CREATE OR REPLACE FUNCTION calculate_weighted_vote(p_room_id UUID, p_vote_value INT, p_voter_id UUID)
RETURNS INT AS $$
DECLARE
  weight INT := 1;
  has_weighted BOOLEAN;
BEGIN
  -- Check if weighted voting is enabled
  SELECT has_coin_feature(p_room_id, 'weighted_voting') INTO has_weighted;
  
  IF NOT has_weighted THEN
    RETURN p_vote_value;
  END IF;
  
  -- Get voter's weight
  SELECT vote_weight INTO weight
  FROM voter_eligibility
  WHERE id = p_voter_id;
  
  RETURN p_vote_value * COALESCE(weight, 1);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE coin_features IS 'Tracks VQC coin purchases for room features';
COMMENT ON COLUMN coin_features.feature_type IS 'Type of feature purchased (ranked_choice, anonymous, weighted, etc)';
COMMENT ON COLUMN coin_features.expires_at IS 'Feature expiry date (NULL = permanent)';
COMMENT ON COLUMN coin_features.data IS 'JSON data for feature-specific configuration';
COMMENT ON COLUMN voter_eligibility.vote_weight IS 'Multiplier for this voter''s vote (1 = normal, 2 = double, etc)';
COMMENT ON FUNCTION has_coin_feature(UUID, TEXT) IS 'Check if room has purchased a specific coin feature';
COMMENT ON FUNCTION get_extra_voters_count(UUID) IS 'Get total extra voters added via coin purchases';
COMMENT ON FUNCTION calculate_weighted_vote(UUID, INT, UUID) IS 'Calculate vote value with weighting applied';
