import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { storeVerificationCode } from '@/lib/verificationStore';

/**
 * Send email verification code
 * POST /api/rooms/[roomId]/verify-email
 */
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id: roomId } = params;
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code using shared store
        storeVerificationCode(roomId, email, code);

        // TODO: Send email with code
        // For now, log to console for testing
        console.log(`[VERIFICATION] Code for ${email}: ${code}`);

        // In production, integrate with email service:
        // await sendEmail({
        //   to: email,
        //   subject: 'Your Verification Code',
        //   body: `Your code is: ${code}`
        // });

        return NextResponse.json({
            success: true,
            message: 'Verification code sent',
            // Remove this in production:
            testCode: process.env.NODE_ENV === 'development' ? code : undefined
        });

    } catch (error: any) {
        console.error('[API] Error sending verification code:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
