-- Add last_vote_date column to users table for streak tracking
ALTER TABLE users 
ADD COLUMN last_vote_date TIMESTAMP WITH TIME ZONE;
