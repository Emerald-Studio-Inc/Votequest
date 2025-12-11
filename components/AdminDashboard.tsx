import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, Users, Coins, FileText, TrendingUp, Calendar, Upload, Building2 } from 'lucide-react';

interface AdminDashboardProps {
    onBack: () => void;
    passphrase: string;
}

export default function AdminDashboard({ onBack, passphrase }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'organizations' | 'coins' | 'users'>('overview');
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalReceipts: 0,
        totalCoins: 0,
        totalProposals: 0,
        totalVotes: 0
    });
    const [receipts, setReceipts] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [exportLoading, setExportLoading] = useState(false);
    const [exportStats, setExportStats] = useState({ count: 0, totalValue: 0 });

    // Coin Adjustment Form
    const [coinForm, setCoinForm] = useState({
        userId: '',
        amount: 100,
        type: 'credit' as 'credit' | 'debit',
        reason: 'admin_adjustment'
    });

    useEffect(() => {
        loadAdminData();
        loadExportStats();
    }, []);

    const handleCoinAdjustment = async () => {
        if (!coinForm.userId || !coinForm.amount) return;
        setLoading(true);

        try {
            const response = await fetch('/api/admin/adjust-coins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-admin-passphrase': passphrase
                },
                body: JSON.stringify({
                    userId: coinForm.userId,
                    amount: coinForm.type === 'credit' ? coinForm.amount : -coinForm.amount,
                    reason: coinForm.reason
                })
            });

            if (!response.ok) throw new Error('Failed to adjust coins');

            alert(`Successfully ${coinForm.type}ed ${coinForm.amount} coins!`);
            setCoinForm({ ...coinForm, userId: '', amount: 100 });
            loadAdminData();

        } catch (error) {
            console.error('Error adjusting coins:', error);
            alert('Error adjusting coins. Ensure user ID is valid.');
        } finally {
            setLoading(false);
        }
    };

    const loadAdminData = async () => {
        setLoading(true);

        try {
            const response = await fetch('/api/admin/dashboard-data', {
                headers: {
                    'x-admin-passphrase': passphrase
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    alert('Session expired or unauthorized. Please re-login.');
                    onBack();
                    return;
                }
                throw new Error('Failed to fetch admin data');
            }

            const data = await response.json();

            setUsers(data.users || []);
            setReceipts(data.receipts || []);
            setOrganizations(data.organizations || []);
            setStats(data.stats || {
                totalUsers: 0, totalReceipts: 0, totalCoins: 0, totalProposals: 0, totalVotes: 0
            });

        } catch (error) {
            console.error('Error loading admin data:', error);
            alert('Failed to load dashboard data. Please Check logs.');
        } finally {
            setLoading(false);
        }
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

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-6 mt-8 mb-4">
                <div className="flex gap-4 border-b border-white/10">
                    {['overview', 'organizations', 'coins', 'users'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === tab ? 'text-white' : 'text-mono-60 hover:text-white'}`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-6 py-4">
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-5 gap-4 mb-8">
                            {/* ... existing stats ... */}
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
                                    <Building2 className="w-5 h-5 text-orange-400" />
                                    <p className="text-sm text-mono-60">Orgs</p>
                                </div>
                                <p className="text-3xl font-bold text-white">{organizations.length}</p>
                            </div>
                        </div>

                        {/* Recent Receipts Table (Existing) */}
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
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {receipts.slice(0, 20).map((receipt) => (
                                            <tr key={receipt.id} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="py-3 px-4 text-sm text-mono-70">
                                                    {new Date(receipt.created_at).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-white">
                                                    {receipt.users?.username || receipt.users?.email || 'Unknown'}
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
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'organizations' && (
                    <div className="card p-6">
                        <h2 className="text-xl font-bold text-white mb-4">Organizations Management</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-sm text-mono-60">Name</th>
                                        <th className="text-left py-3 px-4 text-sm text-mono-60">Type</th>
                                        <th className="text-left py-3 px-4 text-sm text-mono-60">Status</th>
                                        <th className="text-left py-3 px-4 text-sm text-mono-60">Members</th>
                                        <th className="text-left py-3 px-4 text-sm text-mono-60">Created</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {organizations.map((org) => (
                                        <tr key={org.id} className="border-b border-white/5 hover:bg-white/5">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {org.logo_url ? (
                                                        <img src={org.logo_url} alt="" className="w-8 h-8 rounded-full" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                            <Building2 className="w-4 h-4 text-white/50" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-white">{org.name}</p>
                                                        <p className="text-xs text-mono-60">{org.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-mono-70 capitalize">{org.type}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${org.verified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {org.verified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-white">
                                                {org.members_count || 0}
                                            </td>
                                            <td className="py-3 px-4 text-sm text-mono-60">
                                                {new Date(org.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {organizations.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-mono-60">
                                                No organizations found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'coins' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="card p-6 mb-8">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Coins className="w-5 h-5 text-yellow-400" />
                                Manual Coin Adjustment
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-mono-60 mb-1">Target User ID (UUID)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                        value={coinForm.userId}
                                        onChange={e => setCoinForm({ ...coinForm, userId: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-mono-60 mb-1">Amount</label>
                                        <input
                                            type="number"
                                            placeholder="100"
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                            value={coinForm.amount}
                                            onChange={e => setCoinForm({ ...coinForm, amount: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-mono-60 mb-1">Action</label>
                                        <select
                                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                            value={coinForm.type}
                                            onChange={e => setCoinForm({ ...coinForm, type: e.target.value as 'credit' | 'debit' })}
                                        >
                                            <option value="credit">Credit (+)</option>
                                            <option value="debit">Debit (-)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-mono-60 mb-1">Reason (for receipt)</label>
                                    <input
                                        type="text"
                                        placeholder="admin_adjustment_refund"
                                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-blue-500 text-white"
                                        value={coinForm.reason}
                                        onChange={e => setCoinForm({ ...coinForm, reason: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleCoinAdjustment}
                                        disabled={loading || !coinForm.userId || coinForm.amount <= 0}
                                        className="btn btn-primary w-full"
                                    >
                                        {loading ? 'Processing...' : `Confirm ${coinForm.type === 'credit' ? 'Credit' : 'Debit'} ${coinForm.amount} Coins`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
