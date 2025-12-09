import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * Generate 2FA setup QR code and secret
 * POST /api/admin/setup-2fa
 */
export async function POST(request: Request) {
    try {
        const { passphrase } = await request.json();

        // Verify passphrase before showing 2FA setup
        const correctPassphrase = process.env.ADMIN_PASSPHRASE;
        if (!correctPassphrase || passphrase !== correctPassphrase) {
            return NextResponse.json({
                error: 'Invalid passphrase'
            }, { status: 401 });
        }

        // Get or generate secret
        let secret = process.env.ADMIN_2FA_SECRET;

        if (!secret) {
            // Generate a new secret if not configured
            const generatedSecret = speakeasy.generateSecret({
                name: 'VoteQuest Admin',
                issuer: 'VoteQuest'
            });
            secret = generatedSecret.base32;

            console.warn('[2FA] No ADMIN_2FA_SECRET found. Generated new secret:', secret);
            console.warn('[2FA] Add this to your environment variables: ADMIN_2FA_SECRET=' + secret);
        }

        // Generate QR code URL
        const otpauthUrl = speakeasy.otpauthURL({
            secret: secret,
            label: 'VoteQuest Admin',
            issuer: 'VoteQuest',
            encoding: 'base32'
        });

        // Generate QR code as base64 image
        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);

        return NextResponse.json({
            qrCode: qrCodeDataUrl,
            secret: secret,
            manual: secret // For manual entry in authenticator apps
        });

    } catch (error: any) {
        console.error('[2FA] Setup error:', error);
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
