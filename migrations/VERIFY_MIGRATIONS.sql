-- Quick verification query to check if migrations were run
-- Run this in Supabase SQL Editor
-- Should return ONE row with 5 columns, all should be TRUE

SELECT 
    -- 1. Check if coin_transactions table exists
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'coin_transactions'
    ) as coin_transactions_exists,
    
    -- 2. Check if notifications table exists
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
    ) as notifications_exists,
    
    -- 3. Check if deduct_coins function exists
    EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_name = 'deduct_coins'
    ) as deduct_coins_exists,
    
    -- 4. Check if power_boost column exists in votes table
    EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'votes' 
        AND column_name = 'power_boost'
    ) as power_boost_exists,
    
    -- 5. Check if featured column exists in proposals table
    EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'proposals' 
        AND column_name = 'featured'
    ) as featured_exists;

