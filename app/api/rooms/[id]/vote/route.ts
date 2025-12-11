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

        // 3. Lookup User ID from Email (since room_votes requires user_id)
        // We assume the email corresponds to a registered user for now.
        // If not, we might need to handle 'guest' votes, but schema requires user_id.
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (!user) {
            return NextResponse.json(
                { error: 'User account not found for this email. Please register first.' },
                { status: 404 }
            );
        }

        // 4. Check for duplicate votes (tier 1 - email only)
        // Note: unique constraint on room_votes(room_id, user_id) handles this, but nice to check early
        if (room.verification_tier === 'tier1') {
            const { data: existingVote } = await supabaseAdmin
                .from('room_votes')
                .select('id')
                .eq('room_id', roomId)
                .eq('user_id', user.id)
                .single();

            if (existingVote) {
                return NextResponse.json(
                    { error: 'You have already voted in this room' },
                    { status: 400 }
                );
            }
        }

        // 5. Determine Eligibility ID (needed for weighted voting)
        let eligibilityId = null;
        if (room.verification_tier !== 'tier1') {
            const { data: eligible } = await supabaseAdmin
                .from('voter_eligibility')
                .select('id')
                .eq('room_id', roomId)
                .eq('identifier', email.toLowerCase())
                .single();
            if (eligible) eligibilityId = eligible.id;
        }

        // 6. Record votes
        // Use 'room_votes' table.
        // Handle anonymous: If 'allow_anonymous' OR 'anonymous_voting_enabled' is true.
        const isAnonymous = room.allow_anonymous || room.anonymous_voting_enabled;

        const votes = optionIds.map((optionId: string) => ({
            room_id: roomId,
            option_id: optionId,
            user_id: user.id, // REQUIRED by schema
            eligibility_id: eligibilityId,
            // We can store metadata if we want to track 'claimed' anonymity, usually IP/UserAgent is stored
            metadata: isAnonymous ? { anonymous: true } : {}
        }));

        const { error: voteError } = await supabaseAdmin
            .from('room_votes')
            .insert(votes);

        if (voteError) {
            console.error('[API] Error recording votes:', voteError);
            if (voteError.code === '23505') { // Unique violation
                return NextResponse.json({ error: 'You have already voted in this room' }, { status: 400 });
            }
            return NextResponse.json(
                { error: 'Failed to record vote' },
                { status: 500 }
            );
        }

        // 7. Mark as voted in eligibility list (tier 2/3)
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
