import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { sendEmail } from '@/lib/email';

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

        // Get admin info from header
        const adminId = request.headers.get('x-user-id');
        if (!adminId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch verification record to check permission
        const { data: record, error: recordError } = await supabaseAdmin
            .from('voter_eligibility')
            .select('id, room_id, email, voting_rooms!inner(organizations!inner(user_id))')
            .eq('id', verificationId)
            .single();

        if (recordError || !record) {
            return NextResponse.json({ error: 'Record not found' }, { status: 404 });
        }

        // Verify ownership
        // @ts-ignore
        const ownerId = record.voting_rooms?.organizations?.user_id;
        if (ownerId !== adminId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update verification status
        const { error: updateError } = await supabaseAdmin
            .from('voter_eligibility')
            .update({
                verification_status: approved ? 'approved' : 'rejected',
                verified_by: adminId,
                verified_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', verificationId);

        if (updateError) throw updateError;

        // Send email notification to voter
        await sendEmail({
            to: record.email,
            subject: `VoteQuest Verification ${approved ? 'Approved' : 'Rejected'}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2>Verification Status Update</h2>
                    <p>Your voter verification request has been <strong>${approved ? 'APPROVED' : 'REJECTED'}</strong>.</p>
                    ${approved ? '<p>You may now access the voting chamber.</p>' : '<p>Please contact the organization administrator for more details.</p>'}
                </div>
            `,
            text: `Your verification status has been updated to: ${approved ? 'APPROVED' : 'REJECTED'}`
        });

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
