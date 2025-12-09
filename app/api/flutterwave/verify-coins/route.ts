import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const packageType = searchParams.get('package');

        if (!packageType) {
            return NextResponse.json({ error: 'Missing package parameter' }, { status: 400 });
        }

        // Coin purchase webhook will handle recording the transaction
        // This endpoint just confirms successful payment and redirects

        // Redirect to dashboard with success
        return NextResponse.redirect(
            new URL(`/dashboard?coinsSuccess=true`, request.url)
        );

    } catch (error) {
        console.error('[FLUTTERWAVE] Coins verification error:', error);
        return NextResponse.redirect(
            new URL(`/dashboard?coinsError=true`, request.url)
        );
    }
}
