-- Production Row Level Security (RLS) Policies
-- Run this migration to tighten security policies for production
-- IMPORTANT: Backup your database before running this migration!

-- =============================================================================
-- USERS TABLE - User Profile Security
-- =============================================================================

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow public select on users" ON users;
DROP POLICY IF EXISTS "Allow public insert on users" ON users;
DROP POLICY IF EXISTS "Allow public update on users" ON users;

-- New secure policies

-- Allow users to view all profiles (for leaderboard, etc.)
CREATE POLICY "Public can view user profiles"
  ON users FOR SELECT
  USING (true);

-- Allow authenticated users to create their own profile
CREATE POLICY "Authenticated users can create own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = auth_id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);

-- Prevent users from deleting profiles
-- (If you want to allow this, add a DELETE policy)

-- =============================================================================
-- PROPOSALS TABLE - Proposal Security
-- =============================================================================

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow public select on proposals" ON proposals;
DROP POLICY IF EXISTS "Allow public insert on proposals" ON proposals;

-- New secure policies

-- Everyone can view proposals
CREATE POLICY "Public can view proposals"
  ON proposals FOR SELECT
  USING (true);

-- Only authenticated users can create proposals
-- AND they must set themselves as the creator
CREATE POLICY "Authenticated users can create proposals"
  ON proposals FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = (SELECT auth_id FROM users WHERE id = created_by)
  );

-- Only the creator can update their own proposals
CREATE POLICY "Creators can update own proposals"
  ON proposals FOR UPDATE
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = created_by))
  WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = created_by));

-- =============================================================================
-- PROPOSAL_OPTIONS TABLE - Proposal Options Security
-- =============================================================================

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow public select on proposal_options" ON proposal_options;
DROP POLICY IF EXISTS "Allow public insert on proposal_options" ON proposal_options;
DROP POLICY IF EXISTS "Allow public update on proposal_options" ON proposal_options;

-- New secure policies

-- Everyone can view proposal options
CREATE POLICY "Public can view proposal options"
  ON proposal_options FOR SELECT
  USING (true);

-- Only proposal creators can add options to their proposals
CREATE POLICY "Creators can add options to own proposals"
  ON proposal_options FOR INSERT
  WITH CHECK (
    auth.uid() = (
      SELECT u.auth_id 
      FROM proposals p 
      JOIN users u ON p.created_by = u.id 
      WHERE p.id = proposal_id
    )
  );

-- Only proposal creators can update options
CREATE POLICY "Creators can update own proposal options"
  ON proposal_options FOR UPDATE
  USING (
    auth.uid() = (
      SELECT u.auth_id 
      FROM proposals p 
      JOIN users u ON p.created_by = u.id 
      WHERE p.id = proposal_id
    )
  );

-- =============================================================================
-- VOTES TABLE - Vote Security
-- =============================================================================

-- Drop old permissive policies
DROP POLICY IF EXISTS "Allow public select on votes" ON votes;
DROP POLICY IF EXISTS "Allow public insert on votes" ON votes;

-- New secure policies

-- Users can only view their own votes (privacy)
-- Public can see vote COUNTS but not individual votes
CREATE POLICY "Users can view own votes"
  ON votes FOR SELECT
  USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id));

-- Only authenticated users can vote
-- AND they can only vote as themselves
CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND auth.uid() = (SELECT auth_id FROM users WHERE id = user_id)
  );

-- Votes cannot be updated or deleted (immutability)
-- No UPDATE or DELETE policies = no one can change votes

-- =============================================================================
-- COIN_TRANSACTIONS TABLE - Coin Security (if table exists)
-- =============================================================================

-- Drop old permissive policies if they exist
DROP POLICY IF EXISTS "Allow public select on coin_transactions" ON coin_transactions;
DROP POLICY IF EXISTS "Allow public insert on coin_transactions" ON coin_transactions;

-- New secure policies (only create if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'coin_transactions') THEN
    -- Users can view their own transaction history
    EXECUTE 'CREATE POLICY "Users can view own transactions"
      ON coin_transactions FOR SELECT
      USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id))';

    -- Only server-side functions can create transactions (via service role)
    -- No INSERT policy for regular users = only admin/service role can insert
  END IF;
END $$;

-- =============================================================================
-- NOTIFICATIONS TABLE - Notification Security (if table exists)
-- =============================================================================

-- Drop old permissive policies if they exist
DROP POLICY IF EXISTS "Allow public select on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow public insert on notifications" ON notifications;
DROP POLICY IF EXISTS "Allow public update on notifications" ON notifications;

-- New secure policies (only create if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    -- Users can view their own notifications
    EXECUTE 'CREATE POLICY "Users can view own notifications"
      ON notifications FOR SELECT
      USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id))';

    -- Users can mark their own notifications as read
    EXECUTE 'CREATE POLICY "Users can update own notifications"
      ON notifications FOR UPDATE
      USING (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id))
      WITH CHECK (auth.uid() = (SELECT auth_id FROM users WHERE id = user_id))';

    -- Only server-side can create notifications
    -- No INSERT policy for regular users
  END IF;
END $$;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Check that policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Expected total: ~14 policies
-- If you see old "Allow public..." policies, re-run the DROP statements above
