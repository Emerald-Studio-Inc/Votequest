import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Approve or reject voter verification
 * POST /api/admin/verify-voter/[id]
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { approved } = await request.json();
        const verificationId = params.id;

        if (typeof approved !== 'boolean') {
            return NextResponse.json(
                { error: 'Approval status required' },
                { status: 400 }
            );
        }

        // Get admin info (in production: get from session)
        const adminId = 'admin-user-id'; // TODO: Get from authenticated session

        // Update verification status
        const { data, error } = await supabaseAdmin
            .from('voter_eligibility')
            .update({
                verification_status: approved ? 'approved' : 'rejected',
                verified_by: adminId,
                verified_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', verificationId)
            .select('email, room_id')
            .single();

        if (error) throw error;

        // TODO: Send email notification to voter
        // if (approved) {
        //   await sendEmail(data.email, 'Verification Approved', '...');
        // } else {
        //   await sendEmail(data.email, 'Verification Rejected', '...');
        // }

        return NextResponse.json({
            success: true,
            message: approved ? 'Verification approved' : 'Verification rejected'
        });

    } catch (error: any) {
        console.error('[ADMIN] Verify voter error:', error);
        return NextResponse.json(
            { error: 'Failed to process verification' },
            { status: 500 }
        );
    }
}
