# Force Fresh Deploy

The voting fixes are in the code but Netlify may not have rebuilt. 

**Quick fix - add this to trigger a deploy:**

1. Go to: https://app.netlify.com/sites/votequest/deploys
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait 2-3 minutes for build
4. Hard refresh browser ONE MORE TIME
5. Vote - it WILL work

**OR if that doesn't work:**

The issue is `option_number` field. Run this in Supabase to add it if missing:

```sql
-- Check if option_number exists
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'proposal_options' AND column_name = 'option_number';

-- If not found, add it:
ALTER TABLE proposal_options ADD COLUMN IF NOT EXISTS option_number INT;

-- Update existing options:
UPDATE proposal_options 
SET option_number = subq.row_num - 1
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY proposal_id ORDER BY id) as row_num
  FROM proposal_options
) subq
WHERE proposal_options.id = subq.id AND option_number IS NULL;
```

This ensures every option has an option_number (0, 1, 2, etc).
