import { NextRequest, NextResponse } from 'next/server';
import { auditUserBalance, scanForUnreceiptedCoins, getUserReceipts } from '@/lib/economy-security';

// GET: Audit a specific user or scan all users
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');
        const action = searchParams.get('action') || 'audit';

        // Full system scan
        if (action === 'scan') {
            const result = await scanForUnreceiptedCoins();
            return NextResponse.json({
                action: 'SYSTEM_SCAN',
                flaggedUsers: result.flaggedUsers,
                totalFlagged: result.flaggedUsers.length,
                timestamp: new Date().toISOString()
            });
        }

        // Single user audit
        if (userId) {
            const audit = await auditUserBalance(userId);
            const receipts = await getUserReceipts(userId, 20);

            return NextResponse.json({
                action: 'USER_AUDIT',
                userId,
                ...audit,
                recentReceipts: receipts,
                timestamp: new Date().toISOString()
            });
        }

        return NextResponse.json({ error: 'Provide userId or action=scan' }, { status: 400 });

    } catch (error) {
        console.error('Admin audit error:', error);
        return NextResponse.json({ error: 'Audit failed' }, { status: 500 });
    }
}

// POST: Manual coin adjustment with receipt (Admin Minting)
export async function POST(request: NextRequest) {
    try {
        const { userId, amount, reason, adminId } = await request.json();

        if (!userId || !amount || !reason || !adminId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Import the transaction function
        const { createCoinTransaction } = await import('@/lib/economy-security');

        const result = await createCoinTransaction({
            userId,
            amount: parseInt(amount),
            type: amount > 0 ? 'MINT' : 'SPEND',
            reason: `ADMIN_ACTION: ${reason}`,
            metadata: {
                adminId,
                adjustmentType: amount > 0 ? 'GRANT' : 'DEDUCT',
                timestamp: new Date().toISOString()
            }
        });

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            receipt: result.receipt,
            newBalance: result.newBalance
        });

    } catch (error) {
        console.error('Admin adjustment error:', error);
        return NextResponse.json({ error: 'Adjustment failed' }, { status: 500 });
    }
}
