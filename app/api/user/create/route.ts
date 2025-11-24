import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// Validation schema
const createUserSchema = z.object({
    walletAddress: z.string()
        .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum wallet address format')
        .transform(addr => addr.toLowerCase()) // Normalize to lowercase
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!rateLimit(ip, 10, 60000)) { // 10 user creations per minute per IP (generous)
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();

        // Validate input with Zod
        const validationResult = createUserSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Invalid input',
                details: validationResult.error.issues.map(i => i.message)
            }, { status: 400 });
        }

        const { walletAddress } = validationResult.data;
        console.log('[API] Creating/fetching user for wallet:', walletAddress);

        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('wallet_address', walletAddress) // Already lowercase from Zod transform
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error('[API] Error fetching user:', fetchError);
        }

        if (existingUser) {
            console.log('[API] User already exists, returning existing user');
            return NextResponse.json(existingUser);
        }

        // Create new user
        console.log('[API] Creating new user in database...');
        const { data: newUser, error } = await supabaseAdmin
            .from('users')
            .insert([
                {
                    wallet_address: walletAddress, // Already lowercase from Zod transform
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
            console.error('[API] Error creating user:', error);
            return NextResponse.json({ error: 'Database error', details: error }, { status: 500 });
        }

        console.log('[API] User created successfully:', newUser.id);
        return NextResponse.json(newUser);

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
