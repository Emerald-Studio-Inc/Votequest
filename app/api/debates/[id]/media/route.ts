import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

// GET: Fetch media for a debate (broadcast items visible to all, personal items to owner)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const debateId = params.id;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const broadcastOnly = searchParams.get('broadcast') === 'true';

        let query = supabaseAdmin
            .from('debate_media')
            .select(`
                id,
                media_type,
                content,
                title,
                is_broadcast,
                created_at,
                sender:users!debate_media_sender_id_fkey(id, username, email)
            `)
            .eq('debate_id', debateId)
            .order('created_at', { ascending: false });

        if (broadcastOnly) {
            query = query.eq('is_broadcast', true);
        } else if (userId) {
            // Return broadcast items + user's own items
            query = query.or(`is_broadcast.eq.true,sender_id.eq.${userId}`);
        }

        const { data: media, error } = await query.limit(50);

        if (error) {
            console.error('Error fetching debate media:', error);
            return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
        }

        const formattedMedia = media?.map((m: any) => ({
            ...m,
            senderName: (m.sender as any)?.[0]?.username || (m.sender as any)?.[0]?.email?.split('@')[0] || 'Anonymous'
        })) || [];

        return NextResponse.json({ media: formattedMedia });

    } catch (error) {
        console.error('Debate media API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Share media to the debate
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const debateId = params.id;
        const { userId, mediaType, content, title, broadcast } = await request.json();

        if (!userId || !content || !mediaType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const validTypes = ['IMAGE', 'LINK', 'TEXT_SNIPPET', 'FILE'];
        if (!validTypes.includes(mediaType)) {
            return NextResponse.json({ error: 'Invalid media type' }, { status: 400 });
        }

        // Validate content length
        if (content.length > 5000) {
            return NextResponse.json({ error: 'Content too long' }, { status: 400 });
        }

        // Check if user is a participant in this debate (optional gating)
        // For now, any authenticated user can share

        const { data: media, error } = await supabaseAdmin
            .from('debate_media')
            .insert({
                debate_id: debateId,
                sender_id: userId,
                media_type: mediaType,
                content: content.trim(),
                title: title?.trim() || null,
                is_broadcast: broadcast || false
            })
            .select(`
                id,
                media_type,
                content,
                title,
                is_broadcast,
                created_at,
                sender:users!debate_media_sender_id_fkey(id, username, email)
            `)
            .single();

        if (error) {
            console.error('Error sharing media:', error);
            return NextResponse.json({ error: 'Failed to share media' }, { status: 500 });
        }

        return NextResponse.json({
            media: {
                ...media,
                senderName: (media.sender as any)?.[0]?.username || 'Anonymous'
            }
        });

    } catch (error) {
        console.error('Share media error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Toggle broadcast status (promote to main console)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { mediaId, broadcast } = await request.json();

        if (!mediaId) {
            return NextResponse.json({ error: 'Media ID required' }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from('debate_media')
            .update({ is_broadcast: broadcast })
            .eq('id', mediaId);

        if (error) {
            console.error('Error updating broadcast status:', error);
            return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Patch media error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
