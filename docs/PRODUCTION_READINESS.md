VoteQuest — Production Readiness & Battle-Testing QA Plan

Objective
Ensure VoteQuest delivers a smooth, premium, uninterrupted user experience through comprehensive testing and validation.

1. Authentication & User Management
1.1 Magic Link Authentication

Critical Path Testing

First-Time User Flow
- Enter email on login screen
- Receive magic link email (check spam folder)
- Click link → Auto-creates profile in database
- Redirects to dashboard with default stats (Level 1, 0 XP, 100 Voting Power)
- Verify no errors in console

Returning User Flow
- Existing user clicks magic link
- Loads existing profile from database
- Shows correct stats (level, XP, coins, votes)
- Session persists across page refreshes

Error Scenarios
- Invalid/expired magic link → Clear error message
- Email already in use → Handles gracefully
- Network timeout → Retry mechanism works

Acceptance Criteria
- 100% success rate for valid magic links
- Profile auto-creation works for all new users
- No duplicate profiles created
- Session persists for 7 days minimum

2. Voting System
2.1 Core Voting Flow

Happy Path Testing

Vote on Active Proposal
- Open an active proposal (not ended)
- Select a voting option
- Captcha appears (blue box with "Security Verification Required")
- Complete captcha → Box disappears
- "Cast Your Vote" button becomes enabled
- Click vote → Success message
- Stats update: +10 VQC, +250 XP, +1 vote count

Vote Persistence
- After voting, refresh page
- Proposal shows "You voted for: [Option]"
- Cannot vote again on same proposal
- Vote count on option increased by 1

Edge Cases
- Already Voted: Try to vote twice → "Already voted" error
- Proposal Ended: Ended proposals don't appear as active; cannot vote
- Network Issues: Clear error on failure; retries don't duplicate votes; optimistic UI rolls back

Captcha Testing
- Captcha loads correctly (Cloudflare Turnstile)
- Captcha verifies successfully
- Cannot bypass captcha (button disabled until verified)
- Server-side validation rejects invalid tokens
- Cloudflare dashboard shows verification requests

Acceptance Criteria
- Vote success rate: >99%
- Zero duplicate votes per user per proposal
- Captcha verification rate: 100% for valid attempts
- Stats update within 2 seconds
- No phantom votes (DB matches UI)

3. Coin & Rewards System
3.1 Coin Earning

Validation Testing

Vote Rewards
- Vote on proposal → Earn 10 VQC
- Check `coin_transactions` table for record with: user_id, amount (+10), type (vote_cast), proposal_id

Referral Rewards
- Share proposal with unique link
- Friend clicks link and votes
- Original user earns 5 VQC
- Check `referrals` table for conversion

Create Proposal Rewards
- Create new proposal → Earn 50 VQC
- Verify transaction recorded

Edge Cases
- Database-only votes earn coins
- Blockchain votes also earn coins
- Duplicate vote attempts don't award duplicate coins
- Failed votes don't award coins

Acceptance Criteria
- 100% accuracy: coins awarded = actions completed
- Transaction log complete and auditable
- Coin balance never negative
- Race conditions handled (no double-awards)

4. Share & Referral System
4.1 Share Link Generation

Core Flow

Generate Share Link
- While logged in, open active proposal
- Click share button → Modal opens
- Generates unique referral code (8 characters)
- Shows shareable URL: `votequest.netlify.app/proposal/{id}?ref={code}`
- QR code tab displays scannable QR

Share Link Usage
- Copy share link
- Open in incognito/new browser
- Click link → Redirects to homepage
- After login, auto-opens target proposal
- `localStorage` stores `targetProposalId`
- UUID vs Blockchain ID: demo proposal (UUID-only) shareable; blockchain proposals shareable; both resolve

Daily Limits
- Daily share limit: 10 + (level × 5)
- Hitting limit shows clear error message
- Limit resets at midnight UTC

