import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { rateLimit } from '@/lib/rate-limit';

const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(),
});

export async function POST(request: Request) {
    try {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (!rateLimit(ip, 5, 60000)) { // 5 proposals per minute per IP
            return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
        }

        const body = await request.json();
        const { title, description, endDate, options, creatorId, walletAddress, txHash } = body;

        if (!title || !creatorId || !txHash || !walletAddress) {
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

        if (tx.from.toLowerCase() !== walletAddress.toLowerCase()) {
            return NextResponse.json({ error: 'Transaction sender mismatch' }, { status: 403 });
        }

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
                    participants: 0
                }
            ])
            .select()
            .single();

        if (propError || !proposal) {
            console.error('Error creating proposal:', propError);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        // 3. Create options
        const optionsData = options.map((opt: any, index: number) => ({
            proposal_id: proposal.id,
            option_number: index + 1,
            title: opt.title,
            description: opt.description,
            votes: 0
        }));

        const { error: optError } = await supabaseAdmin
            .from('proposal_options')
            .insert(optionsData);

        if (optError) {
            console.error('Error creating options:', optError);
            return NextResponse.json({ error: 'Error creating options' }, { status: 500 });
        }

        return NextResponse.json({ success: true, proposalId: proposal.id });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
