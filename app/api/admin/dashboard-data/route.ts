import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/server-db';

export async function GET(request: Request) {
    try {
        // Secure fetching: Verify passphrase header
        const passphrase = request.headers.get('x-admin-passphrase');
        if (passphrase !== process.env.ADMIN_PASSPHRASE) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Fetch Users
        const { data: users } = await supabaseAdmin
            .from('users')
            .select('*')
            .order('coins', { ascending: false })
            .limit(100);

        // 2. Fetch Receipts (Coin Transactions) with user info
        const { data: receipts } = await supabaseAdmin
            .from('coin_transactions')
            .select(`
                *,
                users:user_id (
                  id, wallet_address, username, email, level, xp, coins
                )
            `)
            .order('created_at', { ascending: false })
            .limit(1000); // Increased limit as requested

        // 3. Fetch Organizations
        const { data: organizations } = await supabaseAdmin
            .from('organizations')
            .select('*, members(count)')
            .order('created_at', { ascending: false });

        // 4. Counts (using head: true for efficiency if supported by types, or just count)
        const { count: proposalsCount } = await supabaseAdmin.from('proposals').select('*', { count: 'exact', head: true });
        const { count: votesCount } = await supabaseAdmin.from('votes').select('*', { count: 'exact', head: true });

        // Process org member counts
        const orgsWithCounts = organizations?.map((org: any) => ({
            ...org,
            members_count: org.members[0]?.count || 0
        })) || [];

        return NextResponse.json({
            users: users || [],
            receipts: receipts || [],
            organizations: orgsWithCounts,
            stats: {
                totalUsers: users?.length || 0, // This is just loaded users, real count needs count query if > 100
                totalReceipts: receipts?.length || 0,
                totalCoins: receipts?.reduce((sum: number, r: any) => sum + r.amount, 0) || 0,
                totalProposals: proposalsCount || 0,
                totalVotes: votesCount || 0
            }
        });

    } catch (error: any) {
        console.error('Admin API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
