import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

// GET: Fetch comments for a proposal
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const proposalId = params.id;

        const { data: comments, error } = await supabaseAdmin
            .from('proposal_comments')
            .select(`
                id,
                content,
                upvotes,
                parent_id,
                created_at,
                user:users!proposal_comments_user_id_fkey(id, username, email)
            `)
            .eq('proposal_id', proposalId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
            return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
        }

        // Transform to nested structure
        const rootComments = comments?.filter((c: any) => !c.parent_id) || [];
        const replies = comments?.filter((c: any) => c.parent_id) || [];

        const nestedComments = rootComments.map((comment: any) => ({
            ...comment,
            author: (comment.user as any)?.[0]?.username || (comment.user as any)?.[0]?.email?.split('@')[0] || 'Anonymous',
            replies: replies.filter((r: any) => r.parent_id === comment.id).map((reply: any) => ({
                ...reply,
                author: (reply.user as any)?.[0]?.username || (reply.user as any)?.[0]?.email?.split('@')[0] || 'Anonymous'
            }))
        }));

        return NextResponse.json({ comments: nestedComments });

    } catch (error) {
        console.error('Comments API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create a new comment
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const proposalId = params.id;
        const { userId, content, parentId } = await request.json();

        if (!userId || !content) {
            return NextResponse.json({ error: 'User ID and content required' }, { status: 400 });
        }

        if (content.length > 2000) {
            return NextResponse.json({ error: 'Comment too long (max 2000 chars)' }, { status: 400 });
        }

        const { data: comment, error } = await supabaseAdmin
            .from('proposal_comments')
            .insert({
                proposal_id: proposalId,
                user_id: userId,
                parent_id: parentId || null,
                content: content.trim()
            })
            .select(`
                id,
                content,
                upvotes,
                parent_id,
                created_at,
                user:users!proposal_comments_user_id_fkey(id, username, email)
            `)
            .single();

        if (error) {
            console.error('Error creating comment:', error);
            return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
        }

        return NextResponse.json({
            comment: {
                ...comment,
                author: (comment.user as any)?.[0]?.username || (comment.user as any)?.[0]?.email?.split('@')[0] || 'Anonymous',
                replies: []
            }
        });

    } catch (error) {
        console.error('Create comment error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
