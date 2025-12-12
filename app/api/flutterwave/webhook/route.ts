import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { awardCoins, createNotification } from '@/lib/coins';
import crypto from 'crypto';

const FLUTTERWAVE_SECRET_HASH = process.env.FLUTTERWAVE_SECRET_HASH;

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('verif-hash');

    if (FLUTTERWAVE_SECRET_HASH && signature !== FLUTTERWAVE_SECRET_HASH) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = await request.json();
    const { event, data } = body;

    console.log('[Webhook] Received:', event, data?.tx_ref);

    // Only process successful charges
    if (event !== 'charge.completed' || data?.status !== 'successful') {
      return NextResponse.json({ received: true });
    }

    const { tx_ref, meta, amount, id: flutterwave_tx_id } = data;
    const type = meta?.type;

    if (!tx_ref || !type) {
      console.error('[Webhook] Missing tx_ref or type');
      return NextResponse.json({ received: true });
    }

    // Process based on payment type
    if (type === 'subscription') {
      const organizationId = meta.organization_id;
      const planId = meta.plan_id;
      const tier = meta.tier || 1;
      const userId = meta.user_id;

      // Update subscription
      await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          flutterwave_tx_id,
          activated_at: new Date().toISOString()
        })
        .eq('tx_ref', tx_ref);

      // Update organization
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

      // Award bonus coins
      const bonusCoins = tier === 3 ? 100 : tier === 2 ? 50 : 20;
      if (userId) {
        await awardCoins(userId, bonusCoins, 'subscription_bonus', organizationId, {
          plan: planId,
          tier,
          webhook: true
        });

        await createNotification(
          userId,
          'subscription_activated',
          'Subscription Active!',
          `Your ${planId} subscription is now active. Enjoy ${bonusCoins} bonus coins!`,
          organizationId
        );
      }

      console.log('[Webhook] Subscription activated:', organizationId);

    } else if (type === 'coins') {
      const userId = meta.user_id;
      const coinsAmount = meta.coins_amount;

      // Check if already processed
      const { data: existingTx } = await supabaseAdmin
        .from('coin_transactions')
        .select('status')
        .eq('tx_ref', tx_ref)
        .single();

      if (existingTx?.status === 'completed') {
        console.log('[Webhook] Already processed:', tx_ref);
        return NextResponse.json({ received: true });
      }

      // Update transaction
      await supabaseAdmin
        .from('coin_transactions')
        .update({
          status: 'completed',
          flutterwave_tx_id,
          completed_at: new Date().toISOString()
        })
        .eq('tx_ref', tx_ref);

      // Award coins
      if (userId && coinsAmount) {
        await awardCoins(userId, coinsAmount, 'purchase', tx_ref, {
          flutterwave_tx_id,
          webhook: true
        });

        await createNotification(
          userId,
          'coins_purchased',
          'Coins Added!',
          `${coinsAmount} VQC have been added to your wallet.`,
          tx_ref
        );
      }

      console.log('[Webhook] Coins awarded:', userId, coinsAmount);
    }

    return NextResponse.json({ received: true, processed: true });

  } catch (error: any) {
    console.error('[Webhook] Error:', error);
    // Return 200 to prevent Flutterwave retries
    return NextResponse.json({ received: true, error: error.message });
  }
}
