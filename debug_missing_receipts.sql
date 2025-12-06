-- Investigation: Check for missing receipts
-- Run this in Supabase SQL Editor to diagnose the issue

-- 1. Check total coin transactions vs receipts
SELECT 
    COUNT(*) as total_transactions,
    COUNT(receipt_hash) as transactions_with_receipts,
    COUNT(*) - COUNT(receipt_hash) as missing_receipts
FROM coin_transactions;

-- 2. See which users have coin transactions without receipts
SELECT 
    u.email,
    u.coins,
    COUNT(ct.id) as total_transactions,
    COUNT(ct.receipt_hash) as with_receipts,
    COUNT(ct.id) - COUNT(ct.receipt_hash) as missing
FROM users u
LEFT JOIN coin_transactions ct ON u.id = ct.user_id
GROUP BY u.id, u.email, u.coins
HAVING COUNT(ct.id) > 0
ORDER BY missing DESC;

-- 3. Look at sample transactions without receipts
SELECT 
    ct.id,
    ct.amount,
    ct.reason,
    ct.receipt_hash,
    ct.created_at,
    u.email
FROM coin_transactions ct
JOIN users u ON ct.user_id = u.id
WHERE ct.receipt_hash IS NULL
ORDER BY ct.created_at DESC
LIMIT 20;

-- 4. Check if receipt_hash column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'coin_transactions' 
  AND column_name IN ('receipt_hash', 'action_metadata', 'verified');

-- 5. Sample of transactions WITH receipts (for comparison)
SELECT 
    ct.id,
    ct.amount,
    ct.reason,
    LEFT(ct.receipt_hash, 16) as hash_preview,
    ct.created_at,
    u.email
FROM coin_transactions ct
JOIN users u ON ct.user_id = u.id
WHERE ct.receipt_hash IS NOT NULL
ORDER BY ct.created_at DESC
LIMIT 10;
