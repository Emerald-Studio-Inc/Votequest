import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { createPublicClient, http } from 'viem';
import { polygonAmoy } from 'viem/chains';
import { VOTE_QUEST_ABI } from '@/lib/contracts';
import { rateLimit } from '@/lib/rate-limit';
import { z } from 'zod';

const publicClient = createPublicClient({
    chain: polygonAmoy,  // FIXED: Was sepolia, now correct chain
    transport: http(),
});

// Validation schema - allow both UUIDs and numeric blockchain IDs
const voteSchema = z.object({
    userId: z.string().uuid('Invalid user ID format'),
    proposalId: z.string().min(1, 'Proposal ID required'),  // Can be UUID or blockchain ID
    optionId: z.string().min(1, 'Option ID required'),      // Can be UUID or blockchain ID
    txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid transaction hash').optional().nullable(),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address').optional().nullable(),
    captchaToken: z.string().min(1, 'CAPTCHA token required')
});

// CAPTCHA verification function
async function verifyTurnstile(token: string): Promise<boolean> {
    try {
        const response = await fetch(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret: process.env.TURNSTILE_SECRET_KEY,
                    response: token
                })
            }
        );

        const data = await response.json();
        return data.success === true;
    } catch (error) {
        console.error('Turnstile verification error:', error);
        return false;
    }
}

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

        let { userId, proposalId, optionId, txHash, walletAddress, captchaToken } = validationResult.data;

        console.log('[API] Vote request:', { userId, proposalId, optionId, txHash: txHash ? 'present' : 'none' });

        // CONVERT BLOCKCHAIN IDs TO DATABASE UUIDs
        // If proposalId is a number (blockchain ID), look up the database UUID
        const isBlockchainProposalId = !proposalId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);

        if (isBlockchainProposalId) {
            const blockchainId = parseInt(proposalId);
            console.log(`[API] Converting blockchain ID ${blockchainId} to database UUID...`);

            // Handle duplicates: get most recent proposal with this blockchain_id
            const { data: dbProposals, error } = await supabaseAdmin
                .from('proposals')
                .select('id, proposal_options(id, title, option_number)')
                .eq('blockchain_id', blockchainId)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error || !dbProposals || dbProposals.length === 0) {
                console.error('[API] Proposal lookup failed:', { blockchainId, error, dbProposals });
                return NextResponse.json({
                    error: 'Proposal not found in database',
                    hint: 'The proposal may not be synced yet. Please refresh and try again.'
                }, { status: 404 });
            }

            const dbProposal = dbProposals[0];
            console.log(`[API] Found proposal:`, { id: dbProposal.id, options: dbProposal.proposal_options });

            // Map blockchain option ID to database option UUID
            // Find option by option_number, not array index (options might not be ordered)
            const optionIndex = parseInt(optionId);
            const dbOption = (dbProposal.proposal_options as any[]).find(
                (opt: any) => opt.option_number === optionIndex
            );

            if (!dbOption) {
                console.error(`[API] Option ${optionIndex} not found. Available options:`, dbProposal.proposal_options);
                return NextResponse.json({
                    error: 'Option not found',
                    hint: `Option number ${optionIndex} not found for this proposal`
                }, { status: 404 });
            }

            // Replace with database UUIDs
            proposalId = dbProposal.id;
            optionId = dbOption.id;

            console.log(`[API] ✅ Converted blockchain IDs - Proposal: ${blockchainId} -> ${proposalId}, Option: ${optionIndex} -> ${optionId}`);
        }

        // SECURITY CHECK: Verify CAPTCHA (MANDATORY)
        console.log('[API] Verifying CAPTCHA...');
        const isValidCaptcha = await verifyTurnstile(captchaToken);
        if (!isValidCaptcha) {
            console.error('[API] CAPTCHA validation failed');
            return NextResponse.json({
                error: 'Security verification failed. Please complete the CAPTCHA challenge.',
                helpText: 'Refresh the page and try again'
            }, { status: 400 });
        }
        console.log('[API] ✅ CAPTCHA verified successfully');

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


        // 5. Award coins for voting ONLY if blockchain transaction succeeded (10 VQC)
        try {
            const { awardCoins, createNotification } = await import('@/lib/coins');

            // Only award coins if vote was recorded on blockchain
            if (txHash) {
                // Fetch proposal and option details for receipt metadata
                const { data: proposal } = await supabaseAdmin
                    .from('proposals')
                    .select('title')
                    .eq('id', proposalId)
                    .single();

                const { data: option } = await supabaseAdmin
                    .from('proposal_options')
                    .select('title')
                    .eq('id', optionId)
                    .single();

                // Award coins with cryptographic receipt
                await awardCoins(userId, 10, 'vote_cast', proposalId, {
                    proposalId,
                    proposalTitle: proposal?.title || 'Unknown Proposal',
                    optionId,
                    optionTitle: option?.title || 'Unknown Option'
                });
                console.log('[API] ✅ Awarded 10 VQC for blockchain vote with receipt');
            } else {
                console.log('[API] No coins awarded - vote was database-only (no blockchain tx)');
            }

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
