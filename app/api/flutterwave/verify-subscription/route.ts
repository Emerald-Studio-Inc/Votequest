import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const transactionId = searchParams.get('transaction_id');
        const status = searchParams.get('status');

        // Old params for fallback
        const orgParam = searchParams.get('org');

        if (!transactionId) {
            return NextResponse.redirect(
                new URL(`/?screen=organization-dashboard&orgId=${orgParam}&subscriptionError=true`, request.url)
            );
        }

        if (status === 'cancelled') {
            return NextResponse.redirect(
                new URL(`/?screen=organization-dashboard&orgId=${orgParam}&subscriptionError=true`, request.url)
            );
        }

        // Verify transaction with Flutterwave
        const flwResponse = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const flwData = await flwResponse.json();

        if (flwData.status === 'success' && flwData.data.status === 'successful') {
            const data = flwData.data;
            const meta = data.meta;
            const { organizationId, userId, tier } = meta;

            // Check if subscription already processed
            const { data: existingSub } = await supabaseAdmin
                .from('subscriptions')
                .select('id')
                .eq('stripe_subscription_id', data.tx_ref)
                .single();

            if (!existingSub) {
                // Create subscription record
                const { data: subscription, error: subError } = await supabaseAdmin
                    .from('subscriptions')
                    .insert({
                        organization_id: organizationId,
                        stripe_subscription_id: data.tx_ref,
                        stripe_customer_id: `flutterwave_${userId}`,
                        tier: parseInt(tier),
                        status: 'active',
                        current_period_start: new Date().toISOString(),
                        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    })
                    .select()
                    .single();

                if (!subError) {
                    // Update organization tier and limits
                    const tierInt = parseInt(tier);
                    const VOTER_LIMITS: Record<number, number> = { 1: 50, 2: 250, 3: 1000 };

                    await supabaseAdmin
                        .from('organizations')
                        .update({
                            subscription_id: subscription.id,
                            subscription_tier: tierInt,
                            max_voters_per_room: VOTER_LIMITS[tierInt] || 50,
                            subscription_status: 'active'
                        })
                        .eq('id', organizationId);
                }
            }

            // Redirect to root with success flag and orgId
            return NextResponse.redirect(
                new URL(`/?screen=organization-dashboard&orgId=${organizationId}&subscriptionSuccess=true`, request.url)
            );
        } else {
            return NextResponse.redirect(
                new URL(`/?screen=organization-dashboard&orgId=${orgParam}&subscriptionError=true`, request.url)
            );
        }

    } catch (error) {
        console.error('[FLUTTERWAVE] Subscription verification error:', error);
        return NextResponse.redirect(
            new URL(`/?subscriptionError=true`, request.url)
        );
    }
}
