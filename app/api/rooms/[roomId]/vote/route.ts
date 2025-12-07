import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Submit vote to room
 * POST /api/rooms/[roomId]/vote
 */
export async function POST(
    request: Request,
    { params }: { params: { roomId: string } }
) {
    try {
        const { roomId } = params;
        const { email, optionIds, verificationCode } = await request.json();

        if (!email || !optionIds || optionIds.length === 0) {
            return NextResponse.json(
                { error: 'Email and at least one option required' },
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

        // 2. Check if voter is eligible (tier 2/3 only)
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

            // Check if already voted
            if (eligible.has_voted) {
                return NextResponse.json(
                    { error: 'You have already voted in this room' },
                    { status: 400 }
                );
            }
        }

        // 3. Check for duplicate votes (tier 1 - email only)
        if (room.verification_tier === 'tier1') {
            const { data: existingVote } = await supabaseAdmin
                .from('institutional_votes')
                .select('id')
                .eq('room_id', roomId)
                .eq('voter_identifier', email.toLowerCase())
                .single();

            if (existingVote) {
                return NextResponse.json(
                    { error: 'You have already voted in this room' },
                    { status: 400 }
                );
            }
        }

        // 4. Record votes
        const votes = optionIds.map((optionId: string) => ({
            room_id: roomId,
            option_id: optionId,
            voter_identifier: room.allow_anonymous ? null : email.toLowerCase(),
            verification_tier: room.verification_tier
        }));

        const { error: voteError } = await supabaseAdmin
            .from('institutional_votes')
            .insert(votes);

        if (voteError) {
            console.error('[API] Error recording votes:', voteError);
            return NextResponse.json(
                { error: 'Failed to record vote' },
                { status: 500 }
            );
        }

        // 5. Mark as voted in eligibility list (tier 2/3)
        if (room.verification_tier !== 'tier1') {
            await supabaseAdmin
                .from('voter_eligibility')
                .update({ has_voted: true, voted_at: new Date().toISOString() })
                .eq('room_id', roomId)
                .eq('identifier', email.toLowerCase());
        }

        console.log(`[API] Vote recorded for room ${roomId} by ${email}`);

        return NextResponse.json({
            success: true,
            message: 'Vote submitted successfully'
        });

    } catch (error: any) {
        console.error('[API] Error submitting vote:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