Acceptance Criteria
- Share links work 100% of time
- Auto-navigation to target proposal works
- QR codes scan correctly on mobile
- Referral tracking accurate (5 VQC on conversion)

5. Proposal Management
5.1 Active Proposals Display

Filtering Logic
- Only shows proposals with status='active'
- Only shows proposals with end_date > NOW()
- Ended proposals don't appear in active list
- Proposals sorted by created_at DESC

Proposal Details
- All proposal fields display correctly
- Vote percentages calculate accurately
- Participant count shows correctly
- Time remaining updates in real-time

Acceptance Criteria
- Zero ended proposals in "Active" section
- All active, non-ended proposals visible
- Vote percentages sum to 100% (or close with rounding)

6. UI/UX & Performance
6.1 User Experience

Smooth Interactions
- No Auto-Reload Interruptions
  - Page doesn't auto-refresh mid-task
  - Users complete actions without disruption
  - Manual refresh when needed (F5)

Loading States
- Captcha shows loading spinner while verifying
- Vote button shows loading state during submission
- Proposals show skeleton loaders while fetching

Error Handling
- All errors have clear, actionable messages
- Network errors suggest retry
- Validation errors explain what's wrong

Performance Benchmarks
- Initial page load: <3 seconds
- Dashboard data fetch: <1 second
- Vote submission: <2 seconds
- Share link generation: <1 second

Acceptance Criteria
- Zero unexpected page refreshes
- All interactions feel instant (<200ms perceived)
- Error messages are user-friendly, not technical

7. Data Integrity & Security
7.1 Database Validation

Data Consistency
- User Stats Accuracy:
  - Count votes in `votes` table = user's `votes_count`
  - Sum of coin transactions = user's `coins` balance
  - XP matches level formula: `level = floor(sqrt(xp/100))`
- Proposal Vote Counts: sum of option votes = total participants
- No phantom votes in DB
- Referral Tracking: unique codes, conversions accurate

Security Testing
- SQL Injection Protection: sanitized inputs & prepared statements
- Captcha Bypass Attempts: server validates Cloudflare tokens
- Rate Limiting: 20 votes/min per IP, 429 on excess

Acceptance Criteria
- 100% data integrity (no orphaned records)
- Zero successful SQL injection attempts
- Captcha bypass rate: 0%
- Rate limiting effective

8. Multi-User & Concurrency
8.1 Concurrent Actions

Race Condition Testing
- Multiple users vote simultaneously (10+ concurrent)
- All votes recorded (no lost votes)
- No duplicate vote per user
- Referral conversions handled correctly

Acceptance Criteria
- Zero lost votes under load
- No race conditions in coin awards
- DB constraints prevent duplicates

9. Mobile & Cross-Browser
9.1 Device Compatibility

Mobile Testing (iOS & Android)
- Login flow works on mobile
- Voting UI responsive and usable
- Captcha displays and works on mobile
- Share functionality includes native share
- QR codes generate and display correctly

Browser Testing
- Chrome, Firefox, Safari, Edge (desktop & mobile)

Acceptance Criteria
- 100% feature parity across browsers
- UI adapts to all screen sizes (320px - 4K)
- Touch interactions work on mobile

10. Edge Cases & Recovery
10.1 Failure Scenarios

Graceful Degradation
- Database Down: shows maintenance message; no crash; retry attempts
- Supabase Auth Down: cannot login but shows clear message; existing sessions still work
- Cloudflare Turnstile Down: voting fails with clear explanation; other features continue

Data Recovery
- If vote fails mid-transaction, no partial state
- If coin award fails, vote still recorded
- Idempotent operations (safe to retry)

Acceptance Criteria
- App never shows white screen of death
- All errors recoverable or explained
- No data corruption on failure

11. Production Environment
11.1 Environment Variables

