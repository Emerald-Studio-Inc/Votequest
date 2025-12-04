import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Health Check Endpoint
 * Returns application health status for monitoring systems
 * GET /api/health
 */
export async function GET() {
    try {
        const startTime = Date.now();

        // Test database connection with a simple query
        const { data, error } = await supabaseAdmin
            .from('users')
            .select('id')
            .limit(1);

        const dbLatency = Date.now() - startTime;

        if (error) {
            return NextResponse.json({
                status: 'unhealthy',
                timestamp: new Date().toISOString(),
                checks: {
                    database: {
                        status: 'failed',
                        error: error.message,
                        latency: dbLatency
                    }
                },
                version: process.env.npm_package_version || '1.0.0'
            }, { status: 503 });
        }

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: {
                    status: 'connected',
                    latency: dbLatency
                }
            },
            version: process.env.npm_package_version || '1.0.0',
            uptime: process.uptime ? Math.floor(process.uptime()) : null
        });

    } catch (error) {
        return NextResponse.json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            checks: {
                database: {
                    status: 'error',
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            },
            version: process.env.npm_package_version || '1.0.0'
        }, { status: 503 });
    }
}
