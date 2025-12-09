import { NextResponse } from 'next/server';
// @ts-ignore
const Flutterwave = require('flutterwave-node-v3');
import { supabaseAdmin } from '@/lib/server-db';
import { rateLimit } from '@/lib/rate-limit';

// Initialize Flutterwave
if (!process.env.FLUTTERWAVE_SECRET_KEY) {
    throw new Error('FLUTTERWAVE_SECRET_KEY not set in environment variables');
}

const flutterwave = new Flutterwave(
    process.env.FLUTTERWAVE_SECRET_KEY,
    process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || ''
);

// Tier pricing mapping (in kobo - divide by 100 for Naira)
const TIER_PRICES = {
    1: { monthly: 300000, name: 'Starter', voters: 50 },      // ₦3,000/mo
    2: { monthly: 800000, name: 'Professional', voters: 250 }, // ₦8,000/mo
    3: { monthly: 2000000, name: 'Enterprise', voters: 1000 },  // ₦20,000/mo
};

export async function POST(request: Request) {
    try {
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
        const { data: org, error: orgError } = await supabaseAdmin
            .from('organizations')
            .select('id, name, creator_id')
            .eq('id', organizationId)
            .single();

        if (orgError || !org) {
            return NextResponse.json({
                error: 'Organization not found'
            }, { status: 404 });
        }

        if (org.creator_id !== userId) {
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

        // Create Flutterwave payment link
        const payload = {
            tx_ref: `sub_${organizationId}_${Date.now()}`,
            amount: priceInfo.monthly / 100, // Convert kobo to Naira
            currency: 'NGN',
            redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/flutterwave/verify-subscription?org=${organizationId}&tier=${tier}`,
            customer: {
                email: user.email,
                name: org.name,
            },
            customizations: {
                title: `VoteQuest ${priceInfo.name} Plan`,
                description: `${priceInfo.voters} voter limit - Monthly subscription`,
                logo: 'https://votequest.app/logo.png', // Update with your logo
            },
            meta: {
                organizationId,
                userId,
                tier,
                type: 'subscription'
            }
        };

        // Create the payment
        const response = await flutterwave.Payment.initiate(payload);

        console.log('[FLUTTERWAVE] Payment initiated:', response);

        if (!response.data?.link) {
            return NextResponse.json({
                error: 'Failed to generate payment link'
            }, { status: 500 });
        }

        return NextResponse.json({
            paymentLink: response.data.link,
            reference: response.data.reference || '',
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
