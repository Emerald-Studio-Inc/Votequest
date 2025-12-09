# Stripe Integration Quick Reference & Testing Guide

## 🚀 Quick Start Checklist

- [ ] **Install packages**: `npm install stripe @stripe/stripe-js`
- [ ] **Add env vars** to `.env.local` (see STRIPE_SETUP_INSTRUCTIONS.md)
- [ ] **Run database migration** in Supabase (migrations/stripe_payment_system.sql)
- [ ] **Start dev server**: `npm run dev`
- [ ] **Test subscription** flow
- [ ] **Test coin purchase** flow
- [ ] **Test webhook** with Stripe CLI

---

## 📊 Feature Matrix

### ✅ Implemented Components

| Component | File | Status | Features |
|-----------|------|--------|----------|
| SubscriptionPicker | `components/SubscriptionPicker.tsx` | ✅ Complete | 3 tiers, Stripe checkout redirect |
| CoinsPurchaseModal | `components/CoinsPurchaseModal.tsx` | ✅ Complete | 4 packages, Stripe Elements, payment confirmation |
| SubscriptionStatus | `components/SubscriptionStatus.tsx` | ✅ Complete | Display tier/status, upgrade button, billing portal |
| TopHeader | `components/TopHeader.tsx` | ✅ Updated | Coin balance display, "Get Coins" button |
| OrganizationDashboard | `components/OrganizationDashboard.tsx` | ✅ Updated | Subscription status integration, upgrade flow |

### ✅ Implemented APIs

| Endpoint | Method | Status | Purpose |
|----------|--------|--------|---------|
| `/api/stripe/create-subscription` | POST | ✅ Exists | Create Stripe checkout session for org subscription |
| `/api/stripe/purchase-coins` | POST | ✅ Exists | Create payment intent for coin purchase |
| `/api/stripe/portal` | POST | ✅ Exists | Generate Stripe billing portal session |
| `/api/stripe/webhook` | POST | ✅ Exists | Handle Stripe webhook events |
| `/api/stripe/cancel-subscription` | POST | ✅ Exists | Cancel organization subscription |
| `/api/organizations/[id]/subscription` | GET | ✅ New | Fetch org subscription details |

### 🔄 Pending Integration Points

| Feature | Status | Notes |
|---------|--------|-------|
| Voter limit enforcement | ⏳ Phase 5 | Check `can_add_voters()` before CSV upload |
| Coin balance sync | ⏳ Phase 5 | Update user profile with coin balance |
| Subscription checks | ⏳ Phase 5 | Permission checks based on tier |

---

## 🧪 Testing Workflows

### Test 1: Subscription Purchase

**Expected Flow**:
1. Click "Upgrade Tier" → SubscriptionPicker appears
2. Click "Subscribe Now" → Redirected to Stripe Checkout
3. Enter test card: `4242 4242 4242 4242`
4. Complete payment → Redirect to `/organizations?subscription=success`
5. Verify in Supabase: `subscriptions` table has new entry
6. Verify: `organizations.subscription_tier` updated
7. Return to dashboard → SubscriptionStatus shows new tier

**Test Cards**:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

---

### Test 2: Coin Purchase

**Expected Flow**:
1. Click "Get Coins" button → CoinsPurchaseModal opens
2. Select coin package (e.g., "Popular")
3. Stripe Card Element appears
4. Enter test card: `4242 4242 4242 4242`
5. Click "Purchase Coins" → `stripe.confirmCardPayment()` called
6. See success animation → Modal closes
7. Verify in Supabase: `coin_purchases` table has new entry
8. Coin balance in top bar increases

**Stripe Card Element (dark theme)**:
- Mounts in `.StripeElement` div
- Shows field errors in red
- Auto-formats card numbers
- Custom styling matching app

---

### Test 3: Webhook Events

**Setup**:
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Authenticate with Stripe
stripe login

# Terminal 3: Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Events to Test**:
1. `invoice.payment_succeeded` → Updates `subscriptions` status
2. `invoice.payment_failed` → Sets status to `past_due`
3. `customer.subscription.deleted` → Sets status to `canceled`
4. `payment_intent.succeeded` → Creates `coin_purchases` entry
5. `charge.refunded` → Processes refunds

**Verify**:
- Webhook events appear in Stripe CLI
- Database updates happen after event
- No errors in Next.js server logs

---

### Test 4: Billing Portal

**Flow**:
1. In SubscriptionStatus, click "Manage Billing"
2. Redirected to Stripe Billing Portal
3. Can update payment method, change billing email, cancel subscription
4. Return to app via "Return to VoteQuest" link

**Note**: Billing portal URL expires in 24 hours; generates new session each time

---

### Test 5: Error Handling

**Test Scenarios**:
- [ ] Missing `userId` in request → 400 Bad Request
- [ ] Invalid `packageType` → 400 Bad Request
- [ ] Unauthorized user (not org creator) → 403 Forbidden
- [ ] Network error during payment → Show error message, allow retry
- [ ] Invalid card → Stripe shows inline error
- [ ] Rate limit hit (10 req/60s) → 429 Too Many Requests

---

### Test 6: UI/UX

