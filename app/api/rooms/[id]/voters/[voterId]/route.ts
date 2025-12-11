import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Delete a voter from eligibility list
 * DELETE /api/rooms/[roomId]/voters/[voterId]
 */
export async function DELETE(
    request: Request,
    { params }: { params: { id: string; voterId: string } }
) {
    try {
        const { id: roomId, voterId } = params;

        // Delete voter from eligibility list
        const { error } = await supabaseAdmin
            .from('voter_eligibility')
            .delete()
            .eq('id', voterId)
            .eq('room_id', roomId);

        if (error) {
            console.error('[API] Error deleting voter:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`[API] Voter ${voterId} removed from room ${roomId}`);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[API] Error deleting voter:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
