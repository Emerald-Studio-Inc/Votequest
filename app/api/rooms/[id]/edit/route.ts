import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const roomId = params.id;
        const body = await request.json();
        const { title, description } = body;
        const userId = request.headers.get('x-user-id');

        // Verify Authentication
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify Ownership
        const { data: room, error: roomError } = await supabaseAdmin
            .from('voting_rooms')
            .select('*')
            .eq('id', roomId)
            .single();

        if (roomError || !room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        // Only allow room creator or org owner to edit
        if (room.created_by !== userId) {
            return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
        }

        // Perform Update
        const { error: updateError } = await supabaseAdmin
            .from('voting_rooms')
            .update({
                title,
                description,
                updated_at: new Date().toISOString()
            })
            .eq('id', roomId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('[API] Error updating room:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
