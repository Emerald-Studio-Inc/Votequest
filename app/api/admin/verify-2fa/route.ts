import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';

/**
 * Verify 2FA TOTP code
 * POST /api/admin/verify-2fa
 */
export async function POST(request: Request) {
    try {
        const { code } = await request.json();

        if (!code || typeof code !== 'string') {
            return NextResponse.json({
                valid: false,
                error: 'Invalid code format'
            }, { status: 400 });
        }

        // Get 2FA secret from environment
        const secret = process.env.ADMIN_2FA_SECRET;

        if (!secret) {
            console.error('[2FA] ADMIN_2FA_SECRET not configured');
            return NextResponse.json({
                valid: false,
                error: '2FA not configured'
            }, { status: 500 });
        }

        // Verify the token with time window tolerance
        const verified = speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: code.replace(/\s/g, ''), // Remove spaces
            window: 1 // Allow ±30 seconds clock drift
        });

        return NextResponse.json({
            valid: verified
        });

    } catch (error: any) {
        console.error('[2FA] Verification error:', error);
        return NextResponse.json({
            valid: false,
            error: error.message
        }, { status: 500 });
    }
}
