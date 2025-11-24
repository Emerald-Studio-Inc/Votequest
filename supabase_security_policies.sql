-- ==================================================
-- VoteQuest - Simplified RLS Policies (API-Based Auth)
-- ==================================================
-- Compatible with anon key + service role authentication
-- Service role (used in API routes) bypasses all RLS
-- ==================================================

-- ==========================================
-- 1. DROP EXISTING PUBLIC POLICIES
-- ==========================================

-- Users
DROP POLICY IF EXISTS "Allow public select on users" ON users;
DROP POLICY IF EXISTS "Allow public insert on users" ON users;
DROP POLICY IF EXISTS "Allow public update on users" ON users;

-- Proposals
DROP POLICY IF EXISTS "Allow public select on proposals" ON proposals;
DROP POLICY IF EXISTS "Allow public insert on proposals" ON proposals;

-- Proposal Options
DROP POLICY IF EXISTS "Allow public select on proposal_options" ON proposal_options;
DROP POLICY IF EXISTS "Allow public insert on proposal_options" ON proposal_options;
DROP POLICY IF EXISTS "Allow public update on proposal_options" ON proposal_options;

-- Votes
DROP POLICY IF EXISTS "Allow public select on votes" ON votes;
DROP POLICY IF EXISTS "Allow public insert on votes" ON votes;

-- ==========================================
-- 2. NEW SECURE POLICIES
-- ==========================================
-- IMPORTANT: All writes go through API routes using service role
-- These policies protect against direct database access
-- ==========================================

-- USERS TABLE
-- Read: Anyone can view public profile data (for leaderboards)
CREATE POLICY "users_read_public" ON users
  FOR SELECT
  USING (true);

-- Write: Only service role (via API)
CREATE POLICY "users_write_api_only" ON users
  FOR ALL
  USING (false);

-- PROPOSALS TABLE
-- Read: Anyone can view proposals
CREATE POLICY "proposals_read_public" ON proposals
  FOR SELECT
  USING (true);

-- Write: Only service role (via API)
CREATE POLICY "proposals_write_api_only" ON proposals
  FOR ALL
  USING (false);

-- PROPOSAL OPTIONS TABLE
-- Read: Anyone can view options
CREATE POLICY "proposal_options_read_public" ON proposal_options
  FOR SELECT
  USING (true);

-- Write: Only service role (via API)
CREATE POLICY "proposal_options_write_api_only" ON proposal_options
  FOR ALL
  USING (false);

-- VOTES TABLE
-- Read: Only see aggregated public data (no individual votes exposed)
-- Users can check if they voted via API, not direct DB access
CREATE POLICY "votes_read_none" ON votes
  FOR SELECT
  USING (false);

-- Write: Only service role (via API)
CREATE POLICY "votes_write_api_only" ON votes
  FOR ALL
  USING (false);

-- COIN TRANSACTIONS TABLE
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- Read: No direct access (users query via API endpoints)
CREATE POLICY "coin_tx_read_api_only" ON coin_transactions
  FOR SELECT
  USING (false);

-- Write: Only service role (via API)
CREATE POLICY "coin_tx_write_api_only" ON coin_transactions
  FOR ALL
  USING (false);

-- NOTIFICATIONS TABLE
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Read: No direct access (users fetch via API endpoints)
CREATE POLICY "notifications_read_api_only" ON notifications
  FOR SELECT
  USING (false);

-- Write: Only service role (via API)
CREATE POLICY "notifications_write_api_only" ON notifications
  FOR ALL
  USING (false);

-- USER ACHIEVEMENTS TABLE
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Read: No direct access (users fetch via API)
CREATE POLICY "user_achievements_read_api_only" ON user_achievements
  FOR SELECT
  USING (false);

-- Write: Only service role (via API)
CREATE POLICY "user_achievements_write_api_only" ON user_achievements
  FOR ALL
  USING (false);

-- ACHIEVEMENTS TABLE (definitions)
-- Read: Allow public read (achievement metadata)
CREATE POLICY "achievements_read_public" ON achievements
  FOR SELECT
  USING (true);

-- Write: Only service role (static data, rarely changes)
CREATE POLICY "achievements_write_api_only" ON achievements
  FOR ALL
  USING (false);

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Check all policies are in place
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd,
  CASE 
    WHEN qual = 'true'::text THEN 'PUBLIC READ'
    WHEN qual = 'false'::text THEN 'API ONLY'
    ELSE qual
  END as access_rule
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'proposals', 'proposal_options', 'votes',
    'coin_transactions', 'notifications', 'user_achievements', 'achievements'
  )
ORDER BY tablename, policyname;

-- Expected: 
-- - SELECT policies: true (public read) for users, proposals, proposal_options, achievements
-- - SELECT policies: false (API only) for votes, transactions, notifications
-- - ALL other operations: false (API only via service role)
