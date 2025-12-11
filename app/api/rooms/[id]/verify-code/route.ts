import { NextResponse } from 'next/server';

// Same in-memory store as verify-email (production: use Redis)
const verificationCodes = new Map<string, { code: string; expiry: number }>();

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

        const key = `${roomId}:${email.toLowerCase()}`;
        const stored = verificationCodes.get(key);

        if (!stored) {
            return NextResponse.json(
                { error: 'No code found. Please request a new one.' },
                { status: 400 }
            );
        }

        if (Date.now() > stored.expiry) {
            verificationCodes.delete(key);
            return NextResponse.json(
                { error: 'Code expired. Please request a new one.' },
                { status: 400 }
            );
        }

        if (stored.code !== code) {
            return NextResponse.json(
                { error: 'Invalid code' },
                { status: 400 }
            );
        }

        // Code is valid!
        verificationCodes.delete(key);

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
