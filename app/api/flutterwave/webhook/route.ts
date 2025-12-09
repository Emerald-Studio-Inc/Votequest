import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import crypto from 'crypto';

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || '';

function verifyFlutterwaveWebhook(payload: string, signature: string): boolean {
    const hash = crypto.createHmac('sha256', FLUTTERWAVE_SECRET_KEY)
        .update(payload)
        .digest('hex');
    return hash === signature;
}

export async function POST(request: Request) {
    try {
        const payload = await request.text();
        const signature = request.headers.get('verif-hash') || '';

        // Verify webhook signature
        if (!verifyFlutterwaveWebhook(payload, signature)) {
            console.warn('[FLUTTERWAVE] Invalid webhook signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(payload);
        const data = event.data || {};

        console.log('[FLUTTERWAVE] Webhook received:', event.event);

        // Only process successful charges
        if (event.event !== 'charge.completed' || data.status !== 'successful') {
            return NextResponse.json({ status: 'ok' });
        }

        const { tx_ref, meta } = data;

        // Handle subscription payment
        if (meta?.type === 'subscription') {
            const { organizationId, userId, tier } = meta;

            // Get user for customer info
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('email')
                .eq('id', userId)
                .single();

            // Create subscription record
            const { data: subscription, error: subError } = await supabaseAdmin
                .from('subscriptions')
                .insert({
                    organization_id: organizationId,
                    stripe_subscription_id: tx_ref, // Using Flutterwave tx_ref as reference
                    stripe_customer_id: `flutterwave_${userId}`,
                    tier: parseInt(tier),
                    status: 'active',
                    current_period_start: new Date().toISOString(),
                    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                })
                .select()
                .single();

            if (subError) {
                console.error('[FLUTTERWAVE] Failed to create subscription:', subError);
                return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
            }

            // Update organization tier
            const { error: updateError } = await supabaseAdmin
                .from('organizations')
                .update({
                    subscription_id: subscription.id,
                    subscription_tier: parseInt(tier)
                })
                .eq('id', organizationId);

            if (updateError) {
                console.error('[FLUTTERWAVE] Failed to update organization:', updateError);
            }

            console.log('[FLUTTERWAVE] Subscription activated for org:', organizationId, 'tier:', tier);
        }

        // Handle coin purchase
        if (meta?.type === 'coin_purchase') {
            const { userId, vqcAmount, bonusVqc } = meta;

            // Create coin purchase record
            const { error: coinError } = await supabaseAdmin
                .from('coin_purchases')
                .insert({
                    user_id: userId,
                    stripe_payment_intent_id: tx_ref, // Using Flutterwave tx_ref as reference
                    amount_cents: Math.round(data.amount * 100), // Convert Naira to cents for storage
                    vqc_amount: parseInt(vqcAmount),
                    bonus_vqc: parseInt(bonusVqc || 0),
                    status: 'succeeded'
                });

            if (coinError) {
                console.error('[FLUTTERWAVE] Failed to record coin purchase:', coinError);
                return NextResponse.json({ error: 'Failed to save coin purchase' }, { status: 500 });
            }

            // Add coins to user's coin balance
            const amount = parseInt(vqcAmount) + parseInt(bonusVqc || '0');

            // Get current balance first
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('coins')
                .eq('id', userId)
                .single();

            if (user) {
                const newBalance = (user.coins || 0) + amount;

                await supabaseAdmin
                    .from('users')
                    .update({ coins: newBalance })
                    .eq('id', userId);

                console.log('[FLUTTERWAVE] Updated user coin balance:', newBalance);

                // Create notification
                await supabaseAdmin.from('notifications').insert({
                    user_id: userId,
                    type: 'coins_purchased',
                    title: 'Coins Purchased',
                    message: `Successfully purchased ${amount} coins`,
                    metadata: { amount, tx_ref },
                    read: false
                });
            }
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error: any) {
        console.error('[FLUTTERWAVE] Webhook error:', error);
        return NextResponse.json(
            { error: error.message || 'Webhook processing failed' },
            { status: 500 }
        );
    }
}
