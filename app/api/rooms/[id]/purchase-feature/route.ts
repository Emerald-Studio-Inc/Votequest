import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { rateLimit } from '@/lib/rate-limit';

// Feature costs mapping
const FEATURE_COSTS = {
    extra_voters: 1,
    extend_room: 5,
    audit_trail: 3,
    ranked_choice_voting: 2,
    anonymous_voting: 2,
    weighted_voting: 2,
    custom_branding: 1,
    qr_code: 1,
    instant_tabulation: 2,
    extended_window: 1
};

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const roomId = params.id;
        const ip = request.headers.get('x-forwarded-for') || 'unknown';

        // Rate limiting
        if (!rateLimit(ip, 20, 60000)) {
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const { featureType, cost } = body;
        const userId = request.headers.get('x-user-id');

        // Validate inputs
        if (!roomId || !featureType || !userId) {
            return NextResponse.json({
                error: 'Missing required fields'
            }, { status: 400 });
        }

        // Verify feature type
        if (!FEATURE_COSTS[featureType as keyof typeof FEATURE_COSTS]) {
            return NextResponse.json({
                error: 'Invalid feature type'
            }, { status: 400 });
        }

        // Verify cost
        const expectedCost = FEATURE_COSTS[featureType as keyof typeof FEATURE_COSTS];
        if (cost !== expectedCost) {
            return NextResponse.json({
                error: 'Invalid cost provided'
            }, { status: 400 });
        }

        // Verify user owns the room
        const { data: room, error: roomError } = await supabaseAdmin
            .from('voting_rooms')
            .select('id, created_by, extra_voters_added')
            .eq('id', roomId)
            .single();

        if (roomError || !room) {
            return NextResponse.json({
                error: 'Room not found'
            }, { status: 404 });
        }

        if (room.created_by !== userId) {
            return NextResponse.json({
                error: 'Unauthorized - you must own this room'
            }, { status: 403 });
        }

        // Check user has enough coins
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('coins')
            .eq('id', userId)
            .single();

        if (!user || (user.coins || 0) < expectedCost) {
            return NextResponse.json({
                error: 'Insufficient coins'
            }, { status: 400 });
        }

        // Deduct coins from user
        const { error: updateUserError } = await supabaseAdmin
            .from('users')
            .update({
                coins: (user.coins || 0) - expectedCost
            })
            .eq('id', userId);

        if (updateUserError) {
            console.error('Error updating user coins:', updateUserError);
            return NextResponse.json({
                error: 'Failed to deduct coins'
            }, { status: 500 });
        }

        // Calculate feature-specific data
        let featureData: any = {};
        let expiresAt: string | null = null;

        switch (featureType) {
            case 'extra_voters':
                featureData = { voter_count: 10 };
                break;
            case 'extend_room':
                // Extend room by 30 days
                expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                featureData = { extension_days: 30 };
                break;
            case 'extended_window':
                // Extend voting by 7 days
                expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
                featureData = { extension_days: 7 };
                break;
            case 'audit_trail':
                featureData = { enabled: true };
                break;
            case 'qr_code':
                // Generate QR code data
                featureData = { url: `${process.env.NEXT_PUBLIC_APP_URL}/join/${roomId}` };
                break;
            default:
                featureData = { enabled: true };
        }

        // Create coin feature record
        const { data: coinFeature, error: featureError } = await supabaseAdmin
            .from('coin_features')
            .insert({
                room_id: roomId,
                feature_type: featureType,
                cost_vqc: expectedCost,
                purchased_by: userId,
                expires_at: expiresAt,
                data: featureData
            })
            .select()
            .single();

        if (featureError) {
            console.error('Error creating coin feature:', featureError);
            // Refund coins if feature creation fails
            await supabaseAdmin
                .from('users')
                .update({
                    coins: (user.coins || 0)
                })
                .eq('id', userId);

            return NextResponse.json({
                error: 'Failed to purchase feature'
            }, { status: 500 });
        }

        // Update room flags based on feature type
        const updateData: any = {};
        switch (featureType) {
            case 'ranked_choice_voting':
                updateData.ranked_choice_enabled = true;
                break;
            case 'anonymous_voting':
                updateData.anonymous_voting_enabled = true;
                break;
            case 'weighted_voting':
                updateData.weighted_voting_enabled = true;
                break;
            case 'instant_tabulation':
                updateData.instant_tabulation_enabled = true;
                break;
            case 'audit_trail':
                updateData.audit_trail_enabled = true;
                break;
            case 'custom_branding':
                updateData.custom_branding_enabled = true;
                break;
            case 'extra_voters':
                updateData.extra_voters_added = (room.extra_voters_added || 0) + 10;
                break;
            case 'extend_room':
            case 'extended_window':
                // Update extended_until timestamp
                const extensionDays = featureData.extension_days || 30;
                const newExtendDate = new Date(Date.now() + extensionDays * 24 * 60 * 60 * 1000).toISOString();
                updateData.extended_until = newExtendDate;
                break;
        }

        if (Object.keys(updateData).length > 0) {
            await supabaseAdmin
                .from('voting_rooms')
                .update(updateData)
                .eq('id', roomId);
        }

        console.log('[COINS] Feature purchased:', {
            roomId,
            featureType,
            userId,
            cost: expectedCost
        });

        // Create notification
        await supabaseAdmin.from('notifications').insert({
            user_id: userId,
            type: 'room_upgrade',
            title: '⚡ Room Upgraded!',
            message: `Successfully purchased ${featureType.replace('_', ' ')} for ${expectedCost} coins`,
            metadata: { roomId, featureType },
            read: false
        });

        return NextResponse.json({
            success: true,
            feature: coinFeature,
            remainingCoins: (user.coins || 0) - expectedCost
        });

    } catch (error: any) {
        console.error('[COINS] Purchase error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to purchase feature' },
            { status: 500 }
        );
    }
}
