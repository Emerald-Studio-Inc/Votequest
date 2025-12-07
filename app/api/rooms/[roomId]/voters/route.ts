import { NextResponse } from 'next/server';
import { bulkUploadVoters, addVoterToEligibilityList } from '@/lib/institutional';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Get voters for a room
 * GET /api/rooms/[roomId]/voters
 */
export async function GET(
    request: Request,
    { params }: { params: { roomId: string } }
) {
    try {
        const { roomId } = params;

        const { data: voters, error } = await supabaseAdmin
            .from('voter_eligibility')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('[API] Error fetching voters:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ voters: voters || [] });

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
    { params }: { params: { roomId: string } }
) {
    try {
        const { roomId } = params;
        const body = await request.json();
        const { voters, single } = body;

        // Check authorization (user must be org admin)
        // TODO: Add auth check

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
