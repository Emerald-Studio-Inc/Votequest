import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const org = searchParams.get('org');
        const tier = searchParams.get('tier');

        if (!org || !tier) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Verify that subscription was created
        const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('id, status')
            .eq('organization_id', org)
            .eq('tier', parseInt(tier))
            .single();

        if (subscription?.status === 'active') {
            // Redirect to organization dashboard with success
            return NextResponse.redirect(
                new URL(`/dashboard?screen=organization&subscriptionSuccess=true`, request.url)
            );
        }

        // Redirect to organization with error
        return NextResponse.redirect(
            new URL(`/dashboard?screen=organization&subscriptionError=true`, request.url)
        );

    } catch (error) {
        console.error('[FLUTTERWAVE] Subscription verification error:', error);
        return NextResponse.redirect(
            new URL(`/dashboard?screen=organization&subscriptionError=true`, request.url)
        );
    }
}
