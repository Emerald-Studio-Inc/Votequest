import { NextResponse } from 'next/server';
import { createRoom, getRoomDetails, isOrgAdmin } from '@/lib/institutional';

/**
 * Create a new voting room
 * POST /api/rooms
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            organizationId,
            title,
            description,
            verificationTier,
            options,
            userId
        } = body;

        // Validation
        if (!organizationId || !title || !verificationTier || !options || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (!Array.isArray(options) || options.length < 2) {
            return NextResponse.json(
                { error: 'At least 2 options required' },
                { status: 400 }
            );
        }

        const validTiers = ['tier1', 'tier2', 'tier3'];
        if (!validTiers.includes(verificationTier)) {
            return NextResponse.json(
                { error: 'Invalid verification tier' },
                { status: 400 }
            );
        }

        // Check if user is org admin
        const isAdmin = await isOrgAdmin(userId, organizationId);
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized: You must be an organization admin' },
                { status: 403 }
            );
        }

        // Create room
        const { room, error } = await createRoom(
            organizationId,
            title,
            description,
            verificationTier,
            userId,
            options
        );

        if (error) {
            return NextResponse.json({ error }, { status: 500 });
        }

        console.log('[API] Room created:', room?.id);

        // Award 3 coins for creating a room (Proof of Action)
        try {
            const { awardCoins } = await import('@/lib/coins');
            if (room) {
                await awardCoins(userId, 3, 'room_created', room.id, {
                    roomId: room.id,
                    title: title,
                    organizationId: organizationId
                });
                console.log('[API] ✅ Awarded 3 VQC for room creation with receipt');

                const { createNotification } = await import('@/lib/coins');
                await createNotification(
                    userId,
                    'room_created',
                    'Room Ready',
                    `Voting Room "${title}" created successfully. Invite voters now!`,
                    room.id,
                    { title }
                );
            }
        } catch (coinError) {
            console.error('[API] Error awarding coins:', coinError);
        }

        return NextResponse.json({
            success: true,
            room
        });

    } catch (error: any) {
        console.error('[API] Error creating room:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

/**
 * Get room details or list rooms by organization
 * GET /api/rooms?roomId=xxx
 * GET /api/rooms?organizationId=xxx
 */
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const roomId = searchParams.get('roomId');
        const organizationId = searchParams.get('organizationId');

        // Get single room by ID
        if (roomId) {
            const room = await getRoomDetails(roomId);

            if (!room) {
                return NextResponse.json(
                    { error: 'Room not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ room });
        }

        // Get rooms by organization
        if (organizationId) {
            const { supabaseAdmin } = await import('@/lib/server-db');

            const { data: rooms, error } = await supabaseAdmin
                .from('voting_rooms')
                .select(`
                    *,
                    room_options(*)
                `)
                .eq('organization_id', organizationId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[API] Error fetching rooms:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            }

            return NextResponse.json({ rooms: rooms || [] });
        }

        return NextResponse.json(
            { error: 'Missing roomId or organizationId parameter' },
            { status: 400 }
        );

    } catch (error: any) {
        console.error('[API] Error fetching room:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
