-- Add engagement tracking fields and proposal views table
-- SAFE TO RUN MULTIPLE TIMES

-- 1. Add fields to users table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'completed_onboarding'
  ) THEN
    ALTER TABLE users ADD COLUMN completed_onboarding BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 2. Create proposal views tracking table (if not exists)
CREATE TABLE IF NOT EXISTS proposal_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, proposal_id)
);

-- 3. Create indexes for better performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_proposal_views_user ON proposal_views(user_id);
CREATE INDEX IF NOT EXISTS idx_proposal_views_proposal ON proposal_views(proposal_id);

-- 4. Enable RLS (Row Level Security)
ALTER TABLE proposal_views ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist, then recreate
DROP POLICY IF EXISTS "Users can view their own proposal views" ON proposal_views;
DROP POLICY IF EXISTS "Users can insert their own proposal views" ON proposal_views;

-- 6. Create RLS policies
CREATE POLICY "Users can view their own proposal views"
  ON proposal_views FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert their own proposal views"
  ON proposal_views FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);
