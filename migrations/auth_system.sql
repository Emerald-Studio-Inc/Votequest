-- VoteQuest - Auth System Migration
-- This migration removes blockchain wallet authentication and adds email-based auth with user profiles

-- ==========================================
-- 1. ADD NEW COLUMNS TO USERS TABLE
-- ==========================================

-- Add email authentication
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS auth_id UUID; -- Supabase auth user ID

-- Add profile information
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT FALSE;

-- Add preferences
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS voting_interests TEXT[], -- Array: ['Politics', 'Environment', 'Technology']
  ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notification_in_app BOOLEAN DEFAULT TRUE;

-- ==========================================
-- 2. SET CONSTRAINTS
-- ==========================================

-- Make email and username required and unique (after we populate them)
-- We'll do this in a separate transaction after data migration

-- ==========================================
-- 3. CREATE INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);

-- ==========================================
-- 4. MIGRATE EXISTING DATA (OPTIONAL)
-- ==========================================

-- Generate usernames from wallet addresses for existing users
UPDATE users
SET 
  email = NULL, -- Will be set when they login with email
  username = 'user_' || SUBSTRING(wallet_address FROM 1 FOR 8),
  age_verified = TRUE -- Assume existing users are verified
WHERE username IS NULL;

-- ==========================================
-- 5. DROP OLD COLUMNS (AFTER CONFIRMATION)
-- ==========================================

-- WARNING: Uncomment these after confirming the migration worked
-- ALTER TABLE users DROP COLUMN wallet_address;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check users table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Count users with email vs wallet
SELECT 
  COUNT(*) as total_users,
  COUNT(email) as users_with_email,
  COUNT(wallet_address) as users_with_wallet
FROM users;
