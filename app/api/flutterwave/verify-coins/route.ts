import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const transactionId = searchParams.get('transaction_id');
        const status = searchParams.get('status');
        const txRef = searchParams.get('tx_ref');

        // Allow basic redirect if no transaction ID (e.g. manual navigation)
        if (!transactionId) {
            return NextResponse.redirect(new URL('/?coinsError=true', request.url));
        }

        if (status === 'cancelled') {
            return NextResponse.redirect(new URL('/?coinsError=true', request.url));
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
            const { userId, vqcAmount, bonusVqc } = meta;

            // Check if already processed to avoid double crediting
            const { data: existingPurchase } = await supabaseAdmin
                .from('coin_purchases')
                .select('id')
                .eq('stripe_payment_intent_id', data.tx_ref)
                .single();

            if (!existingPurchase) {
                // Record purchase
                const { error: coinError } = await supabaseAdmin
                    .from('coin_purchases')
                    .insert({
                        user_id: userId,
                        stripe_payment_intent_id: data.tx_ref,
                        amount_cents: Math.round(data.amount * 100),
                        vqc_amount: parseInt(vqcAmount),
                        bonus_vqc: parseInt(bonusVqc || 0),
                        status: 'succeeded'
                    });

                if (!coinError) {
                    // Award coins
                    const amount = parseInt(vqcAmount) + parseInt(bonusVqc || '0');

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

                        // Notification
                        const { error: notifError } = await supabaseAdmin.from('notifications').insert({
                            user_id: userId,
                            type: 'coins_purchased',
                            title: 'Coins Purchased',
                            message: `Successfully purchased ${amount} coins`,
                            metadata: { amount, tx_ref: data.tx_ref },
                            read: false
                        });

                        if (notifError) {
                            console.error('[FLUTTERWAVE] Failed to insert notification:', notifError);
                        } else {
                            console.log('[FLUTTERWAVE] Notification inserted successfully for user:', userId);
                        }
                    }
                }
            }

            return NextResponse.redirect(
                new URL(`/?coinsSuccess=true`, request.url)
            );
        } else {
            return NextResponse.redirect(
                new URL(`/?coinsError=true`, request.url)
            );
        }

    } catch (error) {
        console.error('[FLUTTERWAVE] Coins verification error:', error);
        return NextResponse.redirect(
            new URL(`/?coinsError=true`, request.url)
        );
    }
}
