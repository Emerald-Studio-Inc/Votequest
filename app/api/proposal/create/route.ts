import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { createPublicClient, http, decodeEventLog } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { rateLimit } from '@/lib/rate-limit';
import { VOTE_QUEST_ABI } from '@/lib/contracts';
import { z } from 'zod';

const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http(),
});

// Validation schema
const proposalSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
    description: z.string().max(2000, 'Description too long').optional(),
    endDate: z.string().refine((date) => new Date(date) > new Date(), 'End date must be in the future'),
    options: z.array(z.object({
        title: z.string().min(1, 'Option title required').max(100, 'Option title too long'),
        description: z.string().max(500, 'Option description too long').optional()
    })).min(2, 'At least 2 options required').max(10, 'Maximum 10 options allowed'),
    creatorId: z.string().uuid('Invalid creator ID'),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address'),
    txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash'),
    category: z.string().max(50, 'Category name too long').optional()
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!rateLimit(ip, 5, 60000)) { // 5 proposals per minute per IP
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();

        // Validate input with Zod
        const validationResult = proposalSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Invalid input',
                details: validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
            }, { status: 400 });
        }

        const { title, description, endDate, options, creatorId, walletAddress, txHash, category } = validationResult.data;

        // 1. Verify transaction on-chain
        const tx = await publicClient.getTransaction({ hash: txHash as `0x${string}` });
        const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });

        if (!tx || !receipt) {
            return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
        }

        if (receipt.status !== 'success') {
            return NextResponse.json({ error: 'Transaction failed on-chain' }, { status: 400 });
        }

        if (tx.from.toLowerCase() !== walletAddress.toLowerCase()) {
            return NextResponse.json({ error: 'Transaction sender mismatch' }, { status: 403 });
        }

        // Extract Proposal ID from logs
        let onchainId = null;
        try {
            for (const log of receipt.logs) {
                try {
                    const decoded = decodeEventLog({
                        abi: VOTE_QUEST_ABI,
                        data: log.data,
                        topics: log.topics,
                    });
                    if (decoded.eventName === 'ProposalCreated') {
                        const args = decoded.args as any;
                        onchainId = Number(args.id);
                        break;
                    }
                } catch (e) {
                    // Ignore logs that don't match our ABI
                }
            }
        } catch (e) {
            console.error('Error decoding logs:', e);
        }

        console.log('Extracted On-Chain ID:', onchainId);

        // 2. Create proposal in DB
        const { data: proposal, error: propError } = await supabaseAdmin
            .from('proposals')
            .insert([
                {
                    title,
                    description,
                    end_date: endDate,
                    created_by: creatorId,
                    status: 'active',
                    participants: 0,
                    category: category || 'Community',
                    onchain_id: onchainId, // Save the real ID
                    tx_hash: txHash // Save the transaction hash for self-healing
                }
            ])
            .select()
            .single();

        if (propError || !proposal) {
            console.error('Error creating proposal:', propError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // 3. Create options in DB
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
                console.error('Error creating options:', optionsError);
            }
        }

        // 4. Award coins for creating proposal (50 VQC)
        try {
            const { awardCoins } = await import('@/lib/coins');
            await awardCoins(creatorId, 50, 'proposal_created', proposal.id, {
                proposalTitle: title
            });
            console.log('[API] Awarded 50 VQC for proposal creation');
        } catch (coinError) {
            console.error('[API] Error awarding coins:', coinError);
        }

        return NextResponse.json({ success: true, proposalId: proposal.id });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
