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

    console.log('[VerifyCoins] Verifying:', tx_ref, transaction_id);

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
    console.log('[VerifyCoins] Flutterwave response:', verifyData.status);

    if (verifyData.status !== 'success' || verifyData.data?.status !== 'successful') {
      return NextResponse.json({
        success: false,
        status: verifyData.data?.status || 'failed',
        message: 'Payment not confirmed'
      });
    }

    const { meta } = verifyData.data;
    const userId = meta?.user_id;
    const coinsAmount = meta?.coins_amount;

    if (!userId || !coinsAmount) {
      return NextResponse.json({
        success: false,
        message: 'Missing user or coins info'
      }, { status: 400 });
    }

    // Check if already processed (idempotency)
    const { data: existingTx } = await supabaseAdmin
      .from('coin_transactions')
      .select('status')
      .eq('tx_ref', tx_ref)
      .single();

    if (existingTx?.status === 'completed') {
      console.log('[VerifyCoins] Already processed:', tx_ref);
      return NextResponse.json({
        success: true,
        status: 'already_processed',
        coins: coinsAmount
      });
    }

    // Update transaction status
    await supabaseAdmin
      .from('coin_transactions')
      .update({
        status: 'completed',
        flutterwave_tx_id: verifyData.data.id,
        completed_at: new Date().toISOString()
      })
      .eq('tx_ref', tx_ref);

    // Award coins to user
    await awardCoins(userId, coinsAmount, 'purchase', tx_ref, {
      flutterwave_tx_id: verifyData.data.id,
      amount_paid: verifyData.data.amount
    });

    // Send notification
    await createNotification(
      userId,
      'coins_purchased',
      'Coins Added!',
      `${coinsAmount} VQC have been added to your wallet.`,
      tx_ref
    );

    console.log('[VerifyCoins] Coins awarded:', userId, coinsAmount);

    return NextResponse.json({
      success: true,
      status: 'completed',
      coins: coinsAmount
    });

  } catch (error: any) {
    console.error('[VerifyCoins] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
}
