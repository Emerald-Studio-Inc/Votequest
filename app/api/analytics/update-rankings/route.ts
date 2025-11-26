import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * API endpoint to update global user rankings
 * Should be called periodically or after significant activity
 */
export async function POST(request: Request) {
    try {
        // Call the database function to update rankings
        const { error } = await supabaseAdmin.rpc('update_global_rankings');

        if (error) {
            console.error('Error updating rankings:', error);
            return NextResponse.json({ error: 'Failed to update rankings' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Rankings updated successfully'
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Allow GET request to trigger manually
export async function GET(request: Request) {
    return POST(request);
}
