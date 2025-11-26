-- ============================================================================
-- Analytics Tracking Functions
-- Properly tracks voting_power, streak, and global_rank for users
-- ============================================================================

-- Function 1: Update voting power when user votes
-- Voting power increases with each vote
CREATE OR REPLACE FUNCTION update_voting_power()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users
    SET 
        voting_power = voting_power + 1,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for voting power
DROP TRIGGER IF EXISTS trigger_update_voting_power ON votes;
CREATE TRIGGER trigger_update_voting_power
    AFTER INSERT ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_voting_power();

-- Function 2: Update streak when user votes
-- Checks if user voted yesterday, updates streak accordingly
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_vote_date DATE;
    current_streak INT;
BEGIN
    -- Get the user's last vote date (excluding this one)
    SELECT MAX(DATE(voted_at)) INTO last_vote_date
    FROM votes
    WHERE user_id = NEW.user_id
    AND id != NEW.id;
    
    -- Get current streak
    SELECT streak INTO current_streak
    FROM users
    WHERE id = NEW.user_id;
    
    -- Update streak logic
    IF last_vote_date IS NULL THEN
        -- First vote ever
        UPDATE users
        SET streak = 1, updated_at = NOW()
        WHERE id = NEW.user_id;
    ELSIF last_vote_date = CURRENT_DATE - INTERVAL '1 day' THEN
        -- Voted yesterday, increment streak
        UPDATE users
        SET streak = current_streak + 1, updated_at = NOW()
        WHERE id = NEW.user_id;
    ELSIF last_vote_date = CURRENT_DATE THEN
        -- Already voted today, don't change streak
        NULL;
    ELSE
        -- Streak broken, reset to 1
        UPDATE users
        SET streak = 1, updated_at = NOW()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for streak tracking
DROP TRIGGER IF EXISTS trigger_update_user_streak ON votes;
CREATE TRIGGER trigger_update_user_streak
    AFTER INSERT ON votes
    FOR EACH ROW
    EXECUTE FUNCTION update_user_streak();

-- Function 3: Calculate and update global rankings
-- Should be called periodically or after significant changes
CREATE OR REPLACE FUNCTION update_global_rankings()
RETURNS void AS $$
BEGIN
    -- Update rankings based on XP (primary) and votes_count (secondary)
    WITH ranked_users AS (
        SELECT 
            id,
            ROW_NUMBER() OVER (
                ORDER BY xp DESC, votes_count DESC, created_at ASC
            ) as new_rank
        FROM users
        WHERE xp > 0 OR votes_count > 0  -- Only rank active users
    )
    UPDATE users u
    SET 
        global_rank = ru.new_rank,
        updated_at = NOW()
    FROM ranked_users ru
    WHERE u.id = ru.id;
    
    -- Set unranked users to 0
    UPDATE users
    SET global_rank = 0
    WHERE (xp = 0 AND votes_count = 0) AND global_rank != 0;
END;
$$ LANGUAGE plpgsql;

-- Function 4: Trigger to update rankings after XP or vote changes
-- This ensures rankings stay relatively fresh
CREATE OR REPLACE FUNCTION queue_ranking_update()
RETURNS TRIGGER AS $$
BEGIN
    -- In a real production app, this would queue a background job
    -- For now, we'll update rankings directly but limit frequency
    
    -- Only update if it's been more than 5 minutes since last update
    -- or if this is a significant change (level up, etc.)
    IF (NEW.level > OLD.level) OR 
       (EXTRACT(EPOCH FROM (NOW() - OLD.updated_at)) > 300) THEN
        PERFORM update_global_rankings();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for ranking updates (disabled by default for performance)
-- Uncomment to enable automatic ranking updates
-- DROP TRIGGER IF EXISTS trigger_queue_ranking_update ON users;
-- CREATE TRIGGER trigger_queue_ranking_update
--     AFTER UPDATE OF xp, votes_count ON users
--     FOR EACH ROW
--     EXECUTE FUNCTION queue_ranking_update();

-- Function 5: Get user analytics summary
-- Convenient function to fetch all analytics data at once
CREATE OR REPLACE FUNCTION get_user_analytics(p_user_id UUID)
RETURNS TABLE (
    user_id UUID,
    level INT,
    xp INT,
    next_level_xp INT,
    voting_power INT,
    votes_count INT,
    streak INT,
    global_rank INT,
    total_users INT,
    rank_percentile NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.level,
        u.xp,
        POWER(u.level + 1, 2) * 100 as next_level_xp,
        u.voting_power,
        u.votes_count,
        u.streak,
        u.global_rank,
        (SELECT COUNT(*)::INT FROM users WHERE xp > 0 OR votes_count > 0) as total_users,
        CASE 
            WHEN u.global_rank > 0 THEN 
     ROUND((1 - (u.global_rank::NUMERIC / NULLIF((SELECT COUNT(*) FROM users WHERE global_rank > 0), 0))) * 100, 2)
            ELSE 0
        END as rank_percentile
    FROM users u
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Initial Setup: Calculate existing data
-- ============================================================================

-- Initialize voting_power based on existing votes
UPDATE users u
SET voting_power = (
    SELECT COUNT(*)::INT
    FROM votes v
    WHERE v.user_id = u.id
)
WHERE voting_power IS NULL OR voting_power = 0;

-- Initialize global rankings
SELECT update_global_rankings();

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Index for ranking queries
CREATE INDEX IF NOT EXISTS idx_users_ranking 
ON users(xp DESC, votes_count DESC, created_at ASC)
WHERE xp > 0 OR votes_count > 0;

-- Index for streak calculations
CREATE INDEX IF NOT EXISTS idx_votes_user_date 
ON votes(user_id, voted_at DESC);

-- ============================================================================
-- Comments for Documentation
-- ============================================================================

COMMENT ON FUNCTION update_voting_power() IS 'Automatically increments voting_power when user casts a vote';
COMMENT ON FUNCTION update_user_streak() IS 'Tracks consecutive days of voting activity';
COMMENT ON FUNCTION update_global_rankings() IS 'Recalculates global user rankings based on XP and activity';
COMMENT ON FUNCTION get_user_analytics(UUID) IS 'Returns comprehensive analytics data for a user';

COMMENT ON COLUMN users.voting_power IS 'Total number of votes cast by user (cumulative influence)';
COMMENT ON COLUMN users.streak IS 'Current streak of consecutive days with voting activity';
COMMENT ON COLUMN users.global_rank IS 'User ranking among all users (1 = highest, based on XP and votes)';
