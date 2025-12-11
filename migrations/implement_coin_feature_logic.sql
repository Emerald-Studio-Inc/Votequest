-- Migration: Implement logic for Coin Feature Effects
-- 1. Updates vote counting trigger to support Weighted Voting
-- 2. access 'vote_weight' from voter_eligibility

-- Function to update room option vote count (WITH WEIGHT SUPPORT)
CREATE OR REPLACE FUNCTION update_room_option_votes()
RETURNS TRIGGER AS $$
DECLARE
  v_weight INT := 1;
  v_room_id UUID;
  v_has_weighted BOOLEAN := false;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get room_id
    v_room_id := NEW.room_id;

    -- Check if room has weighted voting feature enabled
    -- We can check the boolean flag on voting_rooms directly as it's faster than has_coin_feature function
    SELECT weighted_voting_enabled INTO v_has_weighted
    FROM voting_rooms
    WHERE id = v_room_id;

    IF v_has_weighted THEN
        -- Get weight from eligibility
        -- We try to find the eligibility record for this vote
        -- NOTE: room_votes has eligibility_id. If populated, use it.
        IF NEW.eligibility_id IS NOT NULL THEN
            SELECT vote_weight INTO v_weight
            FROM voter_eligibility
            WHERE id = NEW.eligibility_id;
        END IF;
    END IF;

    -- Update count
    UPDATE room_options 
    SET votes_count = votes_count + COALESCE(v_weight, 1)
    WHERE id = NEW.option_id;

  ELSIF TG_OP = 'DELETE' THEN
    -- Handle delete (revert weight)
    v_room_id := OLD.room_id;
    
    SELECT weighted_voting_enabled INTO v_has_weighted
    FROM voting_rooms
    WHERE id = v_room_id;

    IF v_has_weighted AND OLD.eligibility_id IS NOT NULL THEN
         SELECT vote_weight INTO v_weight
         FROM voter_eligibility
         WHERE id = OLD.eligibility_id;
    END IF;

    UPDATE room_options 
    SET votes_count = votes_count - COALESCE(v_weight, 1)
    WHERE id = OLD.option_id;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Re-create the trigger to be sure
DROP TRIGGER IF EXISTS trigger_update_room_option_votes ON room_votes;
CREATE TRIGGER trigger_update_room_option_votes
AFTER INSERT OR DELETE ON room_votes
FOR EACH ROW EXECUTE FUNCTION update_room_option_votes();
