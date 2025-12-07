import { NextResponse } from 'next/server';
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

        // Fetch all voters for this room
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
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
