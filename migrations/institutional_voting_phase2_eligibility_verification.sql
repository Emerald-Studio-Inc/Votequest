-- VoteQuest Institutional Voting System - Database Schema
-- Phase 2: Voter Eligibility and ID Verification
-- Run this migration AFTER Phase 1

-- ==========================================
-- 5. VOTER ELIGIBILITY TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS voter_eligibility (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES voting_rooms(id) ON DELETE CASCADE,
  
  -- Identifier (what makes them eligible)
  identifier TEXT NOT NULL, -- email, student ID, employee ID
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'student_id', 'employee_id', 'phone', 'custom')),
  
  -- User Link (populated after registration)
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Verification Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'invited', 'verified', 'rejected', 'revoked')),
  
  -- Additional Data
  metadata JSONB DEFAULT '{}', -- name, department, class year, etc.
  
  -- Timestamps
  invited_at TIMESTAMP DEFAULT NOW(),
  verified_at TIMESTAMP,
  revoked_at TIMESTAMP,
  
  CONSTRAINT unique_room_identifier UNIQUE(room_id, identifier)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_eligibility_room ON voter_eligibility(room_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_user ON voter_eligibility(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_eligibility_identifier ON voter_eligibility(identifier);
CREATE INDEX IF NOT EXISTS idx_eligibility_status ON voter_eligibility(status);

-- Enable RLS
ALTER TABLE voter_eligibility ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Org admins can manage eligibility" ON voter_eligibility;
CREATE POLICY "Org admins can manage eligibility"
  ON voter_eligibility FOR ALL
  USING (
    room_id IN (
      SELECT vr.id FROM voting_rooms vr
      JOIN organization_admins oa ON vr.organization_id = oa.organization_id
      WHERE oa.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view their own eligibility" ON voter_eligibility;
CREATE POLICY "Users can view their own eligibility"
  ON voter_eligibility FOR SELECT
  USING (user_id = auth.uid());

COMMENT ON TABLE voter_eligibility IS 'Pre-approved list of voters for each room';
COMMENT ON COLUMN voter_eligibility.identifier IS 'Email, student ID, or other unique identifier';
COMMENT ON COLUMN voter_eligibility.user_id IS 'Linked after user registers/verifies';

-- ==========================================
-- 6. ID VERIFICATIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS id_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Verification Type
  verification_type TEXT NOT NULL CHECK (verification_type IN ('student_id', 'employee_id', 'government_id', 'phone', 'domain')),
  
  -- Data
  id_number TEXT, -- for student/employee IDs
  id_document_front_url TEXT, -- for uploaded gov IDs
  id_document_back_url TEXT,
  additional_data JSONB DEFAULT '{}', -- name, DOB, expiry, OCR results
  
  -- Review Status
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  
  -- Expiration (for IDs that expire)
  expires_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Security
  ip_address INET,
  user_agent TEXT,
  
  CONSTRAINT unique_user_verification_type UNIQUE(user_id, verification_type)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_verifications_user ON id_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON id_verifications(verification_status);
CREATE INDEX IF NOT EXISTS idx_verifications_type ON id_verifications(verification_type);
CREATE INDEX IF NOT EXISTS idx_verifications_pending ON id_verifications(created_at) WHERE verification_status = 'pending';

-- Enable RLS
ALTER TABLE id_verifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view their own verifications" ON id_verifications;
CREATE POLICY "Users can view their own verifications"
  ON id_verifications FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can submit verifications" ON id_verifications;
CREATE POLICY "Users can submit verifications"
  ON id_verifications FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can review verifications" ON id_verifications;
CREATE POLICY "Admins can review verifications"
  ON id_verifications FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM organization_admins WHERE role IN ('owner', 'admin')
    )
  );

COMMENT ON TABLE id_verifications IS 'User identity verifications for tier 2/3 voting';
COMMENT ON COLUMN id_verifications.verification_type IS 'Type of ID: student, employee, or government';
COMMENT ON COLUMN id_verifications.id_document_front_url IS 'Stored in secure bucket with encryption';

-- ==========================================
-- 7. ROOM VOTES TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS room_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES voting_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES room_options(id) ON DELETE CASCADE,
  
  -- Verification Link
  verification_id UUID REFERENCES id_verifications(id), -- which verification was used
  eligibility_id UUID REFERENCES voter_eligibility(id), -- which eligibility entry matched
  
  -- Fraud Detection
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  vote_time_seconds INT, -- how long they took to vote
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}', -- additional context
  
  CONSTRAINT unique_room_user_vote UNIQUE(room_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_room_votes_room ON room_votes(room_id);
CREATE INDEX IF NOT EXISTS idx_room_votes_user ON room_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_room_votes_option ON room_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_room_votes_ip ON room_votes(ip_address);
CREATE INDEX IF NOT EXISTS idx_room_votes_time ON room_votes(created_at);

-- Enable RLS
ALTER TABLE room_votes ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Voters can insert their own votes" ON room_votes;
CREATE POLICY "Voters can insert their own votes"
  ON room_votes FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Org admins can view room votes" ON room_votes;
CREATE POLICY "Org admins can view room votes"
  ON room_votes FOR SELECT
  USING (
    room_id IN (
      SELECT vr.id FROM voting_rooms vr
      JOIN organization_admins oa ON vr.organization_id = oa.organization_id
      WHERE oa.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view their own votes" ON room_votes;
CREATE POLICY "Users can view their own votes"
  ON room_votes FOR SELECT
  USING (user_id = auth.uid());

COMMENT ON TABLE room_votes IS 'Votes cast in private institutional rooms';
COMMENT ON COLUMN room_votes.device_fingerprint IS 'Used for duplicate detection';

-- ==========================================
-- 8. VOTE COUNT TRIGGER
-- ==========================================

-- Function to update room option vote count
CREATE OR REPLACE FUNCTION update_room_option_votes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE room_options 
    SET votes_count = votes_count + 1 
    WHERE id = NEW.option_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE room_options 
    SET votes_count = votes_count - 1 
    WHERE id = OLD.option_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS trigger_update_room_option_votes ON room_votes;
CREATE TRIGGER trigger_update_room_option_votes
AFTER INSERT OR DELETE ON room_votes
FOR EACH ROW EXECUTE FUNCTION update_room_option_votes();

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Phase 2 Migration Complete: Eligibility & Verification Tables Created';
  RAISE NOTICE '   - voter_eligibility';
  RAISE NOTICE '   - id_verifications';
  RAISE NOTICE '   - room_votes';
  RAISE NOTICE '   - Vote counting triggers';
END $$;
