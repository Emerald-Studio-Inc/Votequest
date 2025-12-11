import { NextResponse } from 'next/server';
import { validateVerificationCode } from '@/lib/verificationStore';

/**
 * Verify email code
 * POST /api/rooms/[roomId]/verify-code
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: roomId } = params;
        const { email, code } = await request.json();

        if (!email || !code) {
            return NextResponse.json(
                { error: 'Email and code required' },
                { status: 400 }
            );
        }

        const result = validateVerificationCode(roomId, email, code);

        if (!result.success) {
            return NextResponse.json(
                { error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            verified: true
        });

    } catch (error: any) {
        console.error('[API] Error verifying code:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
