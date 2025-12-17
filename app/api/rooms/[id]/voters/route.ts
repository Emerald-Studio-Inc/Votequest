import { NextRequest, NextResponse } from 'next/server';
import { bulkUploadVoters, addVoterToEligibilityList } from '@/lib/institutional';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Get voters for a room
 * GET /api/rooms/[roomId]/voters
 */
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: roomId } = params;

        // Fetch room settings first to check for anonymity
        const { data: room } = await supabaseAdmin
            .from('voting_rooms')
            .select('allow_anonymous, anonymous_voting_enabled')
            .eq('id', roomId)
            .single();

        const isAnonymous = room?.allow_anonymous || room?.anonymous_voting_enabled;

        const { data: voters, error } = await supabaseAdmin
            .from('voter_eligibility')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[API] Error fetching voters:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // If anonymous, redact personal info
        const safeVoters = isAnonymous ? voters.map((v: any) => ({
            ...v,
            identifier: 'Anonymous Voter', // Hide email/ID
            metadata: {} // Clear metadata
        })) : voters;

        return NextResponse.json({ voters: safeVoters || [] });

    } catch (error: any) {
        console.error('[API] Error fetching voters:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Add voters to eligibility list
 * POST /api/rooms/[roomId]/voters
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: roomId } = params;
        const body = await request.json();
        const { voters, single } = body;

        // Check authorization
        const userId = request.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        const { data: room, error: roomError } = await supabaseAdmin
            .from('voting_rooms')
            .select('organization_id, organizations!inner(user_id)')
            .eq('id', roomId)
            .single();

        if (roomError || !room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        // Check if user owns the organization
        // @ts-ignore
        if (room.organizations?.user_id !== userId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (single) {
            // Add single voter
            const { identifier, identifierType, metadata } = body;

            if (!identifier || !identifierType) {
                return NextResponse.json(
                    { error: 'Missing identifier or identifierType' },
                    { status: 400 }
                );
            }

            const result = await addVoterToEligibilityList(
                roomId,
                identifier,
                identifierType,
                metadata
            );

            if (!result.success) {
                return NextResponse.json({ error: result.error }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                message: 'Voter added to eligibility list'
            });

        } else {
            // Bulk upload
            if (!Array.isArray(voters) || voters.length === 0) {
                return NextResponse.json(
                    { error: 'Voters array is required for bulk upload' },
                    { status: 400 }
                );
            }

            const result = await bulkUploadVoters(roomId, voters);

            return NextResponse.json({
                success: true,
                added: result.success,
                failed: result.failed,
                errors: result.errors
            });
        }

    } catch (error: any) {
        console.error('[API] Error adding voters:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
