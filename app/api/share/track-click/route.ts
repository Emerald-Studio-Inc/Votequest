import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Track click on shared link
 * POST /api/share/track-click
 */
export async function POST(request: Request) {
    try {
        const { referralCode } = await request.json();

        if (!referralCode) {
            return NextResponse.json({ error: 'Missing referral code' }, { status: 400 });
        }

        // Increment click count in share_analytics
        await supabaseAdmin
            .from('share_analytics')
            .update({
                clicks: supabaseAdmin.sql`COALESCE(clicks, 0) + 1`,
                last_clicked_at: new Date().toISOString()
            })
            .eq('referral_code', referralCode);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[API] Track click error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
