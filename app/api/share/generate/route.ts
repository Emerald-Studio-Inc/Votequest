import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { nanoid } from 'nanoid';

/**
 * Get base URL from request headers (auto-detects deployment URL)
 */
function getBaseUrl(request: Request): string {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';

    // For local development
    if (host?.includes('localhost')) {
        return `http://${host}`;
    }

    // For production (Netlify, Vercel, etc.)
    return `${protocol}://${host}`;
}

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

        // Verify proposal exists in database
        // Handle both UUID (database id) and blockchain_id (number)
        console.log('[DEBUG] Received proposalId:', proposalId, 'Type:', typeof proposalId);

        let proposalData;
        let proposalError;

        // Check if proposalId looks like a UUID (contains hyphens)
        const isUUID = proposalId.includes('-');

        if (isUUID) {
            // Query by database UUID
            console.log('[DEBUG] Querying by UUID:', proposalId);
            const result = await supabaseAdmin
                .from('proposals')
                .select('id, blockchain_id')
                .eq('id', proposalId)
                .single();

            proposalData = result.data;
            proposalError = result.error;
        } else {
            // Query by blockchain_id (number)
            console.log('[DEBUG] Querying by blockchain_id:', proposalId);
            const result = await supabaseAdmin
                .from('proposals')
                .select('id, blockchain_id')
                .eq('blockchain_id', parseInt(proposalId))
                .single();

            proposalData = result.data;
            proposalError = result.error;
        }

        console.log('[DEBUG] Proposal query result:', { proposalData, proposalError });

        if (proposalError || !proposalData) {
            console.error('[DEBUG] Proposal not found. Error:', proposalError);
            return NextResponse.json({
                error: 'Proposal not found in database',
                hint: 'This proposal may not exist or has been deleted.',
                debug: {
                    receivedId: proposalId,
                    isUUID: isUUID,
                    errorDetails: proposalError?.message
                }
            }, { status: 404 });
        }

        const { data: referral, error: referralError } = await supabaseAdmin
            .from('referrals')
            .insert({
                referrer_id: userId,
                proposal_id: proposalData.id, // Use database UUID
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
                proposal_id: proposalData.id, // Use database UUID
                user_id: userId,
                share_type: shareType || 'link',
                referral_code: referralCode
            });

        // Auto-detect base URL from request
        const baseUrl = getBaseUrl(request);
        // Use blockchain_id for URL if available, otherwise use database id
        const urlId = proposalData.blockchain_id ?? proposalData.id;
        const shareUrl = `${baseUrl}/proposal/${urlId}?ref=${referralCode}`;

        return NextResponse.json({
            success: true,
            shareUrl,
            referralCode,
            qrCodeUrl: `/api/share/qr?code=${referralCode}&proposalId=${urlId}`
        });

    } catch (error: any) {
        console.error('[API] Share generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
