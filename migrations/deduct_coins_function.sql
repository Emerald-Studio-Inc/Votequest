-- Create deduct_coins RPC function for atomic coin deduction
-- SAFE TO RUN MULTIPLE TIMES

-- Drop function if exists (for clean re-creation)
DROP FUNCTION IF EXISTS deduct_coins(UUID, INTEGER);

-- Create the deduct_coins function
CREATE OR REPLACE FUNCTION deduct_coins(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS TABLE(coins INTEGER) AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Get current balance with row lock to prevent race conditions
  SELECT users.coins INTO v_current_balance
  FROM users
  WHERE users.id = p_user_id
  FOR UPDATE;

  -- Check if user exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check if enough coins
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient coins. Current: %, Required: %', v_current_balance, p_amount;
  END IF;

  -- Deduct coins atomically
  UPDATE users
  SET coins = coins - p_amount
  WHERE users.id = p_user_id;

  -- Return new balance
  RETURN QUERY 
    SELECT users.coins 
    FROM users 
    WHERE users.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION deduct_coins IS 'Atomically deducts coins from a user account with balance validation. Prevents race conditions.';
