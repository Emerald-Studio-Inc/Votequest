-- Create uploads directory for storing government ID files
-- Run this SQL to set up file storage policies

-- Note: In production, you should use cloud storage (S3, Cloudflare R2, etc.)
-- For now, files will be stored in: /uploads/

-- To enable this locally, create the directory:
-- mkdir uploads

-- Security: Ensure the uploads directory is:
--   1. NOT publicly accessible via web server
--   2. Only accessible to admins
--   3. Files are deleted after 30 days (GDPR compliance)

-- Example cleanup job (run weekly):
SELECT 
  id, 
  email,
  gov_id_url,
  photo_url,
  verified_at
FROM voter_eligibility
WHERE verified_at < NOW() - INTERVAL '30 days'
  AND (gov_id_url IS NOT NULL OR photo_url IS NOT NULL);

-- Delete old files and clear URLs
-- UPDATE voter_eligibility
-- SET gov_id_url = NULL, photo_url = NULL
-- WHERE verified_at < NOW() - INTERVAL '30 days';
