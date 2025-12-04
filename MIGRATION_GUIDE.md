# Database Migration Guide for Production

## ⚠️ CRITICAL: READ BEFORE PROCEEDING

This guide walks you through running database migrations in Supabase to prepare VoteQuest for production deployment.

**IMPORTANT SAFETY MEASURES:**
1. ✅ **Backup your database** before running ANY migrations
2. ✅ **Test in development/staging first** before production
3. ✅ **Run migrations during low-traffic periods**
4. ✅ **Have a rollback plan ready**

---

## Prerequisites

- [ ] Access to Supabase SQL Editor
- [ ] Database backup created (Settings → Database → Backups)
- [ ] Admin access to your Supabase project
- [ ] 10-15 minutes of uninterrupted time

---

## Migration Order

Run these migrations **in the exact order listed**:

### 1. Auth System Migration (CRITICAL) ⛔

**File:** [migrations/auth_system.sql](file:///c:/Users/USER/Documents/Votequest/migrations/auth_system.sql)

**What it does:**
- Adds `auth_id`, `email`, `username`, `age_verified` columns to users table
- Links users table to Supabase Auth system
- Updates existing users if any

**Steps:**
1. Open Supabase SQL Editor
2. Copy the entire contents of `auth_system.sql`
3. Paste into SQL Editor
4. Click "Run" (or press Ctrl+Enter)
5. Verify: Should see "Success. No rows returned"

**Verification:**
```sql
-- Check that new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('auth_id', 'email', 'username', 'age_verified');

-- Should return 4 rows
```

---

### 2. Coin Transactions Table

**File:** [migrations/coin_transactions.sql](file:///c:/Users/USER/Documents/Votequest/migrations/coin_transactions.sql)

**What it does:**
- Creates `coin_transactions` table for coin transaction history
- Adds indexes for performance
- Sets up RLS policies

**Steps:**
1. Copy contents of `coin_transactions.sql`
2. Paste into SQL Editor
3. Click "Run"

**Verification:**
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'coin_transactions'
) as table_exists;

-- Should return: table_exists = true
```

---

### 3. Notifications System

**File:** [migrations/notifications.sql](file:///c:/Users/USER/Documents/Votequest/migrations/notifications.sql)

**What it does:**
- Creates `notifications` table
- Sets up notification types and triggers

**Steps:**
1. Copy contents of `notifications.sql`
2. Paste into SQL Editor
3. Click "Run"

**Verification:**
```sql
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'notifications'
) as table_exists;

-- Should return: table_exists = true
```

---

### 4. Share & Referral System

**File:** [migrations/share_referral_system.sql](file:///c:/Users/USER/Documents/Votequest/migrations/share_referral_system.sql)

**What it does:**
- Creates `referrals`, `share_analytics`, and `referral_daily_stats` tables
- Adds RPC functions for referral limiting

**Steps:**
1. Copy contents of `share_referral_system.sql`
2. Paste into SQL Editor
3. Click "Run"

**Verification:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('referrals', 'share_analytics', 'referral_daily_stats');

-- Should return 3 rows
```

---

### 5. Coin Feature Columns

**File:** [migrations/add_coin_feature_columns.sql](file:///c:/Users/USER/Documents/Votequest/migrations/add_coin_feature_columns.sql)

**What it does:**
- Adds `power_boost` and `boost_expiry` to votes table
- Adds `featured` and `featured_until` to proposals table

**Steps:**
1. Copy contents of `add_coin_feature_columns.sql`
2. Paste into SQL Editor
3. Click "Run"

**Verification:**
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'votes' AND column_name IN ('power_boost', 'boost_expiry')
UNION
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'proposals' AND column_name IN ('featured', 'featured_until');

-- Should return 4 rows
```

---

### 6. Deduct Coins Function

**File:** [migrations/deduct_coins_function.sql](file:///c:/Users/USER/Documents/Votequest/migrations/deduct_coins_function.sql)

**What it does:**
- Creates `deduct_coins()` RPC function for safe coin spending

**Steps:**
1. Copy contents of `deduct_coins_function.sql`
2. Paste into SQL Editor
3. Click "Run"

**Verification:**
```sql
SELECT EXISTS (
  SELECT FROM information_schema.routines 
  WHERE routine_name = 'deduct_coins'
) as function_exists;

-- Should return: function_exists = true
```

---

### 7. Database Indexes (Performance)

**File:** [database_indexes.sql](file:///c:/Users/USER/Documents/Votequest/database_indexes.sql)

**What it does:**
- Adds performance indexes for common queries
- Improves query speed as data grows

**Steps:**
1. Copy contents of `database_indexes.sql`
2. Paste into SQL Editor
3. Click "Run"

**Note:** This may take a few seconds to a minute depending on data volume.

---

### 8. Receipt System (OPTIONAL - Recommended)

**File:** [migrations/receipts_system.sql](file:///c:/Users/USER/Documents/Votequest/migrations/receipts_system.sql)

**What it does:**
- Adds `receipt_hash` column to coin_transactions (cryptographic proof)
- Adds `action_metadata` JSONB column (full receipt data)  
- Backfills existing transactions with generated hashes
- Creates index for receipt lookups

**Why you want this:**
- Every coin is backed by cryptographic proof
- Enables bulk blockchain export later
- Transaction receipts can be verified independently

**Steps:**
1. Copy contents of `receipts_system.sql`
2. Paste into SQL Editor
3. Click "Run"

**Verification:**
```sql
-- Check receipt columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'coin_transactions' 
AND column_name IN ('receipt_hash', 'action_metadata', 'verified');

-- Should return 3 rows
```

---

### 9. Production RLS Policies (SECURITY) 🔒

**File:** [migrations/production_rls_policies.sql](file:///c:/Users/USER/Documents/Votequest/migrations/production_rls_policies.sql)

**What it does:**
- **CRITICAL SECURITY UPDATE**
- Replaces permissive "allow all" policies with secure ownership-based policies
- Ensures users can only modify their own data

**Steps:**
1. Copy contents of `production_rls_policies.sql`
2. Paste into SQL Editor
3. Click "Run"

**Verification:**
```sql
-- Check that secure policies are in place
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Should see policies like "Users can update own profile" 
-- NOT "Allow public update on users"
```

---

## Complete Verification

After all migrations, run this comprehensive check:

**File:** [migrations/VERIFY_MIGRATIONS.sql](file:///c:/Users/USER/Documents/Votequest/migrations/VERIFY_MIGRATIONS.sql)

```sql
SELECT 
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'coin_transactions') as coin_transactions_exists,
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') as notifications_exists,
  EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'deduct_coins') as deduct_coins_exists,
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'votes' AND column_name = 'power_boost') as power_boost_exists,
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'proposals' AND column_name = 'featured') as featured_exists,
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'auth_id') as auth_id_exists;

