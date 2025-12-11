-- Fix Subscription Schema Compatibility (REVISED)
-- Run this to resolve conflicts between 'institutional' and 'stripe' migrations

DO $$ 
BEGIN
    -- 1. Drop old constraints and defaults to free up the column
    ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_subscription_tier_check;
    ALTER TABLE organizations ALTER COLUMN subscription_tier DROP DEFAULT;

    -- 2. Update existing text values to numeric strings
    -- This ensures the column only contains '1', '2', '3' before we cast to integer
    UPDATE organizations 
    SET subscription_tier = '1' 
    WHERE subscription_tier IN ('free', 'school', 'starter', '1');

    UPDATE organizations 
    SET subscription_tier = '2' 
    WHERE subscription_tier IN ('professional', '2');

    UPDATE organizations 
    SET subscription_tier = '3' 
    WHERE subscription_tier IN ('enterprise', '3');

    -- Default any leftovers to '1'
    UPDATE organizations 
    SET subscription_tier = '1' 
    WHERE subscription_tier NOT IN ('1', '2', '3');

    -- 3. Now it is safe to convert to INTEGER
    ALTER TABLE organizations 
    ALTER COLUMN subscription_tier TYPE INTEGER 
    USING subscription_tier::integer;

    -- 4. Add the new constraint and default
    ALTER TABLE organizations ADD CONSTRAINT organizations_subscription_tier_check 
    CHECK (subscription_tier IN (1, 2, 3));

    ALTER TABLE organizations ALTER COLUMN subscription_tier SET DEFAULT 1;

    -- 5. Ensure subscription_id column exists
    -- (We do this last or separately, checking if column exists is standard)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='organizations' AND column_name='subscription_id') THEN
        ALTER TABLE organizations ADD COLUMN subscription_id UUID REFERENCES subscriptions(id);
    END IF;

    RAISE NOTICE '✅ Subscription tier schema updated successfully.';
    
END $$;
