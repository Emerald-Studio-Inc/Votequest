import { NextResponse } from 'next/server';
import QRCode from 'qrcode';

/**
 * Get base URL from request headers (auto-detects deployment URL)
 */
function getBaseUrl(request: Request): string {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';

    // For local development
    if (host?.includes('localhost')) {
        return `http://${host}`;
    }

    // For production (Netlify, Vercel, etc.)
    return `${protocol}://${host}`;
}

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

        // Auto-detect base URL from request
        const baseUrl = getBaseUrl(request);
        const shareUrl = `${baseUrl}/proposal/${proposalId}?ref=${code}`;

        // Generate QR code as buffer
        const qrBuffer = await QRCode.toBuffer(shareUrl, {
            errorCorrectionLevel: 'H',
            width: 300,
            margin: 2,
            type: 'png'
        });

        // Return as PNG image with proper Uint8Array conversion
        return new NextResponse(new Uint8Array(qrBuffer), {
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
