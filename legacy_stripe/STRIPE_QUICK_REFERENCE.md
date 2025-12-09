# Stripe Integration - Developer Quick Reference

## 📦 Install Dependencies
```bash
npm install stripe @stripe/stripe-js
```

## 🔧 Environment Variables
```
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📂 File Locations

### Components
```
components/SubscriptionPicker.tsx      - Subscription tier selection UI
components/CoinsPurchaseModal.tsx      - Coin purchase modal with Stripe Elements
components/SubscriptionStatus.tsx      - Display subscription status widget
components/TopHeader.tsx                - Updated with "Get Coins" button
```

### APIs
```
app/api/stripe/create-subscription      - Create subscription checkout (existing)
app/api/stripe/purchase-coins           - Create payment intent (existing)
app/api/stripe/portal                   - Billing portal link (existing)
app/api/stripe/webhook                  - Webhook handler (existing)
app/api/organizations/[id]/subscription - Fetch subscription details (new)
```

### Database
```
migrations/stripe_payment_system.sql    - Schema migration file
```

## 🎯 Quick API Usage

### Create Subscription
```typescript
const response = await fetch('/api/stripe/create-subscription', {
    method: 'POST',
    body: JSON.stringify({
        organizationId: 'org-uuid',
        userId: 'user-uuid',
        tier: 2  // 1, 2, or 3
    })
});
const { url } = await response.json();
window.location.href = url;  // Redirect to Stripe Checkout
```

### Get Subscription Status
```typescript
const response = await fetch(`/api/organizations/${orgId}/subscription`, {
    headers: {
        'x-user-id': userId
    }
});
const { tier, status, currentPeriodEnd } = await response.json();
```

### Purchase Coins
```typescript
// Step 1: Create payment intent
const response = await fetch('/api/stripe/purchase-coins', {
    method: 'POST',
    body: JSON.stringify({
        userId: 'user-uuid',
        packageType: 'popular'  // trial, starter, popular, power
    })
});
const { clientSecret, vqc } = await response.json();

// Step 2: Confirm payment (handled by CoinsPurchaseModal)
const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: { card: cardElement }
});
```

### Access Billing Portal
```typescript
const response = await fetch('/api/stripe/portal', {
    method: 'POST',
    body: JSON.stringify({
        organizationId: 'org-uuid',
        userId: 'user-uuid'
    })
});
const { url } = await response.json();
window.location.href = url;
```

## 🧪 Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

Expiry: Any future date | CVC: Any 3 digits

## 🔄 Component Integration Examples

### Using SubscriptionPicker
```tsx
<SubscriptionPicker
    organizationId={orgId}
    userId={userId}
    currentTier={2}
    onSuccess={(tier) => console.log('Upgraded to tier', tier)}
    onCancel={() => setShowPicker(false)}
/>
```

### Using CoinsPurchaseModal
```tsx
<CoinsPurchaseModal
    userId={userId}
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    onSuccess={(coins) => console.log('Purchased', coins, 'coins')}
/>
```

### Using SubscriptionStatus
```tsx
<SubscriptionStatus
    organizationId={orgId}
    userId={userId}
    onUpgrade={() => setShowPicker(true)}
/>
```

## 💾 Database Queries

### Check Subscriptions
```sql
SELECT * FROM subscriptions 
WHERE organization_id = 'org-uuid'
ORDER BY created_at DESC;
```

### Check Coin Purchases
```sql
SELECT * FROM coin_purchases 
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

### Check Organization Status
```sql
SELECT id, subscription_tier, subscription_id 
FROM organizations 
WHERE id = 'org-uuid';
```

### Get Voter Limits
```sql
SELECT get_voter_limit(1) as starter,
       get_voter_limit(2) as professional,
       get_voter_limit(3) as enterprise;
```

## 🔍 Debug Commands

### Check Stripe Connection
```bash
curl -H "Authorization: Bearer $STRIPE_SECRET_KEY" \
  https://api.stripe.com/v1/account
```

