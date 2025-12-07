-- VoteQuest Institutional Voting System - Database Schema
-- Phase 1: Core Tables for Organizations and Voting Rooms
-- Run this migration in Supabase SQL Editor
-- FIXED: All tables created first, then RLS policies added

-- ==========================================
-- 1. ORGANIZATIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('school', 'company', 'nonprofit', 'government', 'other')),
  domain TEXT, -- email domain for auto-verification (e.g., 'university.edu')
  logo_url TEXT,
  website TEXT,
  description TEXT,
  
  -- Subscription & Limits
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'school', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'suspended')),
  max_voters_per_room INT DEFAULT 100,
  max_rooms INT DEFAULT 5,
  
  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  settings JSONB DEFAULT '{}', -- custom branding, email templates, etc.
  
  CONSTRAINT unique_org_name UNIQUE (name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON organizations(created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_tier ON organizations(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON organizations(domain) WHERE domain IS NOT NULL;

COMMENT ON TABLE organizations IS 'Schools, companies, and organizations that create private voting rooms';
COMMENT ON COLUMN organizations.domain IS 'Email domain used for auto-verification of members (e.g., @school.edu)';
COMMENT ON COLUMN organizations.max_voters_per_room IS 'Maximum voters allowed per room based on subscription tier';

-- ==========================================
-- 2. ORGANIZATION ADMINS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS organization_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('owner', 'admin', 'moderator')),
  permissions JSONB DEFAULT '{}', -- granular permissions
  invited_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_org_user UNIQUE(organization_id, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_org_admins_org ON organization_admins(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_admins_user ON organization_admins(user_id);

COMMENT ON TABLE organization_admins IS 'Users who can manage an organization and create voting rooms';
COMMENT ON COLUMN organization_admins.role IS 'owner: full control, admin: create rooms, moderator: view only';

-- ==========================================
-- 3. VOTING ROOMS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS voting_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Basic Info
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  
  -- Verification & Access
  verification_tier TEXT NOT NULL DEFAULT 'tier1' CHECK (verification_tier IN ('tier1', 'tier2', 'tier3')),
  is_public BOOLEAN DEFAULT FALSE, -- if true, anyone can view results (but not vote)
  require_eligibility BOOLEAN DEFAULT TRUE, -- if false, anyone from org can vote
  
  -- Scheduling
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  
  -- Limits
  max_voters INT,
  allow_anonymous BOOLEAN DEFAULT FALSE, -- hide voter identities in results
  
  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  settings JSONB DEFAULT '{}', -- allow_observer, show_live_results, require_comment, etc.
  
  CONSTRAINT valid_schedule CHECK (end_time IS NULL OR start_time IS NULL OR end_time > start_time)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_org ON voting_rooms(organization_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON voting_rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON voting_rooms(created_by);
CREATE INDEX IF NOT EXISTS idx_rooms_schedule ON voting_rooms(start_time, end_time) WHERE status = 'active';

COMMENT ON TABLE voting_rooms IS 'Private voting/election rooms created by organizations';
COMMENT ON COLUMN voting_rooms.verification_tier IS 'tier1: email only, tier2: email+ID, tier3: email+gov ID';
COMMENT ON COLUMN voting_rooms.is_public IS 'Allow non-members to view (but not vote)';

-- ==========================================
-- 4. ROOM OPTIONS TABLE
-- ==========================================

CREATE TABLE IF NOT EXISTS room_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES voting_rooms(id) ON DELETE CASCADE,
  
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  option_number INT NOT NULL,
  
  -- Results
  votes_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT unique_room_option_number UNIQUE(room_id, option_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_room_options_room ON room_options(room_id);

COMMENT ON TABLE room_options IS 'Voting options/candidates for each room';

-- ==========================================
-- NOW ENABLE RLS & ADD POLICIES (AFTER ALL TABLES CREATED)
-- ==========================================

-- Organizations RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Organizations are viewable by members" ON organizations;
CREATE POLICY "Organizations are viewable by members"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_admins 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "System can insert organizations" ON organizations;
CREATE POLICY "System can insert organizations"
  ON organizations FOR INSERT
  WITH CHECK (true);

-- Organization Admins RLS
ALTER TABLE organization_admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view org members" ON organization_admins;
CREATE POLICY "Admins can view org members"
  ON organization_admins FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_admins 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners can manage admins" ON organization_admins;
CREATE POLICY "Owners can manage admins"
  ON organization_admins FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_admins 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Voting Rooms RLS
ALTER TABLE voting_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public rooms are viewable by all" ON voting_rooms;
CREATE POLICY "Public rooms are viewable by all"
  ON voting_rooms FOR SELECT
  USING (is_public = true OR organization_id IN (
    SELECT organization_id FROM organization_admins 
    WHERE user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Org admins can manage rooms" ON voting_rooms;
CREATE POLICY "Org admins can manage rooms"
  ON voting_rooms FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_admins 
      WHERE user_id = auth.uid()
    )
  );

-- Room Options RLS
ALTER TABLE room_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Room options visible with room" ON room_options;
CREATE POLICY "Room options visible with room"
  ON room_options FOR SELECT
  USING (
    room_id IN (SELECT id FROM voting_rooms)
  );

DROP POLICY IF EXISTS "Org admins can manage options" ON room_options;
CREATE POLICY "Org admins can manage options"
  ON room_options FOR ALL
  USING (
    room_id IN (
      SELECT vr.id FROM voting_rooms vr
      JOIN organization_admins oa ON vr.organization_id = oa.organization_id
      WHERE oa.user_id = auth.uid()
    )
  );

-- ==========================================
-- SUCCESS MESSAGE
-- ==========================================

DO $$
BEGIN
  RAISE NOTICE '✅ Phase 1 Migration Complete: Core Tables Created';
  RAISE NOTICE '   - organizations';
  RAISE NOTICE '   - organization_admins';
  RAISE NOTICE '   - voting_rooms';
  RAISE NOTICE '   - room_options';
  RAISE NOTICE '   - All RLS policies applied';
END $$;
