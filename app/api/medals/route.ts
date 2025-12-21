import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { createCoinTransaction } from '@/lib/economy-security';

// GET: Fetch available medals or user's medal inventory
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const action = searchParams.get('action') || 'store';

        if (action === 'inventory' && userId) {
            // Get user's medal inventory
            const { data: inventory, error } = await supabaseAdmin
                .from('user_medals')
                .select(`
                    id,
                    quantity,
                    medal:medal_store(id, name, icon, tier)
                `)
                .eq('user_id', userId);

            if (error) throw error;
            return NextResponse.json({ inventory });
        }

        // Get medal store
        const { data: medals, error } = await supabaseAdmin
            .from('medal_store')
            .select('*')
            .eq('is_active', true)
            .order('price_vqc', { ascending: true });

        if (error) throw error;
        return NextResponse.json({ medals });

    } catch (error) {
        console.error('Medals API error:', error);
        return NextResponse.json({ error: 'Failed to fetch medals' }, { status: 500 });
    }
}

// POST: Purchase a medal or gift it to a participant
export async function POST(request: NextRequest) {
    try {
        const { userId, medalId, action, recipientId, debateId, message } = await request.json();

        if (!userId || !medalId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get medal info
        const { data: medal, error: medalError } = await supabaseAdmin
            .from('medal_store')
            .select('*')
            .eq('id', medalId)
            .single();

        if (medalError || !medal) {
            return NextResponse.json({ error: 'Medal not found' }, { status: 404 });
        }

        if (action === 'purchase') {
            // Deduct VQC and add to inventory
            const transaction = await createCoinTransaction({
                userId,
                amount: -medal.price_vqc,
                type: 'SPEND',
                reason: `MEDAL_PURCHASE: ${medal.name}`,
                referenceId: medalId,
                metadata: { medalName: medal.name, tier: medal.tier }
            });

            if (!transaction.success) {
                return NextResponse.json({ error: transaction.error }, { status: 400 });
            }

            // Add to inventory (upsert)
            const { error: invError } = await supabaseAdmin
                .from('user_medals')
                .upsert({
                    user_id: userId,
                    medal_id: medalId,
                    quantity: 1
                }, {
                    onConflict: 'user_id,medal_id'
                });

            if (invError) {
                console.error('Inventory error:', invError);
                // Note: Transaction already happened, but inventory failed
            }

            return NextResponse.json({
                success: true,
                receipt: transaction.receipt,
                newBalance: transaction.newBalance
            });
        }

        if (action === 'gift' && recipientId && debateId) {
            // Check if user has the medal in inventory
            const { data: inv } = await supabaseAdmin
                .from('user_medals')
                .select('quantity')
                .eq('user_id', userId)
                .eq('medal_id', medalId)
                .single();

            if (!inv || inv.quantity < 1) {
                return NextResponse.json({ error: 'Medal not in inventory' }, { status: 400 });
            }

            // Decrement inventory
            const newQty = inv.quantity - 1;
            if (newQty === 0) {
                await supabaseAdmin.from('user_medals').delete().eq('user_id', userId).eq('medal_id', medalId);
            } else {
                await supabaseAdmin.from('user_medals').update({ quantity: newQty }).eq('user_id', userId).eq('medal_id', medalId);
            }

            // Create gift record
            const { data: gift, error: giftError } = await supabaseAdmin
                .from('debate_gifts')
                .insert({
                    debate_id: debateId,
                    sender_id: userId,
                    recipient_id: recipientId,
                    medal_id: medalId,
                    message: message || null
                })
                .select()
                .single();

            if (giftError) {
                console.error('Gift error:', giftError);
                return NextResponse.json({ error: 'Failed to send gift' }, { status: 500 });
            }

            // Award VQC to recipient (gift = 50% of medal value)
            const rewardAmount = Math.floor(medal.price_vqc * 0.5);
            await createCoinTransaction({
                userId: recipientId,
                amount: rewardAmount,
                type: 'GIFT',
                reason: `MEDAL_RECEIVED: ${medal.name}`,
                referenceId: gift.id,
                metadata: { fromUserId: userId, medalName: medal.name }
            });

            return NextResponse.json({
                success: true,
                gift,
                recipientReward: rewardAmount
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        console.error('Medals POST error:', error);
        return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
    }
}
