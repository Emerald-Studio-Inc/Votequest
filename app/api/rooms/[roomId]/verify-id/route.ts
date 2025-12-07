import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Verify student/employee ID against eligibility list
 * POST /api/rooms/[roomId]/verify-id
 */
export async function POST(
    request: Request,
    { params }: { params: { roomId: string } }
) {
    try {
        const { email, identifier } = await request.json();
        const { roomId } = params;

        if (!email || !identifier) {
            return NextResponse.json(
                { error: 'Email and ID required' },
                { status: 400 }
            );
        }

        // Check if voter is eligible with this ID
        const { data: eligibility, error: eligibilityError } = await supabaseAdmin
            .from('voter_eligibility')
            .select('*')
            .eq('room_id', roomId)
            .eq('email', email.toLowerCase())
            .eq('identifier', identifier)
            .single();

        if (eligibilityError || !eligibility) {
            return NextResponse.json(
                { error: 'ID not found in eligibility list. Please check your ID and try again.' },
                { status: 403 }
            );
        }

        // Check if already voted
        if (eligibility.has_voted) {
            return NextResponse.json(
                { error: 'You have already voted in this election' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'ID verified successfully'
        });

    } catch (error: any) {
        console.error('[API] Verify ID error:', error);
        return NextResponse.json(
            { error: 'ID verification failed' },
            { status: 500 }
        );
    }
}
