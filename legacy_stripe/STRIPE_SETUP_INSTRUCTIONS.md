# Stripe Integration Setup Instructions

## Step 1: Install Required Stripe Packages

The following packages need to be added to your project's dependencies:

```bash
# Server-side Stripe library
npm install stripe

# Client-side Stripe library (for payment elements and card processing)
npm install @stripe/stripe-js
```

Or using yarn:
```bash
yarn add stripe @stripe/stripe-js
```

## Step 2: Configure Environment Variables

Add the following to your `.env.local` file (already listed in `.env.local.example`):

```
# Stripe API Keys (get from Stripe Dashboard: https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Webhook Secret (get from Stripe Dashboard: Settings > Webhooks)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# For redirect URLs in subscription checkout
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Create Stripe Account (if not already done)

1. Go to https://dashboard.stripe.com
2. Sign up for a Stripe account
3. Navigate to **Developers > API Keys**
4. Copy your **Publishable Key** and **Secret Key**
5. Set up a webhook endpoint:
   - Go to **Developers > Webhooks**
   - Click "Add endpoint"
   - Use URL: `http://localhost:3000/api/stripe/webhook` (for local testing)
   - Select these events to send:
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.deleted`
     - `customer.subscription.updated`
     - `charge.refunded`
     - `payment_intent.succeeded`
   - Copy the **Signing Secret** and add to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Step 4: Execute Database Migration

**CRITICAL**: Before testing, run the database migration in Supabase:

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `migrations/stripe_payment_system.sql`
5. Paste into the SQL Editor
6. Click "Run"
7. Verify both tables were created:
   - `subscriptions` table
   - `coin_purchases` table
   - Check the `organizations` table has new `subscription_id` and `subscription_tier` columns

## Step 5: Verify Installation

### Check Dependencies
```bash
npm list stripe @stripe/stripe-js
```

### Test Stripe Connection (Optional)
Create a test endpoint to verify Stripe is working:

```typescript
// app/api/stripe/test/route.ts
import Stripe from 'stripe';

export async function GET() {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const account = await stripe.account.retrieve();
        return Response.json({ status: 'connected', account: account.id });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}
```

Then visit: `http://localhost:3000/api/stripe/test`

## Step 6: Test Stripe Integration

### Using Stripe Test Cards

For **Testing Subscriptions**:
- Card Number: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., `12/25`)
- CVC: Any 3 digits (e.g., `123`)
- Zip Code: Any 5 digits (e.g., `12345`)

For **Testing Failed Payments**:
- Card Number: `4000 0000 0000 0002`
- Other details same as above

### Manual Testing Flow

1. **Start dev server**:
   ```bash
   npm run dev
   ```

2. **Test Subscription**:
   - Navigate to organization dashboard
   - Click "Upgrade Tier" button
   - See SubscriptionPicker modal
   - Click "Subscribe Now" on any tier
   - Use test card above
   - Should redirect to Stripe Checkout
   - After payment completes, check Supabase `subscriptions` table for new entry

3. **Test Coin Purchase**:
   - Click "Get Coins" button in top bar
   - See CoinsPurchaseModal
   - Select a coin package
   - Enter test card details in Stripe Card Element
   - Click "Purchase Coins"
   - Should see success message
   - Check Supabase `coin_purchases` table for new entry

4. **Test Webhook (Local)**:
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli/install
   - Run in another terminal:
     ```bash
     stripe login
     stripe listen --forward-to localhost:3000/api/stripe/webhook
     ```
   - Make a test purchase
   - Watch webhook events in CLI output
   - Verify database is updated when webhook fires

## Step 7: Production Deployment

### Before Going Live:

1. **Get Live Keys**:
   - In Stripe Dashboard, toggle "Viewing test data" switch to OFF
   - Copy your Live Publishable and Secret keys
   - **NEVER** commit these to version control

2. **Update Environment Variables**:
   - Add to your hosting platform's environment variables:
     - `STRIPE_SECRET_KEY` (live key)
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live key)
     - `STRIPE_WEBHOOK_SECRET` (live signing secret)
     - `NEXT_PUBLIC_APP_URL` (your production domain)

3. **Configure Webhook for Production**:
   - In Stripe Dashboard > Webhooks
   - Add new endpoint for production URL:
     - `https://your-domain.com/api/stripe/webhook`
   - Get the signing secret for this endpoint
   - Update `STRIPE_WEBHOOK_SECRET` in production

4. **Test in Sandbox First**:
   - Deploy to staging environment
   - Run through all test flows again with test cards
   - Verify webhooks work in production webhook logs

5. **Enable Live Mode**:
   - Only after all tests pass
   - Test with real cards (on your own payment method)
   - Monitor Stripe Dashboard for any issues

## Troubleshooting

### "STRIPE_SECRET_KEY not set"
- Check `.env.local` file exists
- Verify variable name exactly matches `STRIPE_SECRET_KEY`
- Restart dev server after adding env var

### "Stripe is not initialized" in CoinsPurchaseModal
- Check `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set
- Verify it's prefixed with `NEXT_PUBLIC_` so it's available in browser
- Check for console errors in browser dev tools

### Webhook not triggering
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check Stripe CLI is running with correct forwarding URL
- Check webhook endpoint in Stripe Dashboard is enabled
- Look at webhook logs in Stripe Dashboard for any errors

### Subscriptions table not created
- Verify SQL migration ran completely without errors
- Check Supabase SQL Editor for any error messages
- Try running migration again, ignoring errors about "IF NOT EXISTS"

### Card Element not appearing
- Check browser console for Stripe.js load errors
- Verify `@stripe/stripe-js` is installed
- Check that CoinsPurchaseModal is being rendered with `isOpen={true}`

## Related Documentation

- Stripe API Reference: https://stripe.com/docs/api
- Stripe Payment Element: https://stripe.com/docs/payments/accept-a-payment
- Next.js with Stripe: https://stripe.com/docs/libraries/stripe-js/stripe-elements/quickstart
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Testing: https://stripe.com/docs/testing

## Support

For issues with:
- **Stripe Integration**: Check Stripe Dashboard > Logs for webhook/API errors
- **Database**: Check Supabase > SQL Editor for any migration errors
- **Components**: Check browser console for React/component errors
- **General**: Refer to code comments in component files

---

**Last Updated**: December 8, 2025
