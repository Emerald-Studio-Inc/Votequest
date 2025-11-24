-- Atomic Coin Deduction Function
-- Prevents race conditions by checking and updating in single transaction
-- Returns null if insufficient coins

CREATE OR REPLACE FUNCTION deduct_coins(
    user_id UUID,
    amount INTEGER
)
RETURNS TABLE(coins INTEGER) AS $$
BEGIN
    -- Atomic update with balance check
    RETURN QUERY
    UPDATE users
    SET coins = users.coins - amount
    WHERE users.id = user_id
      AND users.coins >= amount
    RETURNING users.coins;
END;
$$ LANGUAGE plpgsql;
