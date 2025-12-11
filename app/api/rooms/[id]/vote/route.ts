import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Submit vote to room
 * POST /api/rooms/[roomId]/vote
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: roomId } = params;
        const { email, optionIds, votes: rawVotes, verificationCode } = await request.json();

        // Normalize input: Support both simple optionIds (standard) and weighted votes (QV)
        let votePayload: { optionId: string; count: number }[] = [];

        if (rawVotes && Array.isArray(rawVotes)) {
            votePayload = rawVotes;
        } else if (optionIds && Array.isArray(optionIds)) {
            votePayload = optionIds.map((id: string) => ({ optionId: id, count: 1 }));
        }

        if (!email || votePayload.length === 0) {
            return NextResponse.json(
                { error: 'Email and at least one vote option required' },
                { status: 400 }
            );
        }

        // 1. Verify room exists and is active
        const { data: room, error: roomError } = await supabaseAdmin
            .from('voting_rooms')
            .select('*')
            .eq('id', roomId)
            .single();

        if (roomError || !room) {
            return NextResponse.json(
                { error: 'Room not found' },
                { status: 404 }
            );
        }

        if (room.status !== 'active') {
            return NextResponse.json(
                { error: 'Voting is not currently open for this room' },
                { status: 400 }
            );
        }

        // QV LOGIC: Calculate Cost
        const strategy = room.voting_strategy || 'standard';
        let totalCost = 0;
        let totalPower = 0;

        // Validate counts based on strategy
        for (const v of votePayload) {
            if (v.count < 1) continue;

            if (strategy === 'standard' && v.count > 1) {
                return NextResponse.json({ error: 'Standard voting only allows 1 vote per option' }, { status: 400 });
            }

            if (strategy === 'quadratic') {
                totalCost += (v.count * v.count);
            }
            totalPower += v.count;
        }

        // 2. Lookup User ID (Needed for Coins & Recording)
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id, coins')
            .eq('email', email.toLowerCase())
            .single();

        if (!user) {
            return NextResponse.json(
                { error: 'User account not found for this email. Please register first to spend coins.' },
                { status: 404 }
            );
        }

        // 3. Deduct Coins (If QV)
        if (strategy === 'quadratic' && totalCost > 0) {
            const { spendCoins } = await import('@/lib/coins');
            const success = await spendCoins(user.id, totalCost, 'quadratic_room_vote', roomId, {
                totalPower
            });

            if (!success) {
                return NextResponse.json({
                    error: 'Insufficient Voting Power (Coins)',
                    details: `You need ${totalCost} VQC to cast these votes. Your Balance: ${user.coins || 0}`
                }, { status: 402 });
            }
        }

        // 4. Check Eligibility (Tier 2/3)
        let eligibilityId = null;
        if (room.verification_tier !== 'tier1') {
            const { data: eligible } = await supabaseAdmin
                .from('voter_eligibility')
                .select('*')
                .eq('room_id', roomId)
                .eq('identifier', email.toLowerCase())
                .single();

            if (!eligible) {
                return NextResponse.json(
                    { error: 'You are not eligible to vote in this room' },
                    { status: 403 }
                );
            }

            if (eligible.has_voted) {
                return NextResponse.json(
                    { error: 'You have already voted in this room' },
                    { status: 400 }
                );
            }
            eligibilityId = eligible.id;
        } else {
            // Tier 1 Check
            const { data: existingVote } = await supabaseAdmin
                .from('room_votes')
                .select('id')
                .eq('room_id', roomId)
                .eq('user_id', user.id)
                .single();

            if (existingVote) {
                return NextResponse.json({ error: 'You have already voted in this room' }, { status: 400 });
            }
        }

        // 5. Record votes
        const isAnonymous = room.allow_anonymous || room.anonymous_voting_enabled;

        const votesToInsert = votePayload.map(v => ({
            room_id: roomId,
            option_id: v.optionId,
            user_id: user.id,
            eligibility_id: eligibilityId,
            voting_power: v.count,
            coin_cost: strategy === 'quadratic' ? (v.count * v.count) : 0,
            metadata: isAnonymous ? { anonymous: true } : {}
        }));

        const { error: voteError } = await supabaseAdmin
            .from('room_votes')
            .insert(votesToInsert);

        if (voteError) {
            console.error('[API] Error recording votes:', voteError);
            if (voteError.code === '23505') return NextResponse.json({ error: 'Duplicate vote detected' }, { status: 400 });
            return NextResponse.json({
                error: `Failed to record vote: ${voteError.message} (Code: ${voteError.code})`
            }, { status: 500 });
        }

        // 6. Update Stats (Weighted)
        for (const v of votePayload) {
            await supabaseAdmin.rpc('increment_room_option_votes_weighted', {
                option_id: v.optionId,
                amount: v.count
            });
        }

        // Mark eligibility as used
        if (room.verification_tier !== 'tier1') {
            await supabaseAdmin
                .from('voter_eligibility')
                .update({ has_voted: true, voted_at: new Date().toISOString() })
                .eq('room_id', roomId)
                .eq('identifier', email.toLowerCase());
        }

        // Reward User (Optional - flat 5 coins for participating)
        // Only if they actually spent coins or legit vote
        try {
            const { awardCoins } = await import('@/lib/coins');
            await awardCoins(user.id, 5, 'room_vote_participation', roomId);
        } catch (e) { }

        return NextResponse.json({
            success: true,
            message: 'Vote submitted successfully',
            cost: totalCost,
            power: totalPower
        });

    } catch (error: any) {
        console.error('[API] Error submitting vote:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
