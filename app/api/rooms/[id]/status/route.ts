import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Update room status
 * PATCH /api/rooms/[roomId]/status
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: roomId } = params;
        const body = await request.json();
        const { status } = body;

        // Validation
        const validStatuses = ['draft', 'active', 'closed', 'archived'];
        if (!validStatuses.includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status. Must be: draft, active, closed, or archived' },
                { status: 400 }
            );
        }

        // Update room status
        const { data, error } = await supabaseAdmin
            .from('voting_rooms')
            .update({
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', roomId)
            .select()
            .single();

        if (error) {
            console.error('[API] Error updating room status:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        console.log(`[API] Room ${roomId} status updated to: ${status}`);

        return NextResponse.json({
            success: true,
            room: data
        });

    } catch (error: any) {
        console.error('[API] Error updating room status:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
