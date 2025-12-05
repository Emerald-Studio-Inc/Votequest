# Database Migration Instructions

## Why You Need a Cleanup Script

**Short Answer**: If duplicate profiles already exist in your database, PostgreSQL will **reject** the unique constraint with an error and the migration will **fail**.

**Technical Explanation**:
When you try to add a UNIQUE constraint to a column that already has duplicate values:
```
ERROR:  could not create unique index "users_auth_id_unique"
DETAIL:  Key (auth_id)=(abc-123-def) is duplicated.
```

The database protects data integrity by refusing to create a constraint that's already violated. You must clean up duplicates first.

## Migration Steps (In Order)

### Step 1: Backup Your Database (Optional but Recommended)
```bash
# Using Supabase CLI or dashboard, create a backup snapshot
```

### Step 2: Identify Duplicate Profiles
Run this query in Supabase SQL Editor to see if you have duplicates:

```sql
-- Check for duplicate auth_id values
SELECT 
    auth_id,
    COUNT(*) as profile_count,
    ARRAY_AGG(id) as user_ids,
    ARRAY_AGG(email) as emails
FROM users
WHERE auth_id IS NOT NULL
GROUP BY auth_id
HAVING COUNT(*) > 1
ORDER BY profile_count DESC;
```

**If this returns 0 rows**: You're lucky! Skip to Step 4 (just apply the constraints).

**If this returns rows**: You have duplicates and MUST run the cleanup script first.

### Step 3: Run Cleanup Script (If Duplicates Exist)

Open Supabase SQL Editor and run:
```
File: migrations/cleanup_duplicate_profiles.sql
```

This script will:
1. **Backup** all duplicate profiles to `users_duplicate_backup` table
2. **Merge** user stats (keeps highest XP, sums coins/votes, etc.)
3. **Update** all foreign keys (votes, proposals) to point to primary profile
4. **Delete** duplicate vote records
5. **Delete** duplicate user profiles (keeps oldest one per auth_id)
6. **Verify** no duplicates remain

Expected output:
```
Duplicate auth_id check: 0
Duplicate email check: 0
Cleanup complete! Ready to apply unique constraints
```

### Step 4: Apply Unique Constraints

Run in Supabase SQL Editor:
```
File: migrations/add_unique_constraints.sql
```

This will:
1. Add `UNIQUE` constraint on `auth_id`
2. Add `UNIQUE` index on `email` (where not null)
3. Verify vote table constraint exists
4. Run automated tests to confirm constraints work

Expected output:
```
SUCCESS: Duplicate auth_id correctly rejected
SUCCESS: Duplicate email correctly rejected
CONSTRAINT VERIFICATION COMPLETE
All constraints are working correctly!
Vote integrity vulnerability is FIXED
```

### Step 5: Deploy Updated Application

The app code changes are already made in `VoteQuestApp.tsx`. When you deploy, the app will:
- Try to create new profile when user logs in from new device
- Get unique constraint error (error code 23505)
- Fetch and use **existing** profile instead
- User gets same `user_id` across all devices ✅

### Step 6: Verify the Fix

Test the complete flow:

1. **Device A**: Log in with `test@example.com`
2. Check browser console for userId (e.g., `abc-123-xyz`)
3. Vote on a proposal
4. **Device B**: Log in with SAME email `test@example.com`
5. Check browser console - should see SAME userId: `abc-123-xyz` ✅
6. Try to vote on same proposal - should get "Already voted" error ✅
7. Check database - only 1 user profile and 1 vote record ✅

## What the Cleanup Script Does

The cleanup script (`cleanup_duplicate_profiles.sql`) handles the complex scenario where a user might have multiple profiles:

**Example Scenario**:
- User logged in from Phone → Profile A created (userId: `aaa`, coins: 50, votes: 2)
- User logged in from Laptop → Profile B created (userId: `bbb`, coins: 30, votes: 1)
- Same person, 2 profiles, voted 3 times total on different proposals

**Cleanup Process**:
1. Keeps Profile A (older)
2. Merges coins: 50 + 30 = **80 coins**
3. Updates all votes to use `userId: aaa`
4. Removes duplicate votes (if person voted twice on same proposal)
5. Deletes Profile B
6. Backs up Profile B to `users_duplicate_backup` table (in case you need it)

**Result**: User has 1 profile with merged stats, maintaining their entire history.

## Safety Features

✅ **Backup table**: All deleted profiles saved to `users_duplicate_backup`
✅ **Keeps oldest profile**: Preserves the original account
✅ **Merges stats intelligently**: Takes max XP, sums coins, best rank, etc.
✅ **Maintains vote integrity**: Removes duplicate votes on same proposal
✅ **Verification queries**: Confirms cleanup worked before proceeding

## If Something Goes Wrong

If the cleanup script has issues:

1. **Review backup table**:
```sql
SELECT * FROM users_duplicate_backup;
```

2. **Manually restore if needed** (contact me for restoration script)

3. **Check error messages** - the script has detailed logging

Remember: **Always test on a staging database first if possible!**
