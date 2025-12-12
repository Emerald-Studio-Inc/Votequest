import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { nanoid } from 'nanoid';

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface SubscriptionRequest {
  organizationId: string;
  planId: 'basic' | 'pro' | 'enterprise';
  amount: number;
  userId: string;
  email: string;
}

const PLAN_DETAILS: Record<string, { roomLimit: number; voterLimit: number; tier: number }> = {
  basic: { roomLimit: 10, voterLimit: 100, tier: 1 },
  pro: { roomLimit: 50, voterLimit: 500, tier: 2 },
  enterprise: { roomLimit: 999, voterLimit: 10000, tier: 3 }
};

export async function POST(request: NextRequest) {
  try {
    if (!FLUTTERWAVE_SECRET_KEY) {
      console.error('[Subscription] Missing FLUTTERWAVE_SECRET_KEY');
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    const body: SubscriptionRequest = await request.json();
    const { organizationId, planId, amount, userId, email } = body;

    if (!organizationId || !planId || !amount || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: organizationId, planId, amount, userId, email' },
        { status: 400 }
      );
    }

    const planDetails = PLAN_DETAILS[planId];
    if (!planDetails) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    // Generate unique transaction reference
    const tx_ref = `SUB-${organizationId.slice(0, 8)}-${nanoid(10)}`;

    // Create pending subscription record
    const { error: dbError } = await supabaseAdmin
      .from('subscriptions')
      .insert({
        organization_id: organizationId,
        plan_id: planId,
        status: 'pending',
        tx_ref,
        amount,
        user_id: userId,
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('[Subscription] DB Error:', dbError);
      // Continue anyway - we can handle this on verification
    }

    // Create Flutterwave payment link
    const flutterwavePayload = {
      tx_ref,
      amount,
      currency: 'NGN',
      redirect_url: `${APP_URL}/payment-success?type=subscription&tx_ref=${tx_ref}`,
      payment_options: 'card,banktransfer,ussd',
      meta: {
        type: 'subscription',
        organization_id: organizationId,
        plan_id: planId,
        user_id: userId,
        tier: planDetails.tier
      },
      customer: {
        email,
        name: email.split('@')[0]
      },
      customizations: {
        title: 'VoteQuest Subscription',
        description: `${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan Subscription`,
        logo: `${APP_URL}/logo.png`
      }
    };

    console.log('[Subscription] Creating Flutterwave payment:', tx_ref);

    const flutterwaveResponse = await fetch(
      'https://api.flutterwave.com/v3/payments',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(flutterwavePayload)
      }
    );

    const flutterwaveData = await flutterwaveResponse.json();

    if (!flutterwaveResponse.ok || flutterwaveData.status !== 'success') {
      console.error('[Subscription] Flutterwave Error:', flutterwaveData);
      return NextResponse.json(
        { error: flutterwaveData.message || 'Payment initialization failed' },
        { status: 500 }
      );
    }

    console.log('[Subscription] Payment link created:', flutterwaveData.data.link);

    return NextResponse.json({
      success: true,
      paymentLink: flutterwaveData.data.link,
      tx_ref
    });

  } catch (error: any) {
    console.error('[Subscription] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    );
  }
}
