import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: organizationId } = await params;
        const userId = request.headers.get('x-user-id');

        if (!organizationId || !userId) {
            return NextResponse.json(
                { error: 'Missing required headers' },
                { status: 400 }
            );
        }

        // Verify user has access to this organization
        const { data: org, error: orgError } = await supabaseAdmin
            .from('organizations')
            .select('id, created_by, subscription_tier')
            .eq('id', organizationId)
            .single();

        if (orgError || !org) {
            return NextResponse.json(
                { error: 'Organization not found' },
                { status: 404 }
            );
        }

        // Check if user is org creator or member (can extend later)
        if (org.created_by !== userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Get subscription details if exists
        const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('organization_id', organizationId)
            .eq('status', 'active')
            .single();

        if (!subscription) {
            // Return default tier 1 (free tier)
            return NextResponse.json({
                tier: org.subscription_tier || 1,
                status: 'active',
                currentPeriodEnd: null,
                stripeSubscriptionId: null
            });
        }

        return NextResponse.json({
            tier: subscription.tier,
            status: subscription.status,
            currentPeriodEnd: subscription.current_period_end,
            stripeSubscriptionId: subscription.stripe_subscription_id,
            createdAt: subscription.created_at,
            updatedAt: subscription.updated_at
        });
    } catch (error: any) {
        console.error('[API] Error fetching subscription:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch subscription' },
            { status: 500 }
        );
    }
}
