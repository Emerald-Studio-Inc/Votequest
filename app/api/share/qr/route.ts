import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

/**
 * Generate QR code for proposal sharing
 * GET /api/share/qr?code=ABC123&proposalId=uuid
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');
        const proposalId = searchParams.get('proposalId');

        if (!code || !proposalId) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Generate share URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const shareUrl = `${baseUrl}/proposal/${proposalId}?ref=${code}`;

        // Generate QR code as Data URL
        const qrDataUrl = await QRCode.toDataURL(shareUrl, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 1,
            margin: 2,
            width: 512,
            color: {
                dark: '#FFFFFF',  // White QR code
                light: '#000000'  //  Black background
            }
        });

        // Convert data URL to buffer
        const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');

        // Return as PNG image
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (error: any) {
        console.error('[API] QR generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
