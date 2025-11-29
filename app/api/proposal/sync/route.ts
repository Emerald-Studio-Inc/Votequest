import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Sync blockchain proposal to database (upsert)
 * POST /api/proposal/sync
 */
export async function POST(request: Request) {
    try {
        const { blockchainId, title, description, endDate, options, status, participants } = await request.json();

        if (!blockchainId || !title || !description || !endDate || !options) {
            return NextResponse.json({
                error: 'Missing required fields',
                required: ['blockchainId', 'title', 'description', 'endDate', 'options']
            }, { status: 400 });
        }

        // Check if proposal already exists by blockchain_id
        const { data: existingProposal } = await supabaseAdmin
            .from('proposals')
            .select('id')
            .eq('blockchain_id', blockchainId)
            .single();

        let proposalId: string;

        if (existingProposal) {
            // Update existing proposal (status and participants may have changed)
            const { data: updatedProposal, error: updateError } = await supabaseAdmin
                .from('proposals')
                .update({
                    status: status || 'active',
                    participants: participants || 0,
                    end_date: endDate,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingProposal.id)
                .select()
                .single();

            if (updateError) {
                console.error('[API] Error updating proposal:', updateError);
                return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
            }

            proposalId = existingProposal.id;

            // Update options (delete old ones and insert new ones to update vote counts)
            await supabaseAdmin
                .from('proposal_options')
                .delete()
                .eq('proposal_id', proposalId);

            const optionsToInsert = options.map((opt: any, idx: number) => ({
                proposal_id: proposalId,
                option_number: idx,
                title: opt.title,
                description: opt.description || null,
                votes: opt.votes || 0
            }));

            await supabaseAdmin
                .from('proposal_options')
                .insert(optionsToInsert);

        } else {
            // Insert new proposal
            const { data: newProposal, error: insertError } = await supabaseAdmin
                .from('proposals')
                .insert({
                    blockchain_id: blockchainId,
                    title,
                    description,
                    status: status || 'active',
                    participants: participants || 0,
                    end_date: endDate,
                    created_by: null, // Blockchain proposals don't have a known creator in DB
                    category: 'Community'
                })
                .select()
                .single();

            if (insertError) {
                console.error('[API] Error creating proposal:', insertError);
                return NextResponse.json({ error: 'Failed to create proposal' }, { status: 500 });
            }

            proposalId = newProposal.id;

            // Insert options
            const optionsToInsert = options.map((opt: any, idx: number) => ({
                proposal_id: proposalId,
                option_number: idx,
                title: opt.title,
                description: opt.description || null,
                votes: opt.votes || 0
            }));

            const { error: optionsError } = await supabaseAdmin
                .from('proposal_options')
                .insert(optionsToInsert);

            if (optionsError) {
                console.error('[API] Error creating options:', optionsError);
                return NextResponse.json({ error: 'Failed to create options' }, { status: 500 });
            }
        }

        return NextResponse.json({
            success: true,
            proposalId,
            action: existingProposal ? 'updated' : 'created'
        });

    } catch (error: any) {
        console.error('[API] Proposal sync error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
