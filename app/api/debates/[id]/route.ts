import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-auth';

// GET: Get Debate Details + Arguments
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const debateId = params.id;

        // 1. Fetch Debate Info
        const { data: debate, error: debateError } = await supabase
            .from('debates')
            .select(`
                *,
                creator:users!debates_creator_id_fkey(username, global_rank)
            `)
            .eq('id', debateId)
            .single();

        if (debateError) {
            return NextResponse.json({ error: 'Debate not found' }, { status: 404 });
        }

        // 2. Fetch Arguments (Comments)
        const { data: comments, error: commentsError } = await supabase
            .from('comments')
            .select(`
                *,
                user:users(username, global_rank, voting_power)
            `)
            .eq('debate_id', debateId)
            .order('upvotes', { ascending: false }); // Sort by best arguments

        if (commentsError) {
            console.error('Error fetching arguments:', commentsError);
        }

        // 3. Split into Pro/Con
        const proArguments = comments?.filter(c => c.side === 'pro') || [];
        const conArguments = comments?.filter(c => c.side === 'con') || [];

        return NextResponse.json({
            debate,
            proArguments,
            conArguments
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Submit Argument
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const debateId = params.id;
        const body = await request.json();
        const { userId, content, side } = body; // side: 'pro' | 'con'

        if (!userId || !content || !side) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Insert Comment
        const { data: comment, error: commentError } = await supabase
            .from('comments')
            .insert({
                debate_id: debateId,
                user_id: userId,
                content,
                side,
                upvotes: 0,
                downvotes: 0
            })
            .select()
            .single();

        if (commentError) {
            console.error('Error submitting argument:', commentError);
            return NextResponse.json({ error: commentError.message }, { status: 500 });
        }

        // 2. Check if user is a participant, if not add them?
        // For now, let's just increment the debate counter
        // (Optimistic / Simple approach for now)
        const counterColumn = side === 'pro' ? 'pro_count' : 'con_count';

        // Use RPC or raw SQL ideally, but for now simple increment is okay for prototype
        // Actually, let's use a stored procedure if we had one, but we don't for this specific count yet.
        // We'll just do a read-modify-write carefully or ignore slight drift for now as it's not financial.
        // Better: atomic increment via rpc if possible, or just accept it.
        // Let's rely on the client to refetch.
        // Alternatively, we can run a quick RPC or raw query if we want perfection.

        // Let's attempt a simple increment
        /*
        await supabase.rpc('increment_debate_count', { 
            debate_id: debateId, 
            side: side 
        });
        */
        // Since we don't have that RPC, we'll skip the atomic increment for this step to keep it simple 
        // and rely on `comments` count for accuracy if we rebuild metrics later.
        // However, updating the `debates` table cache is good for the list view.

        // Creating a simple rpc on the fly? No, that's risky.
        // Let's just fetch current, add 1, update.
        const { data: currentDebate } = await supabase.from('debates').select(counterColumn).eq('id', debateId).single();
        if (currentDebate) {
            const newCount = (currentDebate[counterColumn as keyof typeof currentDebate] || 0) + 1;
            await supabase.from('debates').update({ [counterColumn]: newCount }).eq('id', debateId);
        }

        return NextResponse.json(comment);

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
