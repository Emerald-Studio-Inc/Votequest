# Database Migration Guide

## Migration Files (Run in this order)

### 1. Core Schema Setup
**File:** `supabase_setup.sql`
- Creates base tables: users, proposals, proposal_options, votes, achievements, user_achievements
- Must be run FIRST

### 2. Streak System
**File:** `supabase_streak_migration.sql`
- Adds `last_vote_date` column to users table
- Required for daily streak tracking

### 3. Category System
**File:** `supabase_category_migration.sql`
- Adds `category` column to proposals table
- Enables proposal categorization (Community, Governance, Technical, etc.)

### 4. Coin System
**File:** `supabase_coins_migration.sql`
- Adds `coins` column to users table
- Creates `coin_transactions` table for tracking VQC (VoteQuest Coins)
- Creates `notifications` table for user notifications

### 5. On-Chain ID Tracking
**File:** `supabase_onchain_id_migration.sql`
- Adds `onchain_id` column to proposals table
- Required for linking database proposals to blockchain IDs

### 6. Transaction Hash Tracking
**File:** `supabase_tx_hash_migration.sql`
- Adds `tx_hash` column to proposals table
- Enables self-healing mechanism for proposals

## Verification Checklist

After running migrations, verify:
- [ ] All tables exist in Supabase
- [ ] Users table has: coins, streak, last_vote_date
- [ ] Proposals table has: category, onchain_id, tx_hash
- [ ] Coin transactions and notifications tables exist

## Optional Files

- `supabase_seed.sql` - Sample data for testing (DO NOT run in production)
- `supabase_cleanup.sql` - Cleanup/rollback scripts
- `supabase_achievements.sql` - Achievement definitions
