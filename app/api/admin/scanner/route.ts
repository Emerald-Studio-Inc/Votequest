import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';
import { auditUserBalance, scanForUnreceiptedCoins } from '@/lib/economy-security';

/**
 * Anti-Hack Scanner - Scheduled Verification Job
 * 
 * This endpoint should be called periodically (via cron) to:
 * 1. Scan all users for balance discrepancies
 * 2. Flag accounts with unreceipted coins
 * 3. Log suspicious activity
 * 
 * Security: This endpoint requires a secret key for access.
 */

const SCANNER_SECRET = process.env.SCANNER_SECRET || 'vqc-scanner-2024';

export async function POST(request: NextRequest) {
    try {
        // Verify authorization
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== SCANNER_SECRET) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[ANTI-HACK SCANNER] Starting scan at', new Date().toISOString());

        // 1. Scan for unreceipted coins
        const scanResult = await scanForUnreceiptedCoins();

        // 2. Log flagged users
        const flaggedReport: any[] = [];

        for (const flagged of scanResult.flaggedUsers) {
            const audit = await auditUserBalance(flagged.userId);

            // Get user info
            const { data: user } = await supabaseAdmin
                .from('users')
                .select('email, username, created_at')
                .eq('id', flagged.userId)
                .single();

            const entry = {
                userId: flagged.userId,
                email: user?.email || 'unknown',
                username: user?.username || 'unknown',
                discrepancy: flagged.discrepancy,
                currentBalance: audit.currentBalance,
                calculatedBalance: audit.calculatedBalance,
                receiptCount: audit.receiptCount,
                createdAt: user?.created_at
            };

            flaggedReport.push(entry);

            // Log to database (optional: create audit_logs table)
            console.warn('[FLAGGED USER]', entry);
        }

        // 3. Optional: Auto-correct balances (DANGEROUS - only enable if sure)
        const autoCorrect = searchParams.get('autoCorrect') === 'true';
        let correctedCount = 0;

        if (autoCorrect && flaggedReport.length > 0) {
            for (const flagged of flaggedReport) {
                // Set balance to calculated (receipt-backed) amount
                const { error } = await supabaseAdmin
                    .from('users')
                    .update({ coins: flagged.calculatedBalance })
                    .eq('id', flagged.userId);

                if (!error) {
                    correctedCount++;
                    console.log(`[CORRECTED] User ${flagged.userId}: ${flagged.currentBalance} -> ${flagged.calculatedBalance}`);
                }
            }
        }

        const summary = {
            scanTime: new Date().toISOString(),
            totalFlagged: scanResult.flaggedUsers.length,
            flaggedUsers: flaggedReport,
            autoCorrectEnabled: autoCorrect,
            correctedCount
        };

        console.log('[ANTI-HACK SCANNER] Complete:', summary);

        return NextResponse.json(summary);

    } catch (error) {
        console.error('[ANTI-HACK SCANNER] Error:', error);
        return NextResponse.json({ error: 'Scanner failed' }, { status: 500 });
    }
}

// GET: Manual health check
export async function GET(request: NextRequest) {
    return NextResponse.json({
        status: 'READY',
        description: 'Anti-Hack Scanner endpoint. POST with secret to run scan.',
        lastCheck: new Date().toISOString()
    });
}
