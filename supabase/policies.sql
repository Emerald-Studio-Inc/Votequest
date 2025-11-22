-- Enable Row Level Security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for 'users' table
-- Allow anyone to read user profiles (needed for leaderboard, checking existence)
CREATE POLICY "Allow public read access to users"
ON users FOR SELECT
TO anon, authenticated
USING (true);

-- Deny all client-side writes (inserts, updates, deletes)
-- Writes must be done via the Service Role (API routes)
-- No policies needed for INSERT/UPDATE/DELETE implies DENY by default when RLS is enabled

-- Policies for 'proposals' table
CREATE POLICY "Allow public read access to proposals"
ON proposals FOR SELECT
TO anon, authenticated
USING (true);

-- Policies for 'proposal_options' table
CREATE POLICY "Allow public read access to proposal_options"
ON proposal_options FOR SELECT
TO anon, authenticated
USING (true);

-- Policies for 'votes' table
CREATE POLICY "Allow public read access to votes"
ON votes FOR SELECT
TO anon, authenticated
USING (true);

-- Policies for 'achievements' table
CREATE POLICY "Allow public read access to achievements"
ON achievements FOR SELECT
TO anon, authenticated
USING (true);

-- Policies for 'user_achievements' table
CREATE POLICY "Allow public read access to user_achievements"
ON user_achievements FOR SELECT
TO anon, authenticated
USING (true);
