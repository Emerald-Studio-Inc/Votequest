import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, Users, Coins, FileText, TrendingUp, Calendar, Upload } from 'lucide-react';

interface AdminDashboardProps {
    onBack: () => void;
}

export default function AdminDashboard({ onBack }: AdminDashboardProps) {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalReceipts: 0,
        totalCoins: 0,
        totalProposals: 0,
        totalVotes: 0
    });
    const [receipts, setReceipts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);
    const [exportStats, setExportStats] = useState({ count: 0, totalValue: 0 });

    useEffect(() => {
        loadAdminData();
        loadExportStats();
    }, []);

    const loadAdminData = async () => {
        setLoading(true);

        // Fetch all receipts with user info
        const { data: receiptsData } = await supabase
            .from('coin_transactions')
            .select(`
        *,
        users:user_id (
          id,
          wallet_address,
          username,
          email,
          level,
          xp,
          coins
        )
      `)
            .order('created_at', { ascending: false })
            .limit(1000);

        // Fetch user stats
        const { data: usersData } = await supabase
            .from('users')
            .select('*')
            .order('coins', { ascending: false })
            .limit(100);

        // Fetch proposals count
        const { count: proposalsCount } = await supabase
            .from('proposals')
            .select('*', { count: 'exact', head: true });

        // Fetch votes count
        const { count: votesCount } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true });

        if (receiptsData) setReceipts(receiptsData);
        if (usersData) setUsers(usersData);

        setStats({
            totalUsers: usersData?.length || 0,
            totalReceipts: receiptsData?.length || 0,
            totalCoins: receiptsData?.reduce((sum, r) => sum + r.amount, 0) || 0,
            totalProposals: proposalsCount || 0,
            totalVotes: votesCount || 0
        });

        setLoading(false);
    };

    const exportCSV = () => {
        const csv = [
            ['Date', 'User', 'Amount', 'Reason', 'Receipt Hash', 'Metadata'].join(','),
            ...receipts.map(r => [
                new Date(r.created_at).toISOString(),
                r.users?.wallet_address || r.users?.email || 'Unknown',
                r.amount,
                r.reason,
                r.receipt_hash,
                JSON.stringify(r.action_metadata || {})
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-receipts-${Date.now()}.csv`;
        a.click();
    };

    const exportJSON = () => {
        const data = {
            exported_at: new Date().toISOString(),
            stats,
            receipts: receipts.map(r => ({
                ...r,
                user: r.users
            })),
            users
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-data-${Date.now()}.json`;
        a.click();
    };

    // Load blockchain export statistics
    const loadExportStats = async () => {
        try {
            const response = await fetch('/api/admin/export-receipts');
            const data = await response.json();
            setExportStats({ count: data.count, totalValue: data.totalValue });
        } catch (error) {
            console.error('Error loading export stats:', error);
        }
    };

    // Export receipts to blockchain (manual download for now)
    const exportToBlockchain = async () => {
        setExportLoading(true);
        try {
            // 1. Get unexported receipts
            const response = await fetch('/api/admin/export-receipts');
            const data = await response.json();

            if (data.count === 0) {
                alert('No receipts to export. All receipts have been exported!');
                setExportLoading(false);
                return;
            }

            // 2. Download receipts as JSON for manual blockchain submission
            const exportData = {
                exported_at: new Date().toISOString(),
                batch_size: data.count,
                total_value: data.totalValue,
                receipts: data.receipts
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `blockchain-receipts-${Date.now()}.json`;
            a.click();

            alert(
                `✅ Downloaded ${data.count} receipts for blockchain export!\n\n` +
                `Total Value: ${data.totalValue} VQC\n\n` +
                `Next Steps:\n` +
                `1. Review the JSON file\n` +
                `2. Submit to blockchain contract\n` +
                `3. Mark as exported with transaction hash`
            );

            // Optional: Refresh stats after download
            setTimeout(loadExportStats, 1000);

        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed: ' + error);
        } finally {
            setExportLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="loading-spinner w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
                            >
                                ←
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                                <p className="text-sm text-mono-60">Platform Analytics & Receipts</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button onClick={exportCSV} className="btn btn-secondary flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                            <button onClick={exportJSON} className="btn btn-primary flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Export JSON
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-5 gap-4 mb-8">
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            <p className="text-sm text-mono-60">Users</p>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <FileText className="w-5 h-5 text-green-400" />
                            <p className="text-sm text-mono-60">Receipts</p>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalReceipts}</p>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Coins className="w-5 h-5 text-yellow-400" />
                            <p className="text-sm text-mono-60">Total Coins</p>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalCoins.toLocaleString()}</p>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            <p className="text-sm text-mono-60">Proposals</p>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalProposals}</p>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-pink-400" />
                            <p className="text-sm text-mono-60">Votes</p>
                        </div>
                        <p className="text-3xl font-bold text-white">{stats.totalVotes}</p>
                    </div>
                </div>

                {/* Blockchain Export Section */}
                <div className="card p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Blockchain Export
                    </h2>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="p-4 bg-white/5 rounded-lg">
                            <p className="text-sm text-mono-60 mb-1">Unexported Receipts</p>
                            <p className="text-3xl font-bold text-white">{exportStats.count}</p>
                            <p className="text-xs text-mono-50 mt-1">Ready for blockchain</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-lg">
                            <p className="text-sm text-mono-60 mb-1">Total Value</p>
                            <p className="text-3xl font-bold text-yellow-400">{exportStats.totalValue.toLocaleString()} VQC</p>
                            <p className="text-xs text-mono-50 mt-1">Combined coin value</p>
                        </div>
                    </div>

                    <button
                        onClick={exportToBlockchain}
                        disabled={exportLoading || exportStats.count === 0}
                        className="btn btn-primary w-full flex items-center justify-center gap-2"
                    >
                        {exportLoading ? (
                            <>
                                <div className="loading-spinner w-4 h-4" />
                                Downloading...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4" />
                                Export {exportStats.count} Receipts to Blockchain
                            </>
                        )}
                    </button>

                    <p className="text-xs text-mono-60 mt-3 text-center">
                        Downloads receipts as JSON. Submit to blockchain contract manually, then mark as exported.
                    </p>
                </div>

                {/* Top Users */}
                <div className="card p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Top Users by Coins</h2>
                    <div className="space-y-3">
                        {users.slice(0, 10).map((user, idx) => (
                            <div key={user.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold text-mono-50">#{idx + 1}</span>
                                    <div>
                                        <p className="font-semibold text-white">
                                            {user.username || user.wallet_address?.slice(0, 10) + '...' || user.email}
                                        </p>
                                        <p className="text-sm text-mono-60">Level {user.level} • {user.xp} XP</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-yellow-400">{user.coins || 0} VQC</p>
                                    <p className="text-sm text-mono-60">{user.votes_count || 0} votes</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Receipts */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Recent Receipts</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-sm text-mono-60">Date</th>
                                    <th className="text-left py-3 px-4 text-sm text-mono-60">User</th>
                                    <th className="text-left py-3 px-4 text-sm text-mono-60">Action</th>
                                    <th className="text-left py-3 px-4 text-sm text-mono-60">Amount</th>
                                    <th className="text-left py-3 px-4 text-sm text-mono-60">Receipt Hash</th>
                                    <th className="text-left py-3 px-4 text-sm text-mono-60">Metadata</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receipts.slice(0, 50).map((receipt) => (
                                    <tr key={receipt.id} className="border-b border-white/5 hover:bg-white/5">
                                        <td className="py-3 px-4 text-sm text-mono-70">
                                            {new Date(receipt.created_at).toLocaleString()}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-white">
                                            {receipt.users?.username || receipt.users?.wallet_address?.slice(0, 8) + '...' || 'Unknown'}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="badge badge-sm">{receipt.reason}</span>
                                        </td>
                                        <td className="py-3 px-4 text-sm font-bold text-yellow-400">
                                            +{receipt.amount}
                                        </td>
                                        <td className="py-3 px-4">
                                            <code className="text-xs text-green-400">
                                                {receipt.receipt_hash?.slice(0, 16)}...
                                            </code>
                                        </td>
                                        <td className="py-3 px-4 text-xs text-mono-60">
                                            {receipt.action_metadata?.proposalTitle ||
                                                receipt.action_metadata?.title ||
                                                'No metadata'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
