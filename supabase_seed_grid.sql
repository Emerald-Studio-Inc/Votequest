-- SEED GRID WITH TACTICAL DATA
-- Includes Organizations, Debates, and Signal Samples

-- 1. Ensure Organizations exist
INSERT INTO organizations (name, slug, description, type, verified)
VALUES 
    ('The Core Collective', 'core-collective', 'Infrastructure and liquidity management.', 'governance', true),
    ('Shadow Sector', 'shadow-sector', 'Privacy and encryption research.', 'security', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Debates
DO $$
DECLARE
    org_id UUID;
BEGIN
    SELECT id INTO org_id FROM organizations WHERE slug = 'core-collective';
    
    INSERT INTO debates (organization_id, title, description, status, verification_tier, pro_count, con_count)
    VALUES 
        (org_id, 'Protocol Upgrade v5.1', 'Migration to a fragmented shard state for higher throughput.', 'live', 'exam', 42, 12),
        (org_id, 'Liquidity Threshold Adjustments', 'Adjusting the automated cooling period for high-volume nodes.', 'live', 'tier1', 15, 8);

    SELECT id INTO org_id FROM organizations WHERE slug = 'shadow-sector';
    
    INSERT INTO debates (organization_id, title, description, status, verification_tier, pro_count, con_count)
    VALUES 
        (org_id, 'Encryption Standard Zeta', 'Implementation of post-quantum resistant signatures in all sector cells.', 'live', 'exam', 89, 5);
END $$;

-- 3. Insert Signals (Comments) for the first debate
DO $$
DECLARE
    debate_id UUID;
BEGIN
    SELECT id INTO debate_id FROM debates WHERE title = 'Protocol Upgrade v5.1';
    
    INSERT INTO comments (debate_id, content, side, upvotes)
    VALUES 
        (debate_id, 'Current shard logic is insufficient for peak load. We need 3x redundancy.', 'con', 25),
        (debate_id, 'The proposed liquidity bridge is the most stable path forward.', 'pro', 130),
        (debate_id, 'Transitioning now minimizes long-term synchronization drift.', 'pro', 45);
END $$;
