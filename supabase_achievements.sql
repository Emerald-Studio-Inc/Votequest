-- Drop existing tables to ensure clean schema
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;

-- Create achievements table
CREATE TABLE achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, achievement_id)
);

-- Insert default achievements
INSERT INTO achievements (code, name, description, icon, xp_reward) VALUES
('first_vote', 'First Voice', 'Cast your first vote on any proposal', 'Vote', 100),
('week_streak', 'Consistent Voter', 'Maintain a 7-day voting streak', 'Flame', 500),
('level_5', 'Rising Star', 'Reach Level 5 reputation', 'Star', 1000),
('proposal_creator', 'Initiator', 'Create your first proposal', 'PenTool', 300)
ON CONFLICT (code) DO NOTHING;
