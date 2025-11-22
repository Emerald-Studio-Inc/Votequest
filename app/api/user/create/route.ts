import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!rateLimit(ip, 10, 60000)) { // 10 user creations per minute per IP (generous)
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const { walletAddress } = body;

        if (!walletAddress) {
            return NextResponse.json({ error: 'Missing wallet address' }, { status: 400 });
        }

        // Check if user exists
        const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('wallet_address', walletAddress.toLowerCase())
            .single();

        if (existingUser) {
            return NextResponse.json(existingUser);
        }

        // Create new user
        const { data: newUser, error } = await supabaseAdmin
            .from('users')
            .insert([
                {
                    wallet_address: walletAddress.toLowerCase(),
                    level: 5,
                    xp: 3420,
                    streak: 12,
                    voting_power: 2847,
                    votes_count: 47,
                    global_rank: 247,
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        return NextResponse.json(newUser);

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
