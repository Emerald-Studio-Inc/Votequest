
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { rateLimit } from '@/lib/rate-limit';

// Tier pricing mapping (in kobo - divide by 100 for Naira)
const TIER_PRICES = {
    1: { monthly: 300000, name: 'Starter', voters: 50 },      // ₦3,000/mo
    2: { monthly: 800000, name: 'Professional', voters: 250 }, // ₦8,000/mo
    3: { monthly: 2000000, name: 'Enterprise', voters: 1000 },  // ₦20,000/mo
};

export async function POST(request: Request) {
    try {
        if (!process.env.FLUTTERWAVE_SECRET_KEY) {
            console.error('FLUTTERWAVE_SECRET_KEY not set');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!rateLimit(ip, 10, 60000)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const { organizationId, userId, tier } = body;

        // Validate inputs
        if (!organizationId || !userId || !tier) {
            return NextResponse.json({
                error: 'Missing required fields'
            }, { status: 400 });
        }

        if (![1, 2, 3].includes(tier)) {
            return NextResponse.json({
                error: 'Invalid tier. Must be 1, 2, or 3'
            }, { status: 400 });
        }

        // Verify user owns organization
        console.log('[DEBUG] Querying organization with ID:', organizationId);
        const { data: org, error: orgError } = await supabaseAdmin
            .from('organizations')
            .select('id, name, created_by')
            .eq('id', organizationId)
            .single();

        console.log('[DEBUG] Org query result:', { org, orgError });

        if (orgError || !org) {
            console.error('[DEBUG] Organization not found error:', orgError);
            return NextResponse.json({
                error: 'Organization not found',
                details: orgError
            }, { status: 404 });
        }

        if (org.created_by !== userId) {
            return NextResponse.json({
                error: 'Unauthorized - you must own this organization'
            }, { status: 403 });
        }

        // Check if org already has active subscription
        const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('id, status, tier')
            .eq('organization_id', organizationId)
            .eq('status', 'active')
            .single();

        if (existingSub) {
            return NextResponse.json({
                error: 'Organization already has an active subscription',
                currentTier: existingSub.tier
            }, { status: 400 });
        }

        // Get user email for Flutterwave
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('id', userId)
            .single();

        if (!user?.email) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const priceInfo = TIER_PRICES[tier as keyof typeof TIER_PRICES];

        // Use dynamic origin
        const origin = new URL(request.url).origin;
        console.log('[DEBUG] Subscription Dynamic Origin:', origin);

        const redirectUrl = `${origin}/api/flutterwave/verify-subscription?org=${organizationId}&tier=${tier}&t=${Date.now()}`;
        console.log('[DEBUG] Generated Redirect URL:', redirectUrl);

        // Create Flutterwave payment link
        // Create Flutterwave payment link via fetch (SDK is unreliable in this env)
        const payload = {
            tx_ref: `sub_${organizationId}_${Date.now()}`,
            amount: priceInfo.monthly / 100, // Convert kobo to Naira
            currency: 'NGN',
            redirect_url: redirectUrl,
            customer: {
                email: user.email,
                name: org.name,
            },
            customizations: {
                title: `VoteQuest ${priceInfo.name} Plan`,
                description: `${priceInfo.voters} voter limit - Monthly subscription`,
                logo: 'https://votequest.app/logo.png',
            },
            meta: {
                organizationId,
                userId,
                tier,
                type: 'subscription'
            }
        };

        const flwResponse = await fetch('https://api.flutterwave.com/v3/payments', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const flwData = await flwResponse.json();

        console.log('[FLUTTERWAVE] Payment initiated:', flwData);

        if (!flwResponse.ok || !flwData.data?.link) {
            console.error('[FLUTTERWAVE] API Error:', flwData);
            return NextResponse.json({
                error: 'Failed to generate payment link via API'
            }, { status: 500 });
        }

        return NextResponse.json({
            paymentLink: flwData.data.link,
            reference: flwData.data.reference || '',
            tier,
            amount: priceInfo.monthly / 100
        });

    } catch (error: any) {
        console.error('[FLUTTERWAVE] Subscription error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create subscription' },
            { status: 500 }
        );
    }
}
