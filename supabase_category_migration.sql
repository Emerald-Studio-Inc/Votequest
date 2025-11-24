-- Add category column to proposals table
ALTER TABLE proposals 
ADD COLUMN category TEXT DEFAULT 'Community';

-- Update existing proposals to have a category if they are null (redundant with DEFAULT but good for safety)
UPDATE proposals 
SET category = 'Community' 
WHERE category IS NULL;

-- Optional: Add a check constraint to ensure only valid categories are used
ALTER TABLE proposals 
ADD CONSTRAINT valid_category CHECK (category IN ('Governance', 'Treasury', 'Protocol', 'Community'));
