import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { nanoid } from 'nanoid';

/**
 * Generate a shareable link with referral tracking
 * POST /api/share/generate
 */
export async function POST(request: Request) {
    try {
        const { userId, proposalId, shareType } = await request.json();

        if (!userId || !proposalId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate unique referral code (8 characters)
        const referralCode = nanoid(8);

        // Check daily limit
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('level')
            .eq('id', userId)
            .single();

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user can refer more people today
        const { data: canRefer } = await supabaseAdmin
            .rpc('can_refer_today', { p_user_id: userId });

        if (!canRefer) {
            const dailyLimit = 10 + (user.level * 5);
            return NextResponse.json({
                error: 'Daily referral limit reached',
                limit: dailyLimit,
                message: `You've reached your daily limit of ${dailyLimit} referrals. Come back tomorrow!`
            }, { status: 429 });
        }

        // Create referral record
        const { data: referral, error: referralError } = await supabaseAdmin
            .from('referrals')
            .insert({
                referrer_id: userId,
                proposal_id: proposalId,
                referral_code: referralCode
            })
            .select()
            .single();

        if (referralError) {
            console.error('[API] Error creating referral:', referralError);
            return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
        }

        // Create share analytics record
        await supabaseAdmin
            .from('share_analytics')
            .insert({
                proposal_id: proposalId,
                user_id: userId,
                share_type: shareType || 'link',
                referral_code: referralCode
            });

        // Generate shareable URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const shareUrl = `${baseUrl}/proposal/${proposalId}?ref=${referralCode}`;

        return NextResponse.json({
            success: true,
            shareUrl,
            referralCode,
            qrCodeUrl: `/api/share/qr?code=${referralCode}&proposalId=${proposalId}`
        });

    } catch (error: any) {
        console.error('[API] Share generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