### Monitor Webhooks (Local)
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### View Webhook Events
```bash
stripe events list
stripe events retrieve evt_...
```

### Check Logs
```bash
# Stripe Dashboard
https://dashboard.stripe.com/logs

# Supabase
https://supabase.com/dashboard > Logs > Postgres
```

## 🚨 Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Missing fields | Check request body |
| 403 | Unauthorized | Verify user owns organization |
| 404 | Not found | Check IDs exist in database |
| 429 | Rate limited | Wait 60 seconds, try again |
| 500 | Server error | Check Stripe dashboard logs |

## 📊 Pricing Configuration

### Subscription Tiers
| Tier | Name | Price | Voters |
|------|------|-------|--------|
| 1 | Starter | $19 | 50 |
| 2 | Professional | $49 | 250 |
| 3 | Enterprise | $99 | 1000 |

### Coin Packages
| Package | Coins | Bonus | Price |
|---------|-------|-------|-------|
| Trial | 50 | 0 | $0.99 |
| Starter | 200 | 0 | $2.99 |
| Popular | 500 | 50 | $6.99 |
| Power | 1500 | 300 | $14.99 |

## 🎨 Styling Classes

### Button States
```tsx
// Primary (active)
className="bg-blue-600 hover:bg-blue-700 text-white"

// Secondary (disabled)
className="bg-white/10 text-white/50 cursor-not-allowed"

// Loading
className="opacity-70"

// Popular badge
className="bg-gradient-to-r from-blue-600 to-purple-600"
```

### Status Colors
```tsx
// Active
"text-green-400 bg-green-500/10"

// Past Due
"text-yellow-400 bg-yellow-500/10"

// Failed
"text-red-400 bg-red-500/10"

// Pending
"text-orange-400 bg-orange-500/10"
```

## 🔐 Security Checklist

- [ ] API validates user ownership
- [ ] Webhook signature verified
- [ ] Rate limiting enforced
- [ ] Environment variables not committed
- [ ] Card data never touches server
- [ ] HTTPS used in production
- [ ] Webhook endpoint secured
- [ ] Access logs monitored

## 📝 Common Patterns

### Handle Stripe Errors
```typescript
try {
    const response = await fetch('/api/stripe/...');
    if (!response.ok) {
        const { error } = await response.json();
        setError(error);
        return;
    }
    // Process success
} catch (err) {
    setError('Network error');
}
```

### Initialize Stripe Elements
```typescript
useEffect(() => {
    const stripe = await Stripe.loadStripe(pk);
    const elements = stripe.elements();
    const card = elements.create('card');
    card.mount(ref.current);
}, []);
```

### Confirm Payment
```typescript
const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
        card: cardElement,
        billing_details: { /* optional */ }
    }
});
if (result.paymentIntent.status === 'succeeded') {
    // Success!
}
```

## 🚀 Deployment Checklist

- [ ] Install packages: `npm install stripe @stripe/stripe-js`
- [ ] Add to .env.local all 4 vars
- [ ] Run DB migration
- [ ] Test with test cards
- [ ] Set up webhooks in Stripe Dashboard
- [ ] Deploy to staging
- [ ] Test in staging environment
- [ ] Switch to live keys
- [ ] Update webhook URL to production
- [ ] Monitor first transactions

## 📚 Documentation Files

- `STRIPE_SETUP_INSTRUCTIONS.md` - Step-by-step setup
- `STRIPE_IMPLEMENTATION_SUMMARY.md` - Technical details
- `STRIPE_TESTING_GUIDE.md` - Test procedures
- `STRIPE_DELIVERY_SUMMARY.md` - Project overview

---

**Quick Help**: See the documentation files for detailed information
**Code Reference**: Check component files for implementation details
**Issues?**: Check STRIPE_TESTING_GUIDE.md troubleshooting section
