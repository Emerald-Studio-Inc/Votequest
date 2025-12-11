-- Add voting_strategy to proposals
ALTER TABLE proposals 
ADD COLUMN IF NOT EXISTS voting_strategy text DEFAULT 'standard' CHECK (voting_strategy IN ('standard', 'quadratic'));

-- Add quantitative data to votes
ALTER TABLE votes 
ADD COLUMN IF NOT EXISTS voting_power integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS coin_cost integer DEFAULT 0;

-- Comment
COMMENT ON COLUMN votes.voting_power IS 'The effective number of votes cast (intensity)';
COMMENT ON COLUMN votes.coin_cost IS 'The actual cost in coins for this vote batch';

-- RPC to increment (weighted)
CREATE OR REPLACE FUNCTION increment_option_votes_weighted(option_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE proposal_options
  SET votes = votes + amount
  WHERE id = option_id;
END;
$$ LANGUAGE plpgsql;

-- Support for Institutional Rooms (voting_rooms / room_votes)
ALTER TABLE voting_rooms
ADD COLUMN IF NOT EXISTS voting_strategy text DEFAULT 'standard' CHECK (voting_strategy IN ('standard', 'quadratic'));

ALTER TABLE room_votes
ADD COLUMN IF NOT EXISTS voting_power integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS coin_cost integer DEFAULT 0;

COMMENT ON COLUMN voting_rooms.voting_strategy IS 'Strategy: standard or quadratic';

-- RPC for weighted room options
CREATE OR REPLACE FUNCTION increment_room_option_votes_weighted(option_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE room_options
  SET votes = votes + amount
  WHERE id = option_id;
END;
$$ LANGUAGE plpgsql;
