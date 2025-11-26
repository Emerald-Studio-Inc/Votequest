import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { awardCoins, createNotification } from '@/lib/coins';

/**
 * Track conversion (new user voting via referral)
 * POST /api/share/track-conversion
 */
export async function POST(request: Request) {
    try {
        const { referralCode, newUserId } = await request.json();

        if (!referralCode || !newUserId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get referral record
        const { data: referral, error: referralError } = await supabaseAdmin
            .from('referrals')
            .select('*')
            .eq('referral_code', referralCode)
            .single();

        if (referralError || !referral) {
            console.error('[API] Referral not found:', referralCode);
            return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 });
        }

        // Check if already converted
        if (referral.converted) {
            return NextResponse.json({ error: 'Referral already used' }, { status: 400 });
        }

        // Update referral record
        await supabaseAdmin
            .from('referrals')
            .update({
                referred_id: newUserId,
                converted: true,
                converted_at: new Date().toISOString()
            })
            .eq('id', referral.id);

        // Increment conversion count in share_analytics
        await supabaseAdmin
            .from('share_analytics')
            .update({
                conversions: supabaseAdmin.sql`COALESCE(conversions, 0) + 1`
            })
            .eq('referral_code', referralCode);

        // Award 10 VQC welcome bonus to new user
        await awardCoins(newUserId, 10, 'welcome_bonus', referral.proposal_id, {
            referredBy: referral.referrer_id
        });

        // Award 5 VQC to referrer
        const referrerAwarded = await awardCoins(
            referral.referrer_id,
            5,
            'referral_bonus',
            referral.proposal_id,
            {
                referredUser: newUserId
            }
        );

        if (referrerAwarded) {
            // Update daily stats
            await supabaseAdmin.rpc('increment_daily_referral', {
                p_user_id: referral.referrer_id,
                p_coins: 5
            });

            // Mark reward as awarded
            await supabaseAdmin
                .from('referrals')
                .update({ reward_awarded: true })
                .eq('id', referral.id);

            // Notify referrer
            await createNotification(
                referral.referrer_id,
                'referral_success',
                'Someone voted via your referral!',
                'You earned 5 VQC for referring a new voter',
                referral.proposal_id,
                { coins: 5 }
            );
        }

        return NextResponse.json({
            success: true,
            welcomeBonus: 10,
            referrerReward: 5
        });

    } catch (error: any) {
        console.error('[API] Track conversion error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