- [ ] SubscriptionPicker displays 3 cards with correct prices
- [ ] Popular tier (Professional) has "MOST POPULAR" badge
- [ ] Current tier shows "Current Plan" button instead of "Subscribe"
- [ ] "Upgrade" button shows on lower tiers, hidden on Enterprise
- [ ] CoinsPurchaseModal has "BEST VALUE" badge on Popular package
- [ ] Card Elements properly themed for dark mode
- [ ] Loading spinners appear during processing
- [ ] Error messages appear in red boxes
- [ ] Success messages appear in green boxes
- [ ] Buttons have proper hover/disabled states

---

## 📊 Database Verification

### After Subscription Purchase
```sql
-- In Supabase SQL Editor
SELECT * FROM subscriptions WHERE organization_id = 'your-org-id';

-- Expected output:
-- id | organization_id | stripe_subscription_id | stripe_customer_id | tier | status | current_period_start | current_period_end
```

### After Coin Purchase
```sql
SELECT * FROM coin_purchases WHERE user_id = 'your-user-id';

-- Expected output:
-- id | user_id | stripe_payment_intent_id | amount_cents | vqc_amount | bonus_vqc | status
```

### Organization Updated
```sql
SELECT id, subscription_tier, subscription_id FROM organizations WHERE id = 'your-org-id';

-- Expected output:
-- id | subscription_tier | subscription_id
-- your-org-id | 2 | uuid-of-subscription
```

---

## 🔍 Debugging Tips

### Check Stripe Connection
```typescript
// Visit: http://localhost:3000/api/stripe/test
// Should return: { "status": "connected", "account": "acct_..." }
```

### Monitor Webhooks
```bash
# In Stripe CLI terminal, watch events in real-time
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Also check Stripe Dashboard > Developers > Webhooks > Events
```

### Check Component Rendering
```bash
# React DevTools in browser
# Open Components tab
# Search for "SubscriptionPicker" or "CoinsPurchaseModal"
# Check props are passed correctly
```

### Review Server Logs
```bash
# Next.js dev server console
# Look for:
# [STRIPE] Payment intent created: pi_...
# [API] Subscription created: sub_...
# Any errors will be logged with [ERROR] prefix
```

### Inspect Network Requests
```bash
# Browser DevTools > Network tab
# Look for:
# POST /api/stripe/create-subscription → should return sessionId + url
# POST /api/stripe/purchase-coins → should return clientSecret
# GET /api/organizations/[id]/subscription → should return tier info
```

---

## 🚨 Common Issues & Solutions

### Issue: "Stripe is not initialized"
**Cause**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` not set or wrong
**Solution**:
1. Check `.env.local` has `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...`
2. Restart dev server: `npm run dev`
3. Clear browser cache: DevTools > Application > Clear storage

### Issue: Card Element not rendering
**Cause**: Stripe.js failed to load or ref is null
**Solution**:
1. Check browser console for Stripe.js errors
2. Ensure `isOpen={true}` on CoinsPurchaseModal
3. Check cardRef div exists: `<div ref={cardRef} />`

### Issue: "Webhook endpoint failed"
**Cause**: Webhook signature verification failing
**Solution**:
1. Verify `STRIPE_WEBHOOK_SECRET` is correct (from webhook settings)
2. Check webhook handler is receiving `stripe-signature` header
3. Look at webhook logs in Stripe Dashboard

### Issue: Subscription not created in DB
**Cause**: Webhook not fired or migration not run
**Solution**:
1. Verify migration ran: Check `subscriptions` table exists in Supabase
2. Verify webhook endpoint is enabled: Stripe Dashboard > Webhooks
3. Check webhook logs for errors
4. Verify webhook secret is correct

### Issue: Rate limit error
**Cause**: Too many requests from same IP (10/60s limit)
**Solution**:
1. Wait 1 minute before retrying
2. Check if multiple tabs/requests being sent
3. Modify rate limit in API route if needed (for testing only)

---

## 📱 Payment Method Support

### Supported Card Types
- Visa
- Mastercard
- American Express
- Discover
- Diners Club
- JCB

### Supported Digital Wallets
- Apple Pay
- Google Pay
(Enable in Stripe Dashboard > Payment Methods)

---

## 💡 Tips & Tricks

### Test Multiple Tiers Quickly
1. Use test cards with different outcomes
2. Can create multiple test customers in Stripe
3. Use Stripe CLI to replay webhook events for testing

### Monitor Real-Time Payments
```bash
# Watch Stripe Dashboard in real-time
# Go to: https://dashboard.stripe.com/test/dashboard
# Payments refresh in real-time without page reload
```

### Export Test Data
```bash
# Supabase > Database > Tables
# Click three dots > Export as CSV
# Useful for verifying all records created
```

### Clear Test Data
```sql
-- If you want to reset for clean testing:
-- In Supabase SQL Editor:
DELETE FROM coin_purchases;
DELETE FROM subscriptions;
UPDATE organizations SET subscription_id = NULL, subscription_tier = 1;
```

---

## 📞 Getting Help

- **Stripe Issues**: Check Stripe Dashboard > Developers > Logs
- **Database Issues**: Check Supabase > SQL Editor for errors
- **Component Issues**: Check browser console and React DevTools
- **Network Issues**: Check Network tab in DevTools
- **Server Issues**: Check Next.js terminal output

---

**Last Updated**: December 8, 2025
**Version**: 1.0
