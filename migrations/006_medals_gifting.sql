-- VQC Medals Gifting System

-- Medal Store: Available medals that can be purchased
CREATE TABLE IF NOT EXISTS medal_store (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL, -- emoji or icon name
    price_vqc INTEGER NOT NULL, -- Cost in VQC
    tier TEXT NOT NULL DEFAULT 'bronze', -- bronze, silver, gold, platinum
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Medal Inventory
CREATE TABLE IF NOT EXISTS user_medals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    medal_id UUID REFERENCES medal_store(id) NOT NULL,
    quantity INTEGER DEFAULT 1,
    UNIQUE(user_id, medal_id)
);

-- Gifted Medals (sent to debate participants)
CREATE TABLE IF NOT EXISTS debate_gifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    debate_id UUID REFERENCES debates(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES users(id) NOT NULL,
    recipient_id UUID REFERENCES users(id) NOT NULL,
    medal_id UUID REFERENCES medal_store(id) NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gifts_debate ON debate_gifts(debate_id);
CREATE INDEX IF NOT EXISTS idx_gifts_recipient ON debate_gifts(recipient_id);

-- RLS Policies
ALTER TABLE medal_store ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_medals ENABLE ROW LEVEL SECURITY;
ALTER TABLE debate_gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view medals" ON medal_store FOR SELECT TO anon, authenticated USING (is_active = TRUE);
CREATE POLICY "Users can view own inventory" ON user_medals FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view gifts" ON debate_gifts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Authenticated can send gifts" ON debate_gifts FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Seed some default medals
INSERT INTO medal_store (name, description, icon, price_vqc, tier) VALUES
    ('Applause', 'Show appreciation for a great point', '👏', 10, 'bronze'),
    ('Insight', 'Recognize sharp analysis', '💡', 25, 'bronze'),
    ('Fire', 'For heated and passionate arguments', '🔥', 50, 'silver'),
    ('Brain', 'Acknowledge intellectual depth', '🧠', 100, 'silver'),
    ('Crown', 'For the debate champion', '👑', 250, 'gold'),
    ('Diamond', 'Ultimate recognition', '💎', 500, 'platinum')
ON CONFLICT DO NOTHING;
