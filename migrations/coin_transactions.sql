-- Create coin_transactions table for tracking all coin activity
-- SAFE TO RUN MULTIPLE TIMES

-- 1. Create coin_transactions table (minimal version)
CREATE TABLE IF NOT EXISTS coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Add columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coin_transactions' AND column_name = 'reason'
  ) THEN
    ALTER TABLE coin_transactions ADD COLUMN reason TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coin_transactions' AND column_name = 'transaction_type'
  ) THEN
    ALTER TABLE coin_transactions ADD COLUMN transaction_type TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coin_transactions' AND column_name = 'description'
  ) THEN
    ALTER TABLE coin_transactions ADD COLUMN description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coin_transactions' AND column_name = 'proposal_id'
  ) THEN
    ALTER TABLE coin_transactions ADD COLUMN proposal_id UUID REFERENCES proposals(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'coin_transactions' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE coin_transactions ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created ON coin_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_type ON coin_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_proposal ON coin_transactions(proposal_id);

-- 4. Enable RLS (Row Level Security)
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own coin transactions" ON coin_transactions;
DROP POLICY IF EXISTS "System can insert coin transactions" ON coin_transactions;

-- 6. Create RLS policies
CREATE POLICY "Users can view their own coin transactions"
  ON coin_transactions FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can insert coin transactions"
  ON coin_transactions FOR INSERT
  WITH CHECK (true);

-- 7. Add comments for documentation
COMMENT ON TABLE coin_transactions IS 'Tracks all coin earnings and spendings for users';
COMMENT ON COLUMN coin_transactions.amount IS 'Positive for earnings, negative for spending';
COMMENT ON COLUMN coin_transactions.transaction_type IS 'Type: earn_vote, earn_proposal, earn_referral, spend_boost, spend_highlight';
