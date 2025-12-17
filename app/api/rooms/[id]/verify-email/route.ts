import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { storeVerificationCode } from '@/lib/verificationStore';
import { sendEmail } from '@/lib/email';

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

        // Send email with code
        await sendEmail({
            to: email,
            subject: 'Your VoteQuest Verification Code',
            html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Verification Code</h2>
              <p>Your code is: <strong>${code}</strong></p>
              <p>This code will expire in 15 minutes.</p>
            </div>
          `,
            text: `Your verification code is: ${code}`
        });

        return NextResponse.json({
            success: true,
            message: 'Verification code sent'
        });

    } catch (error: any) {
        console.error('[API] Error sending verification code:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
