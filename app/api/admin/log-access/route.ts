import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Log admin access attempt
 * POST /api/admin/log-access
 */
export async function POST(request: Request) {
    try {
        const { granted, passphrase_attempts } = await request.json();

        // Get client info
        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const clientIp = forwarded?.split(',')[0] || realIp || 'unknown';
        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Log to database
        const { data, error } = await supabaseAdmin
            .from('admin_access_log')
            .insert({
                ip_address: clientIp,
                user_agent: userAgent,
                access_granted: granted,
                passphrase_attempts: passphrase_attempts || 1
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({
            success: true,
            logId: data.id
        });

    } catch (error: any) {
        console.error('[ADMIN] Access logging error:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