-- ALL columns should return TRUE
```

**Expected Result:**
```
coin_transactions_exists | notifications_exists | deduct_coins_exists | power_boost_exists | featured_exists | auth_id_exists
-------------------------|----------------------|---------------------|-------------------|-----------------|---------------
true                     | true                 | true                | true              | true            | true
```

---

## Testing After Migration

### Test 1: Health Check
```bash
# Visit health endpoint
https://your-app-url/api/health

# Should return:
{
  "status": "healthy",
  "timestamp": "...",
  "checks": {
    "database": {
      "status": "connected",
      "latency": <number>
    }
  },
  "version": "1.0.0"
}
```

### Test 2: User Authentication
1. Clear browser cookies/storage
2. Try logging in with email
3. Check magic link email
4. Complete login
5. Verify user profile is created with `auth_id` populated

**Check database:**
```sql
-- Should see users with auth_id
SELECT id, email, auth_id, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
```

### Test 3: Vote Submission
1. Log in as a user
2. Navigate to an active proposal
3. Select an option
4. Complete CAPTCHA
5. Submit vote
6. Check that coins were awarded

**Check database:**
```sql
-- Check recent vote
SELECT v.*, u.email as voter_email
FROM votes v
JOIN users u ON v.user_id = u.id
ORDER BY v.voted_at DESC
LIMIT 1;

-- Check recent coin transaction
SELECT * 
FROM coin_transactions 
ORDER BY created_at DESC 
LIMIT 1;
```

---

## Rollback Instructions

If something goes wrong, you have two options:

### Option A: Restore from Backup
1. Go to Supabase Dashboard → Settings → Database → Backups
2. Find the backup from before migration
3. Click "Restore"
4. Confirm restoration

### Option B: Manual Rollback
Run the cleanup script:
```sql
-- File: migrations/reset_database.sql
-- WARNING: This drops all tables and data!
-- Use with extreme caution
```

---

## Troubleshooting

### Issue: "relation already exists"
**Solution:** The table/column already exists. Skip that specific migration or check if it was partially run.

### Issue: "must be owner of table"
**Solution:** You need admin privileges. Use the Supabase SQL Editor which runs as admin.

### Issue: Migration hangs/takes forever
**Solution:** 
- Check for long-running queries in Database → Query Performance
- Cancel the query (if safe)
- Check for blocking locks

### Issue: RLS policies prevent access
**Solution:**
- Ensure users have `auth_id` populated
- Check that `auth.uid()` returns the correct user ID
- Temporarily disable RLS for debugging: `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`

---

## Post-Migration Checklist

- [ ] All migrations completed successfully
- [ ] Verification query returns all TRUE
- [ ] Health check endpoint returns 200
- [ ] User can register and login
- [ ] User can submit votes
- [ ] Coins are awarded correctly
- [ ] No errors in Supabase logs
- [ ] RLS policies are protecting data (test with different users)

---

## Next Steps

After migrations are complete:

1. ✅ **Update environment variables** in Netlify/Vercel
2. ✅ **Deploy updated code** with new files
3. ✅ **Test in production** with real users
4. ✅ **Monitor application logs** for 24-48 hours
5. ✅ **Set up database backups** (daily recommended)

---

## Need Help?

If you encounter issues:
1. Check Supabase logs (Logs → Database)
2. Review error messages carefully
3. Restore from backup if needed
4. Reach out for assistance with specific error messages

**Remember:** Database migrations are irreversible without backups. Always backup first!
