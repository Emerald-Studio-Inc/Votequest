import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

// Simplified validation schema (no txHash required)
const proposalSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
    description: z.string().max(2000, 'Description too long').optional(),
    end_date: z.string().refine((date) => new Date(date) > new Date(), 'End date must be in the future'),
    options: z.array(z.object({
        title: z.string().min(1, 'Option title required').max(100, 'Option title too long'),
        description: z.string().max(500, 'Option description too long').nullable().optional()
    })).min(2, 'At least 2 options required').max(10, 'Maximum 10 options allowed'),
    userId: z.string().uuid('Invalid user ID'),
    category: z.string().max(50, 'Category name too long').optional()
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!rateLimit(ip, 5, 60000)) { // 5 proposals per minute per IP
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        console.log('[API] Received proposal creation request:', body);

        // Validate input with Zod
        const validationResult = proposalSchema.safeParse(body);
        if (!validationResult.success) {
            console.error('[API] Validation failed:', validationResult.error.issues);
            return NextResponse.json({
                error: 'Invalid input',
                details: validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
            }, { status: 400 });
        }

        const { title, description, end_date, options, userId, category } = validationResult.data;
        const txHash = body.txHash || null;
        const walletAddress = body.walletAddress || null;

        console.log('[API] Creating proposal with blockchain data:', { hasTxHash: !!txHash, hasWallet: !!walletAddress });

        // Create proposal in DB
        const { data: proposal, error: propError } = await supabaseAdmin
            .from('proposals')
            .insert([
                {
                    title,
                    description,
                    end_date: end_date,
                    created_by: userId,
                    status: 'active',
                    participants: 0,
                    category: category || 'Community',
                    onchain_id: null,
                    blockchain_id: txHash ? 1 : null, // Set to 1 if blockchain tx exists
                    tx_hash: txHash
                }
            ])
            .select()
            .single();

        if (propError || !proposal) {
            console.error('[API] Error creating proposal:', propError);
            return NextResponse.json({ error: 'Database error', details: propError }, { status: 500 });
        }

        console.log('[API] Proposal created:', proposal.id);

        // Create options in DB
        if (options && options.length > 0) {
            const optionsToInsert = options.map((opt: any, index: number) => ({
                proposal_id: proposal.id,
                option_number: index,
                title: opt.title,
                description: opt.description || null,
                votes: 0
            }));

            const { error: optionsError } = await supabaseAdmin
                .from('proposal_options')
                .insert(optionsToInsert);

            if (optionsError) {
                console.error('[API] Error creating options:', optionsError);
            } else {
                console.log(`[API] Created ${options.length} options`);
            }
        }

        // Award coins for creating proposal (50 VQC + receipt)
        try {
            const { awardCoins } = await import('@/lib/coins');
            await awardCoins(userId, 50, 'proposal_created', proposal.id, {
                proposalId: proposal.id,
                proposalTitle: title,
                category: category || 'Community',
                hasBlockchainTx: !!proposal.tx_hash
            });
            console.log('[API] ✅ Awarded 50 VQC for proposal creation with receipt');
        } catch (coinError) {
            console.error('[API] Error awarding coins:', coinError);
        }

        return NextResponse.json({
            success: true,
            proposalId: proposal.id,
            coins: 50
        });

    } catch (error: any) {
        console.error('[API] Unexpected error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
