-- Stripe Payment Integration Schema
-- Run this in Supabase SQL Editor

-- ============================================================================
-- Table: subscriptions
-- Tracks institutional organization subscriptions
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  tier INT NOT NULL CHECK (tier IN (1, 2, 3)),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);

-- ============================================================================
-- Table: coin_purchases  
-- Tracks individual VQC coin purchases
-- ============================================================================
CREATE TABLE IF NOT EXISTS coin_purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount_cents INT NOT NULL CHECK (amount_cents > 0),
  vqc_amount INT NOT NULL CHECK (vqc_amount > 0),
  bonus_vqc INT DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'pending', 'failed', 'canceled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_coin_purchases_user ON coin_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_purchases_payment_intent ON coin_purchases(stripe_payment_intent_id);

-- ============================================================================
-- Update organizations table
-- Add subscription tracking columns
-- ============================================================================
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id),
ADD COLUMN IF NOT EXISTS subscription_tier INT DEFAULT 1 CHECK (subscription_tier IN (1, 2, 3));

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get voter limit based on tier
CREATE OR REPLACE FUNCTION get_voter_limit(p_tier INT)
RETURNS INT AS $$
BEGIN
  RETURN CASE p_tier
    WHEN 1 THEN 50
    WHEN 2 THEN 250
    WHEN 3 THEN 1000
    ELSE 50
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to check if organization can add more voters
CREATE OR REPLACE FUNCTION can_add_voters(p_organization_id UUID, p_room_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  org_tier INT;
  voter_limit INT;
  current_voters INT;
BEGIN
  -- Get organization tier
  SELECT subscription_tier INTO org_tier
  FROM organizations
  WHERE id = p_organization_id;
  
  -- Get voter limit for tier
  voter_limit := get_voter_limit(COALESCE(org_tier, 1));
  
  -- Count current voters in room
  SELECT COUNT(*) INTO current_voters
  FROM voter_eligibility
  WHERE room_id = p_room_id;
  
  -- Return true if below limit
  RETURN current_voters < voter_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE subscriptions IS 'Tracks Stripe subscriptions for institutional organizations';
COMMENT ON TABLE coin_purchases IS 'Tracks individual VQC coin purchases via Stripe';
COMMENT ON COLUMN organizations.subscription_tier IS 'Current subscription tier: 1=Starter($19), 2=Professional($49), 3=Enterprise($99)';
COMMENT ON FUNCTION get_voter_limit(INT) IS 'Returns voter limit for a given subscription tier';
COMMENT ON FUNCTION can_add_voters(UUID, UUID) IS 'Checks if organization can add more voters to a room based on tier limits';
