# Applying RLS Security Policies - Step-by-Step Guide

## What These Policies Do

✅ **Public Read Access**: Users can view proposals, users (leaderboard), options, achievements
🔒 **Write Protection**: ALL write operations (insert/update/delete) must go through API routes
🔒 **Private Data**: Votes, transactions, notifications hidden from direct database access
✅ **Service Role Bypass**: Your API routes using `supabaseAdmin` can do everything

## How to Apply

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your VoteQuest project
3. Navigate to **SQL Editor** (left sidebar)

### Step 2: Run the Security Policies Script

1. Click **New Query**
2. Copy the entire contents of `supabase_security_policies.sql`
3. Paste into the SQL editor
4. Click **Run** (or press Ctrl+Enter)

### Step 3: Verify Policies Are Active

The script includes a verification query at the end. You should see output like:

```
| tablename           | policyname                      | cmd    | access_rule  |
|---------------------|---------------------------------|--------|--------------|
| users               | users_read_public               | SELECT | PUBLIC READ  |
| users               | users_write_api_only            | ALL    | API ONLY     |
| proposals           | proposals_read_public           | SELECT | PUBLIC READ  |
| proposals           | proposals_write_api_only        | ALL    | API ONLY     |
| votes               | votes_read_none                 | SELECT | API ONLY     |
| votes               | votes_write_api_only            | ALL    | API ONLY     |
... (more rows)
```

### Step 4: Test Your App

1. Open http://localhost:3000
2. Connect your wallet
3. Try these actions:
   - ✅ View proposals (should work)
   - ✅ Cast a vote (should work via API)
   - ✅ Create a proposal (should work via API)
   - ✅ View your coin balance (should work via API)

### Step 5: Verify Security

Open browser DevTools → Console and try to query the database directly:

```javascript
// This should fail or return empty (secure!)
const { data } = await supabase.from('votes').select('*');
console.log(data); // Should be empty/null

// This should work (public read)
const { data: proposals } = await supabase.from('proposals').select('*');
console.log(proposals); // Should show proposals
```

## Rollback Plan

If something breaks, run this emergency rollback:

```sql
-- EMERGENCY: Restore public access
DROP POLICY IF EXISTS "users_read_public" ON users;
DROP POLICY IF EXISTS "users_write_api_only" ON users;
CREATE POLICY "Allow public select on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow public insert on users" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on users" ON users FOR UPDATE USING (true);

-- Repeat for other tables as needed
```

## What Changed

### Before (INSECURE):
- Anyone could insert/update/delete database records directly
- Votes could be inspected by anyone
- User balances could be modified without validation

### After (SECURE):
- All writes must go through API routes (which validate wallet signatures)
- Service role key required for modifications
- Direct database manipulation blocked
- Sensitive data protected

## Next Steps After Applying

1. Test all critical user flows
2. Monitor for any errors in API routes
3. Proceed to Phase 2: Input Validation (adding Zod schemas)
