import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { VOTE_QUEST_ABI } from '@/lib/contracts';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
});

// Validation schema
const voteSchema = z.object({
    userId: z.string().uuid('Invalid user ID format'),
    proposalId: z.string().uuid('Invalid proposal ID format'),
    optionId: z.string().uuid('Invalid option ID format'),
    txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash').optional().nullable(),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address').optional().nullable()
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!rateLimit(ip, 20, 60000)) { // 20 votes per minute per IP
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();

        // Validate input with Zod
        const validationResult = voteSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: 'Invalid input',
                details: validationResult.error.issues.map(i => i.message)
            }, { status: 400 });
        }

        const { userId, proposalId, optionId, txHash, walletAddress } = validationResult.data;

        // If txHash provided, verify transaction on-chain
        if (txHash && walletAddress) {
            try {
                const tx = await publicClient.getTransaction({ hash: txHash as `0x${string}` });
                const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });

                if (!tx || !receipt) {
                    return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
                }

                if (receipt.status !== 'success') {
                    return NextResponse.json({ error: 'Transaction failed on-chain' }, { status: 400 });
                }

                // Verify sender matches wallet address
                if (tx.from.toLowerCase() !== walletAddress.toLowerCase()) {
                    return NextResponse.json({ error: 'Transaction sender mismatch' }, { status: 403 });
                }
            } catch (error) {
                console.error('Blockchain verification error:', error);
                return NextResponse.json({ error: 'Failed to verify transaction' }, { status: 500 });
            }
        }

        // 2. Check if user already voted in DB
        const { data: existingVote } = await supabaseAdmin
            .from('votes')
            .select('id')
            .eq('user_id', userId)
            .eq('proposal_id', proposalId)
            .single();

        if (existingVote) {
            return NextResponse.json({ error: 'Already voted' }, { status: 400 });
        }

        // 3. Record vote
        const { error: voteError } = await supabaseAdmin
            .from('votes')
            .insert([{
                user_id: userId,
                proposal_id: proposalId,
                option_id: optionId,
                tx_hash: txHash || null,
            }]);

        if (voteError) {
            console.error('Error recording vote:', voteError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // 4. Update counts and XP
        await supabaseAdmin.rpc('increment_option_votes', { option_id: optionId });
        await supabaseAdmin.rpc('increment_proposal_participants', { proposal_id: proposalId });
        await supabaseAdmin.rpc('increment_user_votes', { user_id: userId });

        // Award XP (250 XP for voting)
        const { data: user } = await supabaseAdmin
            .from('users')
            .select('xp')
            .eq('id', userId)
            .single();

        if (user) {
            const newXP = user.xp + 250;
            const newLevel = Math.floor(Math.sqrt(newXP / 100));

            await supabaseAdmin
                .from('users')
                .update({ xp: newXP, level: newLevel, updated_at: new Date().toISOString() })
                .eq('id', userId);
        }

        // 5. Award coins for voting (10 VQC) and notify proposal creator
        try {
            const { awardCoins, createNotification } = await import('@/lib/coins');

            // Award coins to voter
            await awardCoins(userId, 10, 'vote_cast', proposalId);

            // Notify proposal creator
            const { data: proposal } = await supabaseAdmin
                .from('proposals')
                .select('created_by, title')
                .eq('id', proposalId)
                .single();

            // Notify proposal creator (only if we have wallet address)
            if (proposal && proposal.created_by && proposal.created_by !== userId && walletAddress) {
                await createNotification(
                    proposal.created_by,
                    'proposal_voted',
                    'New vote on your proposal!',
                    `Someone voted on "${proposal.title}"`,
                    proposalId,
                    { voterAddress: walletAddress.substring(0, 8) + '...' }
                );
            }

            console.log('[API] Awarded 10 VQC for voting');
        } catch (coinError) {
            console.error('[API] Error with coins/notifications:', coinError);
            // Don't fail the request
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
