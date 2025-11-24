import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address');

        if (!address) {
            return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
        }

        // Get user ID from wallet address
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('wallet_address', address.toLowerCase())
            .single();

        if (!user) {
            return NextResponse.json([]);
        }

        // Get notifications
        const { data: notifications, error } = await supabaseAdmin
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error fetching notifications:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json(notifications || []);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
