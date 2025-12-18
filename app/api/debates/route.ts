import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-auth';

// GET: List Debates
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        let query = supabase
            .from('debates')
            .select(`
                *,
                creator:users!debates_creator_id_fkey(username, global_rank)
            `)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching debates:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create Debate
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { title, description, creatorId, status = 'scheduled' } = body;

        // Basic validation
        if (!title || !creatorId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // TODO: check if user has permission/reputation?

        const { data, error } = await supabase
            .from('debates')
            .insert({
                title,
                description,
                creator_id: creatorId,
                status,
                pro_count: 0,
                con_count: 0
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating debate:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
