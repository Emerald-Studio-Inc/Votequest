import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const address = searchParams.get('address');
        const userId = searchParams.get('userId');

        if (!address && !userId) {
            return NextResponse.json({ error: 'Address or User ID required' }, { status: 400 });
        }

        let targetUserId = userId;

        if (!targetUserId && address) {
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('wallet_address', address)
                .single();

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }
            targetUserId = user.id;
        }

        // Mark all notifications as read for this user
        const { error } = await supabaseAdmin
            .from('notifications')
            .update({ read: true })
            .eq('user_id', targetUserId)
            .eq('read', false);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark notifications as read' },
            { status: 500 }
        );
    }
}
