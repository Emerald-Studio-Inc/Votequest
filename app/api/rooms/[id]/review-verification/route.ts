import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Review verification request (Approve/Reject)
 * POST /api/rooms/[roomId]/review-verification
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: roomId } = params;
        const { voterId, status, rejectionReason } = await request.json();

        if (!voterId || !['verified', 'rejected'].includes(status)) {
            return NextResponse.json(
                { error: 'Invalid status or missing voter ID' },
                { status: 400 }
            );
        }

        // 1. Verify admin permissions (skipped for MVP - assuming middleware/caller check)
        // In prod: Check if session user is admin of this room's org

        // 2. Update voter status
        const { error } = await supabaseAdmin
            .from('voter_eligibility')
            .update({
                verification_status: status,
                // rejection_reason: rejectionReason // Add column if needed later
                updated_at: new Date().toISOString()
            })
            .eq('id', voterId)
            .eq('room_id', roomId);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            message: `Voter ${status}`
        });

    } catch (error: any) {
        console.error('[API] Review verification error:', error);
        return NextResponse.json(
            { error: 'Review failed' },
            { status: 500 }
        );
    }
}
