-- Share & Referral System Database Schema
-- Run this in Supabase SQL Editor

-- ==============================================
-- REFERRALS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES users(id) ON DELETE SET NULL,
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    referral_code TEXT UNIQUE NOT NULL,
    converted BOOLEAN DEFAULT FALSE,
    reward_awarded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    converted_at TIMESTAMP WITH TIME ZONE,
    
    -- Prevent self-referrals
    CONSTRAINT no_self_referral CHECK (referrer_id != referred_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_proposal ON referrals(proposal_id);
CREATE INDEX IF NOT EXISTS idx_referrals_converted ON referrals(converted) WHERE converted = TRUE;

-- ==============================================
-- SHARE ANALYTICS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS share_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    share_type TEXT NOT NULL CHECK (share_type IN ('link', 'qr', 'twitter', 'discord', 'telegram', 'other')),
    referral_code TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    last_clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_share_analytics_proposal ON share_analytics(proposal_id);
CREATE INDEX IF NOT EXISTS idx_share_analytics_user ON share_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_share_analytics_code ON share_analytics(referral_code);
CREATE INDEX IF NOT EXISTS idx_share_analytics_type ON share_analytics(share_type);

-- ==============================================
-- REFERRAL DAILY LIMITS TABLE
-- ==============================================
CREATE TABLE IF NOT EXISTS referral_daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    referrals_count INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    
    UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_referral_daily_user_date ON referral_daily_stats(user_id, date);

-- ==============================================
-- HELPER FUNCTIONS
-- ==============================================

-- Helper function to safely increment a field
CREATE OR REPLACE FUNCTION increment_field(table_name TEXT, field_name TEXT, row_filter TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('UPDATE %I SET %I = %I + 1 WHERE %s', table_name, field_name, field_name, row_filter);
END;
$$ LANGUAGE plpgsql;

-- Function to get daily referral limit based on user level
CREATE OR REPLACE FUNCTION get_daily_referral_limit(user_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Base limit: 10 referrals per day
    -- Increases by 5 per level, max 50
    RETURN LEAST(10 + (user_level * 5), 50);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user can refer more people today
CREATE OR REPLACE FUNCTION can_refer_today(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_level INTEGER;
    v_daily_limit INTEGER;
    v_today_count INTEGER;
BEGIN
    -- Get user level
    SELECT level INTO v_user_level FROM users WHERE id = p_user_id;
    
    -- Get daily limit based on level
    v_daily_limit := get_daily_referral_limit(v_user_level);
    
    -- Get today's referral count
    SELECT COALESCE(referrals_count, 0) INTO v_today_count
    FROM referral_daily_stats
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
    
    RETURN v_today_count < v_daily_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to increment daily referral count
CREATE OR REPLACE FUNCTION increment_daily_referral(p_user_id UUID, p_coins INTEGER)
RETURNS VOID AS $$
BEGIN
    INSERT INTO referral_daily_stats (user_id, date, referrals_count, coins_earned)
    VALUES (p_user_id, CURRENT_DATE, 1, p_coins)
    ON CONFLICT (user_id, date)
    DO UPDATE SET
        referrals_count = referral_daily_stats.referrals_count + 1,
        coins_earned = referral_daily_stats.coins_earned + p_coins;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- GRANT PERMISSIONS
-- ==============================================

-- Allow authenticated users to read their own referrals
GRANT SELECT ON referrals TO authenticated;
GRANT SELECT ON share_analytics TO authenticated;
GRANT SELECT ON referral_daily_stats TO authenticated;

-- Service role can do everything
GRANT ALL ON referrals TO service_role;
GRANT ALL ON share_analytics TO service_role;
GRANT ALL ON referral_daily_stats TO service_role;

COMMENT ON TABLE referrals IS 'Tracks user referrals for proposals';
COMMENT ON TABLE share_analytics IS 'Tracks sharing behavior and click/conversion metrics';
COMMENT ON TABLE referral_daily_stats IS 'Daily limits and stats for referrals per user';
