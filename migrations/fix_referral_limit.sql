-- FIX: Reset limits and make functions robust
-- Run this in Supabase SQL Editor

-- 1. Fix the limit calculation to handle missing levels
CREATE OR REPLACE FUNCTION get_daily_referral_limit(user_level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Default to level 1 if null. Base 10 + (Level * 5). Max 50.
    RETURN LEAST(10 + (COALESCE(user_level, 1) * 5), 50);
END;
$$ LANGUAGE plpgsql;

-- 2. Fix the check function
CREATE OR REPLACE FUNCTION can_refer_today(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_level INTEGER;
    v_daily_limit INTEGER;
    v_today_count INTEGER;
BEGIN
    -- Get user level
    SELECT level INTO v_user_level FROM users WHERE id = p_user_id;
    
    -- Get daily limit
    v_daily_limit := get_daily_referral_limit(v_user_level);
    
    -- Get today's count
    SELECT COALESCE(referrals_count, 0) INTO v_today_count
    FROM referral_daily_stats
    WHERE user_id = p_user_id AND date = CURRENT_DATE;
    
    -- Handle case where no record exists (v_today_count is null from SELECT INTO if no row)
    IF v_today_count IS NULL THEN
        v_today_count := 0;
    END IF;
    
    RETURN v_today_count < v_daily_limit;
END;
$$ LANGUAGE plpgsql;

-- 3. RESET all daily stats for today (clears the error)
DELETE FROM referral_daily_stats WHERE date = CURRENT_DATE;