Netlify Configuration
Verify all env vars set:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_APP_URL (https://votequest.netlify.app)
- NEXT_PUBLIC_TURNSTILE_SITE_KEY
- TURNSTILE_SECRET_KEY (server-side only)

Supabase Configuration
- Redirect URLs include:
  - https://votequest.netlify.app/auth/callback
  - http://localhost:3000/auth/callback
- Site URL: https://votequest.netlify.app
- RLS policies allow authenticated users

Cloudflare Turnstile
- Domain whitelist includes: votequest.netlify.app
- Widget mode: Managed or Non-Interactive
- Analytics show verification requests

Acceptance Criteria
- All env vars present and correct
- Magic links redirect to correct URL
- Captcha works on production domain

12. Monitoring & Analytics
12.1 Success Metrics

Track These KPIs
- User Engagement: DAU, average votes/user, proposal creation rate
- Technical Health: Vote success rate (>99%), avg response time <2s, error rate <1%
- Captcha success rate: 100%
- Coin Economy: total coins in circulation, awarded vs spent, referral conversion rate

Monitoring Tools
- Supabase dashboard for DB health
- Netlify analytics for deployments
- Cloudflare Turnstile analytics
- Browser console logging in production

Acceptance Criteria
- All metrics tracked and accessible
- Alerts set up for critical failures
- Weekly health review

13. User Acceptance Testing (UAT)
13.1 Beta Testing Checklist

Real User Scenarios
- New User Onboarding: 5 new users complete signup
- Active Voting: 10 users vote on same proposal, all receive coins and XP
- Share & Earn: user A shares, user B converts → user A earns 5 VQC
- Mobile Experience: 5 mobile users test features

Feedback Collection
- Survey users; identify pain points; fix critical issues

Acceptance Criteria
- 90%+ user satisfaction
- Zero blocking bugs

14. Final Pre-Launch Checklist
14.1 Go/No-Go Criteria

Must-Have (Blockers)
- Authentication: 100% success rate
- Voting: >99% success rate
- Coins: 100% accuracy
- Share links: 100% functional
- No critical bugs
- All env vars configured

Nice-to-Have (Non-Blockers)
- Analytics dashboard live
- Help documentation
- FAQ page
- Social media preview cards

Launch Decision
- All must-have items complete
- <5 minor bugs
- Performance benchmarks met
- Security audit passed

15. Post-Launch Monitoring (First 7 Days)
15.1 Critical Observation Period

Daily Checks
- Login success rate
- Vote submission rate
- Error logs review
- User feedback
- Coin transaction integrity

Weekly Review
- Retention (Day1, Day3, Day7)
- Feature usage analytics
- Bug triage

Acceptance Criteria
- >95% uptime
- <1% error rate
- Positive user feedback

Testing Priorities
- High (P0): Authentication & Profile Creation, Voting & Captcha, Coin Rewards, Share Link Generation
- Medium (P1): Proposal Filtering, Referral Tracking, Mobile Responsiveness, Error Handling
- Low (P2): UI polish, Analytics, Help docs, Social sharing

Test Environment Setup
Required Access
- Supabase project
- Netlify deployment
- Cloudflare Turnstile dashboard
- Test email accounts
- Mobile devices (iOS + Android)

Test Data
- 10+ test users
- 5+ active proposals
- 3+ ended proposals
- Sample referral links
- Test coin transactions

Success Definition
- Reliability: 99%+ uptime, <1% error rate
- Performance: load <3s, interactions <2s
- Security: 0 successful attacks, 100% captcha enforcement
- UX: Smooth experience, no interruptions
- Data Integrity: 100% accuracy
- User Satisfaction: 90%+ positive feedback


Appendix: Quick P0 Test Checklist (copy into issues)
- [ ] Magic link sign-up (new user) — profile created, redirect to dashboard
- [ ] Magic link sign-in (existing user) — loads existing profile
- [ ] Vote on active proposal — captcha required, vote recorded, coins awarded
- [ ] Try duplicate vote — blocked
- [ ] Create proposal — coins awarded to creator
- [ ] Share link generation & conversion — referral rewarded
- [ ] DB integrity verification: votes_count, coin balances, transactions


---
File created: `docs/PRODUCTION_READINESS.md`
