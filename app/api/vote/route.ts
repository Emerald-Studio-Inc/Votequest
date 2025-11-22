import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { VOTE_QUEST_ABI } from '@/lib/contracts';
import { rateLimit } from '@/lib/rate-limit';

const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!rateLimit(ip, 20, 60000)) { // 20 votes per minute per IP
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const { userId, proposalId, optionId, txHash, walletAddress } = body;

        if (!userId || !proposalId || !optionId || !txHash || !walletAddress) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Verify transaction on-chain
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
                tx_hash: txHash,
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

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
