-- Debate Rules Engine

ALTER TABLE debates 
ADD COLUMN IF NOT EXISTS rules JSONB DEFAULT '[]'::jsonb;

-- Example rule structure in JSONB:
-- [
--   {"id": "no-slurs", "title": "Zero Tolerance", "description": "Abusive language results in immediate -50 VQC penalty.", "penalty": 50},
--   {"id": "stay-pro", "title": "Alignment Lock", "description": "Switching sides during a round is disabled.", "penalty": 0},
--   {"id": "source-req", "title": "Evidence Required", "description": "Links required for high-impact claims.", "penalty": 10}
-- ]
