-- Fix voter_eligibility table - add missing created_at column

ALTER TABLE voter_eligibility 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Also add updated_at for consistency
ALTER TABLE voter_eligibility 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_voter_eligibility_updated_at ON voter_eligibility;
CREATE TRIGGER update_voter_eligibility_updated_at
    BEFORE UPDATE ON voter_eligibility
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
