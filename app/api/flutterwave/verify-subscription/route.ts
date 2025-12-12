import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { awardCoins, createNotification } from '@/lib/coins';

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

export async function POST(request: NextRequest) {
  try {
    const { tx_ref, transaction_id } = await request.json();

    if (!tx_ref) {
      return NextResponse.json({ error: 'Missing tx_ref' }, { status: 400 });
    }

    console.log('[VerifySubscription] Verifying:', tx_ref, transaction_id);

    // Verify with Flutterwave
    const verifyUrl = transaction_id
      ? `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`
      : `https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${tx_ref}`;

    const verifyResponse = await fetch(verifyUrl, {
      headers: {
        'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`
      }
    });

    const verifyData = await verifyResponse.json();
    console.log('[VerifySubscription] Flutterwave response:', verifyData.status);

    if (verifyData.status !== 'success' || verifyData.data?.status !== 'successful') {
      return NextResponse.json({
        success: false,
        status: verifyData.data?.status || 'failed',
        message: 'Payment not confirmed'
      });
    }

    const { meta } = verifyData.data;
    const organizationId = meta?.organization_id;
    const planId = meta?.plan_id;
    const tier = meta?.tier || 1;

    if (!organizationId || !planId) {
      return NextResponse.json({
        success: false,
        message: 'Missing organization or plan info'
      }, { status: 400 });
    }

    // Update subscription status
    await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        flutterwave_tx_id: verifyData.data.id,
        activated_at: new Date().toISOString()
      })
      .eq('tx_ref', tx_ref);

    // Update organization subscription tier
    const tierLimits: Record<number, { rooms: number; voters: number }> = {
      1: { rooms: 10, voters: 100 },
      2: { rooms: 50, voters: 500 },
      3: { rooms: 999, voters: 10000 }
    };

    const limits = tierLimits[tier] || tierLimits[1];

    await supabaseAdmin
      .from('organizations')
      .update({
        subscription_tier: tier,
        max_rooms: limits.rooms,
        max_voters_per_room: limits.voters
      })
      .eq('id', organizationId);

    // Award bonus coins for subscription
    const bonusCoins = tier === 3 ? 100 : tier === 2 ? 50 : 20;
    if (meta?.user_id) {
      await awardCoins(meta.user_id, bonusCoins, 'subscription_bonus', organizationId, {
        plan: planId,
        tier
      });

      await createNotification(
        meta.user_id,
        'subscription_activated',
        'Subscription Active!',
        `Your ${planId} subscription is now active. Enjoy ${bonusCoins} bonus coins!`,
        organizationId
      );
    }

    console.log('[VerifySubscription] Subscription activated:', organizationId, planId);

    return NextResponse.json({
      success: true,
      status: 'active',
      plan: planId,
      tier,
      bonusCoins
    });

  } catch (error: any) {
    console.error('[VerifySubscription] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
