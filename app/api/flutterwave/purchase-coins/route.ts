import { NextResponse } from 'next/server';
// @ts-ignore
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
import { supabaseAdmin } from '@/lib/server-db';
import { rateLimit } from '@/lib/rate-limit';

if (!FLUTTERWAVE_SECRET_KEY) {
    throw new Error('FLUTTERWAVE_SECRET_KEY not set');
}

// Coin package pricing (in kobo)
const COIN_PACKAGES = {
    trial: { vqc: 50, kobo: 50000, bonus: 0 },        // ₦500
    starter: { vqc: 200, kobo: 150000, bonus: 0 },    // ₦1,500
    popular: { vqc: 500, kobo: 400000, bonus: 50 },   // ₦4,000
    power: { vqc: 1500, kobo: 1000000, bonus: 300 }   // ₦10,000
};

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!rateLimit(ip, 10, 60000)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const { userId, packageType } = body;

        if (!userId || !packageType) {
            return NextResponse.json({
                error: 'Missing userId or packageType'
            }, { status: 400 });
        }

        const pkg = COIN_PACKAGES[packageType as keyof typeof COIN_PACKAGES];
        if (!pkg) {
            return NextResponse.json({
                error: 'Invalid package type'
            }, { status: 400 });
        }

        // Get user email
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('id', userId)
            .single();

        if (!user?.email) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Use the request's origin to determine where to redirect back to.
        // This ensures it works on Localhost, Vercel/Netlify Preview, and Production automatically.
        const origin = new URL(request.url).origin;
        console.log('[DEBUG] Dynamic Origin:', origin);

        const redirectUrl = `${origin}/api/flutterwave/verify-coins?package=${packageType}&t=${Date.now()}`;
        console.log('[DEBUG] Generated Redirect URL:', redirectUrl);

        // Create Flutterwave payment link via fetch
        const payload = {
            tx_ref: `coins_${userId}_${Date.now()}`,
            amount: pkg.kobo / 100, // Convert kobo to Naira
            currency: 'NGN',
            redirect_url: redirectUrl,
            customer: {
                email: user.email,
                name: 'VoteQuest User',
            },
            customizations: {
                title: 'VoteQuest Coins',
                description: `${pkg.vqc} coins${pkg.bonus ? ` + ${pkg.bonus} bonus` : ''}`,
                logo: 'https://votequest.app/logo.png',
            },
            meta: {
                userId,
                vqcAmount: pkg.vqc.toString(),
                bonusVqc: pkg.bonus.toString(),
                packageType,
                type: 'coin_purchase'
            }
        };

        const flwResponse = await fetch('https://api.flutterwave.com/v3/payments', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const flwData = await flwResponse.json();

        if (!flwResponse.ok || !flwData.data?.link) {
            console.error('[FLUTTERWAVE] API Error:', flwData);
            return NextResponse.json({
                error: 'Failed to generate payment link via API'
            }, { status: 500 });
        }

        return NextResponse.json({
            paymentLink: flwData.data.link,
            reference: flwData.data.reference || '',
            amount: pkg.kobo / 100,
            vqc: pkg.vqc + pkg.bonus
        });

    } catch (error: any) {
        console.error('[FLUTTERWAVE] Coin purchase error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create payment' },
            { status: 500 }
        );
    }
}
