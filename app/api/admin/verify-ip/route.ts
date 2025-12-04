import { NextResponse } from 'next/server';

/**
 * Verify admin access by IP address
 * GET /api/admin/verify-ip
 */
export async function GET(request: Request) {
    try {
        // Get client IP from headers
        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const clientIp = forwarded?.split(',')[0] || realIp || 'unknown';

        // Get whitelisted IPs from env (comma-separated)
        const whitelist = process.env.ADMIN_IP_WHITELIST?.split(',').map(ip => ip.trim()) || [];

        // If no whitelist configured, allow all (for development)
        if (whitelist.length === 0 || whitelist[0] === '') {
            return NextResponse.json({
                allowed: true,
                clientIp,
                message: 'No IP whitelist configured - allowing all IPs'
            });
        }

        // Check if client IP is in whitelist
        const allowed = whitelist.includes(clientIp);

        return NextResponse.json({
            allowed,
            clientIp,
            message: allowed ? 'IP authorized' : 'IP not authorized'
        });

    } catch (error: any) {
        console.error('[ADMIN] IP verification error:', error);
        return NextResponse.json({
            allowed: false,
            error: error.message
        }, { status: 500 });
    }
}
