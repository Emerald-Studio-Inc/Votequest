-- VQC Economy Security: Receipt Verification System
-- This table backs every single VQC coin transaction with a verifiable receipt

CREATE TABLE IF NOT EXISTS coin_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('EARN', 'SPEND', 'TRANSFER', 'MINT', 'GIFT', 'REFUND')),
    reason TEXT NOT NULL,
    reference_id UUID, -- Optional: Links to vote_id, proposal_id, purchase_id, etc.
    balance_before INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    metadata JSONB DEFAULT '{}', -- Extra context (e.g., purchase details, gift message)
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_coin_receipts_user ON coin_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_receipts_type ON coin_receipts(type);
CREATE INDEX IF NOT EXISTS idx_coin_receipts_created ON coin_receipts(created_at DESC);

-- RLS: Users can only read their own receipts
ALTER TABLE coin_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own receipts"
ON coin_receipts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Service role can do everything (for API routes)
CREATE POLICY "Service role full access"
ON coin_receipts FOR ALL
TO service_role
USING (true);

-- Proposal Comments System
CREATE TABLE IF NOT EXISTS proposal_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES proposal_comments(id) ON DELETE CASCADE, -- For threading
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposal_comments_proposal ON proposal_comments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_parent ON proposal_comments(parent_id);

ALTER TABLE proposal_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
ON proposal_comments FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Authenticated users can create comments"
ON proposal_comments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Debate Media Sharing System
CREATE TABLE IF NOT EXISTS debate_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debate_id UUID REFERENCES debates(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    media_type TEXT NOT NULL CHECK (media_type IN ('IMAGE', 'LINK', 'TEXT_SNIPPET', 'FILE')),
    content TEXT NOT NULL, -- URL or text content
    title TEXT,
    is_broadcast BOOLEAN DEFAULT FALSE, -- True if shared to main console
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debate_media_debate ON debate_media(debate_id);
CREATE INDEX IF NOT EXISTS idx_debate_media_broadcast ON debate_media(debate_id, is_broadcast) WHERE is_broadcast = TRUE;

ALTER TABLE debate_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read broadcast media"
ON debate_media FOR SELECT
TO anon, authenticated
USING (is_broadcast = TRUE OR auth.uid() = sender_id);

CREATE POLICY "Authenticated users can create media"
ON debate_media FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);
