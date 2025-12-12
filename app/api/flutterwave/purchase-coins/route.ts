import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { nanoid } from 'nanoid';

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface CoinPurchaseRequest {
  userId: string;
  email: string;
  packageId: string;
  amount: number;
  coins: number;
}

const COIN_PACKAGES: Record<string, { coins: number; price: number }> = {
  starter: { coins: 50, price: 500 },
  popular: { coins: 150, price: 1200 },
  best_value: { coins: 500, price: 3500 },
  whale: { coins: 1500, price: 9000 }
};

export async function POST(request: NextRequest) {
  try {
    if (!FLUTTERWAVE_SECRET_KEY) {
      console.error('[CoinPurchase] Missing FLUTTERWAVE_SECRET_KEY');
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    const body: CoinPurchaseRequest = await request.json();
    const { userId, email, packageId, amount, coins } = body;

    if (!userId || !email || !packageId || !amount || !coins) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, email, packageId, amount, coins' },
        { status: 400 }
      );
    }

    // Generate unique transaction reference
    const tx_ref = `COINS-${userId.slice(0, 8)}-${nanoid(10)}`;

    // Create pending coin transaction record
    const { error: dbError } = await supabaseAdmin
      .from('coin_transactions')
      .insert({
        user_id: userId,
        amount: coins,
        type: 'purchase',
        status: 'pending',
        tx_ref,
        metadata: {
          package_id: packageId,
          price: amount
        },
        created_at: new Date().toISOString()
      });

    if (dbError) {
      console.error('[CoinPurchase] DB Error:', dbError);
      // Continue anyway - we can handle this on verification
    }

    // Create Flutterwave payment link
    const flutterwavePayload = {
      tx_ref,
      amount,
      currency: 'NGN',
      redirect_url: `${APP_URL}/payment-success?type=coins&tx_ref=${tx_ref}`,
      payment_options: 'card,banktransfer,ussd',
      meta: {
        type: 'coins',
        user_id: userId,
        package_id: packageId,
        coins_amount: coins
      },
      customer: {
        email,
        name: email.split('@')[0]
      },
      customizations: {
        title: 'VoteQuest Coins',
        description: `Purchase ${coins} VQC`,
        logo: `${APP_URL}/logo.png`
      }
    };

    console.log('[CoinPurchase] Creating Flutterwave payment:', tx_ref);

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
      console.error('[CoinPurchase] Flutterwave Error:', flutterwaveData);
      return NextResponse.json(
        { error: flutterwaveData.message || 'Payment initialization failed' },
        { status: 500 }
      );
    }

    console.log('[CoinPurchase] Payment link created:', flutterwaveData.data.link);

    return NextResponse.json({
      success: true,
      paymentLink: flutterwaveData.data.link,
      tx_ref
    });

  } catch (error: any) {
    console.error('[CoinPurchase] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process purchase' },
      { status: 500 }
    );
  }
}
