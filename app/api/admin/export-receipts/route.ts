import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

/**
 * Get all unexported receipts ready for blockchain submission
 * GET /api/admin/export-receipts
 */
export async function GET() {
    try {
        // Fetch unexported coin transactions with receipts
        const { data: transactions, error } = await supabaseAdmin
            .from('coin_transactions')
            .select('*')
            .not('receipt_hash', 'is', null)
            .or('blockchain_exported.is.null,blockchain_exported.eq.false') // Not yet exported
            .order('created_at', { ascending: true })
            .limit(100); // Batch of 100

        if (error) throw error;

        // Format for blockchain
        const receipts = transactions?.map((tx: any) => ({
            hash: tx.receipt_hash,
            userId: tx.user_id,
            amount: tx.amount,
            timestamp: new Date(tx.created_at).getTime(),
            action: tx.reason,
            metadata: tx.action_metadata
        })) || [];

        return NextResponse.json({
            count: receipts.length,
            receipts,
            totalValue: receipts.reduce((sum: number, r: any) => sum + r.amount, 0)
        });

    } catch (error: any) {
        console.error('[ADMIN] Export receipts error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Mark receipts as exported to blockchain
 * POST /api/admin/export-receipts
 */
export async function POST(request: Request) {
    try {
        const { receiptHashes, txHash } = await request.json();

        if (!receiptHashes || !Array.isArray(receiptHashes)) {
            return NextResponse.json({ error: 'Invalid receipt hashes' }, { status: 400 });
        }

        // Mark receipts as exported
        const { error } = await supabaseAdmin
            .from('coin_transactions')
            .update({
                blockchain_exported: true,
                blockchain_tx_hash: txHash || null,
                blockchain_exported_at: new Date().toISOString()
            })
            .in('receipt_hash', receiptHashes);

        if (error) throw error;

        return NextResponse.json({
            success: true,
            exported: receiptHashes.length,
            txHash
        });

    } catch (error: any) {
        console.error('[ADMIN] Mark exported error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
