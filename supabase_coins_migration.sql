-- ==================================================
-- VoteQuest Coins System - Database Schema
-- ==================================================
-- Add coins and coin transactions to track rewards
-- ==================================================

-- 1. Add coins column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_users_coins ON users(coins DESC);

-- 2. Create coin transactions table for audit trail
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- Positive for earned, negative for spent
  reason TEXT NOT NULL, -- 'proposal_created', 'vote_cast', 'achievement_unlocked', 'daily_login', 'streak_bonus'
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  metadata JSONB, -- Additional context (e.g., achievement name, streak count)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_coin_tx_user ON coin_transactions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_tx_proposal ON coin_transactions(proposal_id);

-- 3. Add notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- 'proposal_voted', 'proposal_ended', 'proposal_passed', 'proposal_failed', 'coins_earned'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL,
  read BOOLEAN DEFAULT false,
  metadata JSONB, -- Additional data (e.g., coin amount, voter address)
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE read = false;

-- ==================================================
-- Coin Reward Amounts (Reference)
-- ==================================================
-- Create Proposal: 50 VQC
-- Vote on Proposal: 10 VQC
-- First Vote Achievement: 100 VQC
-- 7-Day Streak: 200 VQC
-- Daily Login: 5 VQC
-- Level Up: Level × 50 VQC
-- ==================================================

-- Verification Queries
SELECT COUNT(*) as users_with_coins FROM users WHERE coins > 0;
SELECT COUNT(*) as total_transactions FROM coin_transactions;
SELECT COUNT(*) as unread_notifications FROM notifications WHERE read = false;
