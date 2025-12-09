import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createNotification } from '@/lib/coins';

// NOTE: In a real production app, this should check for an admin session cookie or token.
// For now, we rely on the fact that the Admin Dashboard is hidden behind the secure passphrase.

export async function POST(request: Request) {
    try {
        const { userId, amount, reason } = await request.json();

        if (!userId || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Get current balance
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('coins')
            .eq('id', userId)
            .single();

        if (fetchError || !user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Perform adjustment
        const newBalance = (user.coins || 0) + amount;

        // Prevent negative balance
        if (newBalance < 0) {
            return NextResponse.json({ error: 'Insufficient funds for debit' }, { status: 400 });
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({ coins: newBalance })
            .eq('id', userId);

        if (updateError) throw updateError;

        // 3. Create Receipt (Transaction Record)
        const { error: receiptError } = await supabase
            .from('coin_transactions')
            .insert({
                user_id: userId,
                amount: amount,
                reason: reason || 'admin_adjustment',
                receipt_hash: `ADMIN-${Date.now()}-${Math.random().toString(36).substring(7)}`
            });

        if (receiptError) console.error('Error creating receipt:', receiptError);

        // 4. Notify User
        await createNotification(
            userId,
            'coins_received',
            `Admin Adjustment: ${amount > 0 ? '+' : ''}${amount} VQC`,
            `Your balance has been adjusted by an administrator. Reason: ${reason || 'Support Action'}`
        );

        return NextResponse.json({ success: true, newBalance });

    } catch (error: any) {
        console.error('Adjustment error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
