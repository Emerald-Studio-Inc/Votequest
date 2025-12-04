-- Admin Access Audit Log
-- Tracks all admin panel access attempts for security monitoring

CREATE TABLE IF NOT EXISTS admin_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  access_granted BOOLEAN DEFAULT FALSE,
  passphrase_attempts INTEGER DEFAULT 1,
  session_duration INTEGER, -- in seconds, filled when session ends
  actions_performed JSONB, -- track what they did in admin panel
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for fast queries
CREATE INDEX IF NOT EXISTS idx_admin_log_time ON admin_access_log(accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_log_ip ON admin_access_log(ip_address);

-- RLS: Only allow server-side inserts (no user access)
ALTER TABLE admin_access_log ENABLE ROW LEVEL SECURITY;

-- No SELECT policy = only service role can read logs
-- This prevents admin panel from seeing its own logs (for now)

COMMENT ON TABLE admin_access_log IS 'Security audit log for admin backdoor access';
