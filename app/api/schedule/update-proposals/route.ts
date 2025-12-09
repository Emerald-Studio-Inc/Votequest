import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { createNotification } from '@/lib/coins';

// Lightweight scheduler check triggered by client interactions
export async function POST(request: Request) {
    try {
        // Secure this endpoint
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Allow in development without secret for testing, or require secret in production
        const isDev = process.env.NODE_ENV === 'development';
        const isAuthorized = (authHeader === `Bearer ${cronSecret}`) || (isDev && !cronSecret);

        if (!isAuthorized) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        // Optional: Add a simple secret or just rely on rate limiting/low impact
        // const secret = searchParams.get('key');

        console.log('[SCHEDULER] Checking for ended proposals and rooms...');

        // 1. Process Ended Proposals
        const { data: endedProposals, error: proposalError } = await supabaseAdmin
            .from('proposals')
            .select('id, title')
            .eq('status', 'active')
            .lt('end_date', new Date().toISOString());

        if (proposalError) throw proposalError;

        if (endedProposals && endedProposals.length > 0) {
            console.log(`[SCHEDULER] Found ${endedProposals.length} ended proposals.`);

            for (const proposal of endedProposals) {
                // Update status to 'ended'
                await supabaseAdmin
                    .from('proposals')
                    .update({ status: 'ended' })
                    .eq('id', proposal.id);

                // Find all unique voters
                const { data: voters } = await supabaseAdmin
                    .from('votes')
                    .select('user_id')
                    .eq('proposal_id', proposal.id);

                // Deduplicate voters
                const uniqueVoters = [...new Set((voters || []).map((v: any) => v.user_id))];

                console.log(`[SCHEDULER] Notifying ${uniqueVoters.length} voters for proposal "${proposal.title}"`);

                // Send notifications
                for (const userId of uniqueVoters) {
                    if (userId) {
                        await createNotification(
                            userId as string,
                            'proposal_ended',
                            'Proposal Ended',
                            `The proposal "${proposal.title}" has ended. Check the results!`,
                            proposal.id as string,
                            { type: 'proposal', id: proposal.id }
                        );
                    }
                }
            }
        }

        // 2. Process Ended Rooms
        const { data: endedRooms, error: roomError } = await supabaseAdmin
            .from('voting_rooms')
            .select('id, title')
            .eq('status', 'active')
            .eq('is_public', true) // Only notify public or accessible rooms to avoid leaks? Or just all.
            .lt('end_time', new Date().toISOString());

        if (roomError) throw roomError;

        if (endedRooms && endedRooms.length > 0) {
            console.log(`[SCHEDULER] Found ${endedRooms.length} ended rooms.`);

            for (const room of endedRooms) {
                // Update status to 'closed'
                await supabaseAdmin
                    .from('voting_rooms')
                    .update({ status: 'closed' })
                    .eq('id', room.id);

                // Find all unique voters in this room
                const { data: roomVoters } = await supabaseAdmin
                    .from('room_votes')
                    .select('user_id')
                    .eq('room_id', room.id);

                const uniqueRoomVoters = [...new Set((roomVoters || []).map((v: any) => v.user_id))];

                console.log(`[SCHEDULER] Notifying ${uniqueRoomVoters.length} voters for room "${room.title}"`);

                for (const userId of uniqueRoomVoters) {
                    if (userId) {
                        await createNotification(
                            userId as string,
                            'room_ended',
                            'Voting Room Closed',
                            `The voting room "${room.title}" has closed. See final results.`,
                            room.id as string,
                            { type: 'room', id: room.id }
                        );
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            proposalsProcessed: endedProposals?.length || 0,
            roomsProcessed: endedRooms?.length || 0
        });

    } catch (error: any) {
        console.error('[SCHEDULER] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
