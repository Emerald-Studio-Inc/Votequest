import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address');
        const userId = searchParams.get('userId');

        if (!address && !userId) {
            return NextResponse.json({ error: 'Missing wallet address or user ID' }, { status: 400 });
        }

        let targetUserId = userId;

        // If only address provided, look up user ID
        if (!targetUserId && address) {
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('wallet_address', address.toLowerCase())
                .single();

            if (!user) {
                return NextResponse.json([]);
            }
            targetUserId = user.id;
        }

        // Get notifications
        const { data: notifications, error } = await supabaseAdmin
            .from('notifications')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching notifications:', error);
            // DEBUG: Return exact error to client
            return NextResponse.json({ error: `Database error: ${error.message}`, details: error }, { status: 500 });
        }

        return NextResponse.json(notifications || []);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
