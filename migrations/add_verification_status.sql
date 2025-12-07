-- Add verification status tracking columns to voter_eligibility table
-- Run this in Supabase SQL Editor

ALTER TABLE voter_eligibility
ADD COLUMN IF NOT EXISTS verification_status text DEFAULT 'pending' CHECK (verification_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS gov_id_url text,
ADD COLUMN IF NOT EXISTS photo_url text,
ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS verified_at timestamp with time zone;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_voter_eligibility_verification_status 
ON voter_eligibility(verification_status);

-- Add comment
COMMENT ON COLUMN voter_eligibility.verification_status IS 'Tier 3 verification status: pending, approved, or rejected';
COMMENT ON COLUMN voter_eligibility.gov_id_url IS 'Path to uploaded government ID image';
COMMENT ON COLUMN voter_eligibility.photo_url IS 'Path to uploaded selfie photo';
COMMENT ON COLUMN voter_eligibility.verified_by IS 'Admin who approved/rejected verification';
COMMENT ON COLUMN voter_eligibility.verified_at IS 'Timestamp of verification approval/rejection';
