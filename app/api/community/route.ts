import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-auth';

// GET: Fetch combined feed of debates and forum threads
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'hot'; // 'hot', 'new', 'debates'

        // Fetch debates
        const { data: debates, error: debatesError } = await supabase
            .from('debates')
            .select(`
                id,
                title,
                description,
                status,
                start_time,
                end_time,
                pro_count,
                con_count,
                created_at,
                creator:users!debates_creator_id_fkey(username)
            `)
            .order('created_at', { ascending: false })
            .limit(10);

        if (debatesError) {
            console.error('Error fetching debates:', debatesError);
        }

        // Fetch forum threads
        const { data: threads, error: threadsError } = await supabase
            .from('forum_threads')
            .select(`
                id,
                title,
                content,
                category,
                is_pinned,
                view_count,
                created_at,
                author:users!forum_threads_author_id_fkey(username)
            `)
            .order(filter === 'new' ? 'created_at' : 'view_count', { ascending: false })
            .limit(20);

        if (threadsError) {
            console.error('Error fetching threads:', threadsError);
        }

        // Calculate engagement metrics for threads (comments count)
        const threadIds = threads?.map(t => t.id) || [];
        const { data: commentCounts } = await supabase
            .from('comments')
            .select('forum_thread_id')
            .in('forum_thread_id', threadIds);

        // Count comments per thread
        const commentCountMap: Record<string, number> = {};
        commentCounts?.forEach(c => {
            if (c.forum_thread_id) {
                commentCountMap[c.forum_thread_id] = (commentCountMap[c.forum_thread_id] || 0) + 1;
            }
        });

        // Transform to unified feed format
        const feed = [
            // Live debates first
            ...(debates || [])
                .filter(d => filter === 'debates' || d.status === 'live')
                .map(d => ({
                    id: d.id,
                    title: d.title,
                    author: (d.creator as any)?.[0]?.username || 'System',
                    type: 'debate' as const,
                    status: d.status,
                    participants: d.pro_count + d.con_count,
                    views: null,
                    upvotes: null,
                    replies: null,
                    tag: null,
                    created_at: d.created_at
                })),
            // Threads
            ...(threads || []).map(t => ({
                id: t.id,
                title: t.title,
                author: (t.author as any)?.[0]?.username || 'Anonymous',
                type: 'discussion' as const,
                status: null,
                participants: null,
                views: t.view_count?.toString() || '0',
                upvotes: t.view_count || 0, // Using view_count as proxy for now
                replies: commentCountMap[t.id] || 0,
                tag: t.category,
                created_at: t.created_at
            }))
        ];

        // Sort by recency for 'new', otherwise keep debates on top
        if (filter === 'new') {
            feed.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        return NextResponse.json({ feed });

    } catch (error) {
        console.error('Community API error:', error);
        return NextResponse.json({ error: 'Failed to fetch community feed' }, { status: 500 });
    }
}

// POST: Create new thread
export async function POST(request: NextRequest) {
    try {
        const { userId, title, content, category } = await request.json();

        if (!userId || !title) {
            return NextResponse.json({ error: 'User ID and title required' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('forum_threads')
            .insert({
                author_id: userId,
                title,
                content: content || '',
                category: category || 'general'
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating thread:', error);
            return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
        }

        return NextResponse.json({ thread: data });

    } catch (error) {
        console.error('Create thread error:', error);
        return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 });
    }
}
