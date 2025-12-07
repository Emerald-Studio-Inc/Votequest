import { NextResponse } from 'next/server';
import { castRoomVote, canUserVoteInRoom } from '@/lib/institutional';

/**
 * Cast a vote in a voting room
 * POST /api/rooms/vote
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, roomId, optionId } = body;

        // Validation
        if (!userId || !roomId || !optionId) {
            return NextResponse.json(
                { error: 'Missing required fields: userId, roomId, optionId' },
                { status: 400 }
            );
        }

        // Get client IP for fraud detection
        const forwarded = request.headers.get('x-forwarded-for');
        const realIp = request.headers.get('x-real-ip');
        const clientIp = forwarded?.split(',')[0] || realIp || 'unknown';

        const userAgent = request.headers.get('user-agent') || 'unknown';

        // Check if user can vote
        const eligibility = await canUserVoteInRoom(userId, roomId);
        if (!eligibility.canVote) {
            return NextResponse.json(
                { error: eligibility.reason },
                { status: 403 }
            );
        }

        // Cast vote
        const { success, error } = await castRoomVote(
            userId,
            roomId,
            optionId,
            {
                ip_address: clientIp,
                user_agent: userAgent,
                timestamp: new Date().toISOString()
            }
        );

        if (!success) {
            return NextResponse.json({ error }, { status: 500 });
        }

        console.log(`[API] Room vote cast: User ${userId} voted in room ${roomId}`);

        return NextResponse.json({
            success: true,
            message: 'Vote cast successfully'
        });

    } catch (error: any) {
        console.error('[API] Error casting room vote:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
