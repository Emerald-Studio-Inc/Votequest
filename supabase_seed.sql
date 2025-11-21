-- ==================================================
-- VoteQuest Sample Data Seed Script
-- ==================================================
-- Run this script in your Supabase SQL Editor to populate
-- the database with sample proposals and achievements.
-- ==================================================

-- -------------------------------------------------
-- 1. Insert Achievements
-- -------------------------------------------------
INSERT INTO achievements (code, name, description, icon, xp_reward)
VALUES
  ('first_vote', 'First Vote', 'Cast your first vote', '🏆', 100),
  ('week_streak', 'Week Streak', 'Vote 7 days in a row', '🔥', 200),
  ('level_5', 'Level 5', 'Reach level 5', '⭐', 300),
  ('proposal_creator', 'Proposal Creator', 'Create a proposal', '📝', 250)
ON CONFLICT (code) DO NOTHING;

-- -------------------------------------------------
-- 2. Insert Sample Proposals (active for 7 days)
-- -------------------------------------------------
INSERT INTO proposals (title, description, end_date, created_by, status, participants)
VALUES
  (
    'Upgrade UI',
    'Add a new dark-mode toggle to the app interface',
    (NOW() + INTERVAL '7 days')::timestamp,
    NULL,
    'active',
    0
  ),
  (
    'New Governance Token',
    'Introduce a governance token for weighted voting',
    (NOW() + INTERVAL '5 days')::timestamp,
    NULL,
    'active',
    0
  ),
  (
    'Community Treasury',
    'Establish a community treasury for funding proposals',
    (NOW() + INTERVAL '10 days')::timestamp,
    NULL,
    'active',
    0
  );

-- -------------------------------------------------
-- 3. Insert Options for Proposal #1 (Upgrade UI)
-- -------------------------------------------------
INSERT INTO proposal_options (proposal_id, option_number, title, description, votes)
SELECT
  p.id,
  1,
  'Add Toggle',
  'Simple dark-mode switch in settings',
  0
FROM proposals p
WHERE p.title = 'Upgrade UI';

INSERT INTO proposal_options (proposal_id, option_number, title, description, votes)
SELECT
  p.id,
  2,
  'Full Redesign',
  'Complete UI overhaul with modern aesthetics',
  0
FROM proposals p
WHERE p.title = 'Upgrade UI';

-- -------------------------------------------------
-- 4. Insert Options for Proposal #2 (New Governance Token)
-- -------------------------------------------------
INSERT INTO proposal_options (proposal_id, option_number, title, description, votes)
SELECT
  p.id,
  1,
  'ERC-20 Token',
  'Standard fungible governance token',
  0
FROM proposals p
WHERE p.title = 'New Governance Token';

INSERT INTO proposal_options (proposal_id, option_number, title, description, votes)
SELECT
  p.id,
  2,
  'ERC-721 NFT',
  'Governance via NFT ownership',
  0
FROM proposals p
WHERE p.title = 'New Governance Token';

-- -------------------------------------------------
-- 5. Insert Options for Proposal #3 (Community Treasury)
-- -------------------------------------------------
INSERT INTO proposal_options (proposal_id, option_number, title, description, votes)
SELECT
  p.id,
  1,
  '5% of Fees',
  'Allocate 5% of protocol fees to treasury',
  0
FROM proposals p
WHERE p.title = 'Community Treasury';

INSERT INTO proposal_options (proposal_id, option_number, title, description, votes)
SELECT
  p.id,
  2,
  '10% of Fees',
  'Allocate 10% of protocol fees to treasury',
  0
FROM proposals p
WHERE p.title = 'Community Treasury';

INSERT INTO proposal_options (proposal_id, option_number, title, description, votes)
SELECT
  p.id,
  3,
  'Token Allocation',
  'Pre-mint governance tokens for treasury',
  0
FROM proposals p
WHERE p.title = 'Community Treasury';

-- ==================================================
-- Verification Query (optional)
-- ==================================================
-- Uncomment the lines below to verify the data was inserted

-- SELECT COUNT(*) as achievement_count FROM achievements;
-- SELECT COUNT(*) as proposal_count FROM proposals WHERE status = 'active';
-- SELECT COUNT(*) as option_count FROM proposal_options;
