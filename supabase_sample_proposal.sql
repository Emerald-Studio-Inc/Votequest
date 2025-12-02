-- VoteQuest Sample Proposal
-- Run this in your Supabase SQL Editor to create a demo proposal for all users

-- First, create a demo admin user if you don't have one
-- (Replace with your actual admin user ID if you have one)

INSERT INTO proposals (
  title,
  description,
  category,
  end_date,
  status,
  created_by
)
VALUES (
  'Welcome to VoteQuest! 🎉',
  'This is a demo proposal to get you started. Vote on whether you''d like to see more features like dark mode toggles, profile customization, or advanced analytics. Your feedback helps shape VoteQuest!',
  'Community',
  NOW() + INTERVAL '30 days',
  'active',
  (SELECT id FROM users LIMIT 1)  -- Uses first user as creator
)
RETURNING id;

-- Add voting options to the proposal
-- Note: You'll need to replace <proposal_id> with the ID returned above

WITH new_proposal AS (
  SELECT id FROM proposals WHERE title = 'Welcome to VoteQuest! 🎉' ORDER BY created_at DESC LIMIT 1
)
INSERT INTO proposal_options (proposal_id, option_number, title, description, votes)
SELECT 
  new_proposal.id,
  ROW_NUMBER() OVER () - 1 as option_number,  -- 0-indexed
  option.title,
  option.description,
  0
FROM new_proposal
CROSS JOIN (
  VALUES 
    ('More Features ✨', 'Add dark mode toggle and customization options'),
    ('Better Analytics 📊', 'Enhanced charts and voting insights'),
    ('Mobile App 📱', 'Native iOS and Android applications'),
    ('Keep It Simple 🎯', 'Focus on core voting functionality')
) AS option(title, description);

-- Verify the proposal was created
SELECT 
  p.id,
  p.title,
  p.status,
  p.end_date,
  COUNT(po.id) as option_count
FROM proposals p
LEFT JOIN proposal_options po ON po.proposal_id = p.id
WHERE p.title = 'Welcome to VoteQuest! 🎉'
GROUP BY p.id, p.title, p.status, p.end_date;
