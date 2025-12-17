-- Community & Debates Migration

-- 1. Forum Threads (for Organizations)
CREATE TABLE IF NOT EXISTS forum_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT,
    category TEXT DEFAULT 'general', -- 'general', 'policy', 'announcement'
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Debates (High Stakes Discussions)
CREATE TABLE IF NOT EXISTS debates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    
    -- Debate Config
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'live', 'concluded'
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    
    -- Access Control (Entrance Exam Logic)
    verification_tier TEXT DEFAULT 'tier1', -- 'tier1' (Email), 'tier2' (ID), 'exam' (Custom Test)
    min_reputation INTEGER DEFAULT 0,
    
    -- Stats
    pro_count INTEGER DEFAULT 0,
    con_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Assessments (The Entrance Exam)
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    debate_id UUID REFERENCES debates(id) ON DELETE CASCADE,
    questions JSONB NOT NULL, -- Array of { id, question, options[], correct_option_index }
    pass_score_percent INTEGER DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Debate Participants (Who passed the test?)
CREATE TABLE IF NOT EXISTS debate_participants (
    debate_id UUID REFERENCES debates(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'participant', -- 'participant', 'moderator', 'spectator'
    side TEXT, -- 'pro', 'con', 'neutral'
    exam_score INTEGER,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (debate_id, user_id)
);

-- 5. Comments (Universal)
CREATE TABLE IF NOT EXISTS comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Targets (Polymorphic-ish)
    proposal_id UUID REFERENCES proposals(id) ON DELETE CASCADE,
    forum_thread_id UUID REFERENCES forum_threads(id) ON DELETE CASCADE,
    debate_id UUID REFERENCES debates(id) ON DELETE CASCADE,
    
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- Nesting
    
    content TEXT NOT NULL,
    
    -- Debate Specific
    side TEXT, -- 'pro', 'con' (Required if debate_id is present)
    
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_comments_proposal ON comments(proposal_id);
CREATE INDEX idx_comments_thread ON comments(forum_thread_id);
CREATE INDEX idx_comments_debate ON comments(debate_id);
CREATE INDEX idx_debates_org ON debates(organization_id);
