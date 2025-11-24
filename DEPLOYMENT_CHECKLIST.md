# Production Deployment Checklist

## ✅ Code Quality (COMPLETED)
- [x] Removed debug console.logs from VoteQuestApp.tsx
- [x] Fixed contract address (0x77405d9D0a34D6eb59bC57dd5F434F8902CC5a5d)
- [x] Implemented self-healing architecture for proposals
- [x] Added tx_hash and onchain_id tracking

## Database Setup

### Required Migrations (Run in order):
1. [x] `supabase_setup.sql` - Core tables
2. [ ] `supabase_streak_migration.sql` - Streak tracking
3. [ ] `supabase_category_migration.sql` - Proposal categories  
4. [ ] `supabase_coins_migration.sql` - Coin system
5. [x] `supabase_onchain_id_migration.sql` - Blockchain linking
6. [x] `supabase_tx_hash_migration.sql` - Self-healing

### Clean Production Data:
- [ ] Run `supabase_cleanup.sql` to remove all seed/test data
- [ ] Verify all counts are 0 (proposals, votes, users)

## Environment Configuration

### Required Variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role (server-side only)
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` - WalletConnect project ID

### Verify:
- [ ] All env vars are set in `.env.local`
- [ ] No sensitive keys are committed to git
- [ ] Netlify/hosting platform has env vars configured

## Smart Contract

### Verified:
- [x] Contract Address: `0x77405d9D0a34D6eb59bC57dd5F434F8902CC5a5d`
- [x] Network: Polygon Amoy Testnet
- [ ] Contract verified on PolygonScan (optional but recommended)

## Final Testing

### Core Functionality:
- [ ] Connect wallet successfully
- [ ] Create proposal (check tx on PolygonScan)
- [ ] Proposal appears immediately in list
- [ ] Vote on proposal (check tx on PolygonScan)
- [ ] Coin rewards awarded (create: 50 VQC, vote: 10 VQC)
- [ ] Notifications work
- [ ] Self-healing recovers IDs if needed

### Production Build:
- [ ] Run `npm run build` successfully
- [ ] No build errors or warnings
- [ ] Test production build locally: `npm start`

## Deployment

- [ ] Deploy to Netlify/Vercel
- [ ] Verify env variables on hosting platform
- [ ] Test live site with real wallet
- [ ] Monitor for errors in production logs
