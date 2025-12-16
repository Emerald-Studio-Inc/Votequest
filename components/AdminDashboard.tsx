import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Download, Users, Coins, FileText, TrendingUp, Calendar, Upload, Building2, ArrowLeft } from 'lucide-react';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';
import LoadingSpinner from './LoadingSpinner';

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_YELLOW = '#F0FF00';

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
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black font-mono relative overflow-hidden">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl" style={{ borderBottom: `1px solid ${NEON_CYAN}30` }}>
                <div className="max-w-7xl mx-auto px-4 py-4 md:px-8 md:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <ArcadeButton
                                onClick={onBack}
                                variant="cyan"
                                size="sm"
                                className="w-10 h-10 !p-0 flex items-center justify-center"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </ArcadeButton>
                            <div>
                                <h1 className="text-xl md:text-2xl font-bold uppercase tracking-widest glitch-text" data-text="ADMIN_CONSOLE" style={{ color: 'white' }}>
                                    ADMIN_CONSOLE
                                </h1>
                                <p className="text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                                    {'>'} SYSTEM_OVERRIDE_ACTIVE
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <ArcadeButton onClick={exportCSV} variant="magenta" size="sm" className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                <span className="hidden md:inline">EXPORT_CSV</span>
                            </ArcadeButton>
                            <ArcadeButton onClick={exportJSON} variant="cyan" size="sm" className="flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                <span className="hidden md:inline">EXPORT_JSON</span>
                            </ArcadeButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 mb-6 relative z-10">
                <div className="flex gap-1 border-b overflow-x-auto pb-0 scrollbar-hide" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    {['overview', 'organizations', 'coins', 'users'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`
                                py-3 px-6 text-xs font-mono font-bold uppercase tracking-widest transition-all relative
                                ${activeTab === tab ? 'text-white bg-white/5' : 'text-gray-600 hover:text-gray-300 hover:bg-white/5'}
                            `}
                            style={{
                                borderBottom: activeTab === tab ? `2px solid ${NEON_CYAN}` : '2px solid transparent',
                                color: activeTab === tab ? NEON_CYAN : undefined
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pb-32 relative z-10">
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                            <CyberCard className="p-4" cornerStyle="tech">
                                <div className="flex items-center gap-2 mb-2">
                                    <Users className="w-4 h-4" style={{ color: NEON_CYAN }} />
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">USERS</p>
                                </div>
                                <p className="text-2xl font-bold text-white font-mono">{stats.totalUsers}</p>
                            </CyberCard>
                            <CyberCard className="p-4" cornerStyle="tech">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText className="w-4 h-4" style={{ color: NEON_MAGENTA }} />
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">RECEIPTS</p>
                                </div>
                                <p className="text-2xl font-bold text-white font-mono">{stats.totalReceipts}</p>
                            </CyberCard>
                            <CyberCard className="p-4" cornerStyle="tech">
                                <div className="flex items-center gap-2 mb-2">
                                    <Coins className="w-4 h-4" style={{ color: NEON_YELLOW }} />
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">VQC_SUPPLY</p>
                                </div>
                                <p className="text-2xl font-bold text-white font-mono">{stats.totalCoins.toLocaleString()}</p>
                            </CyberCard>
                            <CyberCard className="p-4" cornerStyle="tech">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4" style={{ color: '#9900FF' }} />
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">PROPOSALS</p>
                                </div>
                                <p className="text-2xl font-bold text-white font-mono">{stats.totalProposals}</p>
                            </CyberCard>
                            <CyberCard className="p-4" cornerStyle="tech">
                                <div className="flex items-center gap-2 mb-2">
                                    <Building2 className="w-4 h-4" style={{ color: '#FF9900' }} />
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">ORGS</p>
                                </div>
                                <p className="text-2xl font-bold text-white font-mono">{organizations.length}</p>
                            </CyberCard>
                        </div>

                        {/* Recent Receipts List */}
                        <CyberCard title="RECENT_TRANSACTIONS" className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/10 text-[10px] uppercase text-gray-500 font-mono tracking-widest">
                                            <th className="py-3 px-4">TIMESTAMP</th>
                                            <th className="py-3 px-4">USER_ID</th>
                                            <th className="py-3 px-4">ACTION</th>
                                            <th className="py-3 px-4">AMOUNT</th>
                                            <th className="py-3 px-4">HASH_REF</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-xs font-mono">
                                        {receipts.slice(0, 20).map((receipt) => (
                                            <tr key={receipt.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <td className="py-3 px-4 text-gray-400">
                                                    {new Date(receipt.created_at).toLocaleString()}
                                                </td>
                                                <td className="py-3 px-4 text-white group-hover:text-cyan-400 transition-colors">
                                                    {receipt.users?.username || receipt.users?.email || 'Unknown'}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className="px-2 py-0.5 rounded-sm bg-white/10 border border-white/10 text-[10px] uppercase">
                                                        {receipt.reason}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 font-bold" style={{ color: NEON_YELLOW }}>
                                                    +{receipt.amount}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <code className="text-[10px] opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: NEON_CYAN }}>
                                                        {receipt.receipt_hash?.slice(0, 16)}...
                                                    </code>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CyberCard>
                    </>
                )}

                {activeTab === 'organizations' && (
                    <CyberCard title="ORG_MANAGEMENT" className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-[10px] uppercase text-gray-500 font-mono tracking-widest">
                                        <th className="py-3 px-4">ENTITY_NAME</th>
                                        <th className="py-3 px-4">TYPE</th>
                                        <th className="py-3 px-4">STATUS</th>
                                        <th className="py-3 px-4">MEMBERS</th>
                                        <th className="py-3 px-4">CREATED</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs font-mono">
                                    {organizations.map((org) => (
                                        <tr key={org.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    {org.logo_url ? (
                                                        <img src={org.logo_url} alt="" className="w-8 h-8 rounded-sm grayscale" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center">
                                                            <Building2 className="w-4 h-4 text-white/50" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="font-bold text-white uppercase tracking-wide">{org.name}</p>
                                                        <p className="text-[9px] text-gray-600">{org.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-400 capitalize">{org.type}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-0.5 text-[9px] uppercase font-bold border ${org.verified
                                                    ? 'border-green-500/30 text-green-400 bg-green-500/10'
                                                    : 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10'
                                                    }`}>
                                                    {org.verified ? 'VERIFIED' : 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-white">
                                                {org.members_count || 0}
                                            </td>
                                            <td className="py-3 px-4 text-gray-500">
                                                {new Date(org.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {organizations.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-gray-600 font-mono uppercase">
                                                NO_DATA_FOUND
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CyberCard>
                )}

                {activeTab === 'coins' && (
                    <div className="max-w-2xl mx-auto">
                        <CyberCard title="MANUAL_LEDGER_OVERRIDE" className="p-8">
                            <div className="flex items-center gap-3 mb-6 p-4 border border-yellow-500/20 bg-yellow-500/5">
                                <Coins className="w-5 h-5 text-yellow-400" />
                                <p className="text-xs text-yellow-200 font-mono uppercase">
                                    WARNING: DIRECT_DATABASE_MUTATION. THIS ACTION IS IRREVERSIBLE AND LOGGED.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Target User UUID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                                        className="w-full px-4 py-3 bg-black border text-white font-mono text-sm focus:outline-none transition-all placeholder:text-gray-800"
                                        style={{ borderColor: `${NEON_CYAN}40`, boxShadow: 'none' }}
                                        value={coinForm.userId}
                                        onChange={e => setCoinForm({ ...coinForm, userId: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Amount (VQC)</label>
                                        <input
                                            type="number"
                                            placeholder="100"
                                            className="w-full px-4 py-3 bg-black border text-white font-mono text-sm focus:outline-none transition-all"
                                            style={{ borderColor: `${NEON_CYAN}40` }}
                                            value={coinForm.amount}
                                            onChange={e => setCoinForm({ ...coinForm, amount: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Action Type</label>
                                        <select
                                            className="w-full px-4 py-3 bg-black border text-white font-mono text-sm focus:outline-none transition-all"
                                            style={{ borderColor: `${NEON_CYAN}40` }}
                                            value={coinForm.type}
                                            onChange={e => setCoinForm({ ...coinForm, type: e.target.value as 'credit' | 'debit' })}
                                        >
                                            <option value="credit">CREDIT (+)</option>
                                            <option value="debit">DEBIT (-)</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">Reason Code</label>
                                    <input
                                        type="text"
                                        placeholder="ADMIN_ADJUSTMENT_REF"
                                        className="w-full px-4 py-3 bg-black border text-white font-mono text-sm focus:outline-none transition-all"
                                        style={{ borderColor: `${NEON_CYAN}40` }}
                                        value={coinForm.reason}
                                        onChange={e => setCoinForm({ ...coinForm, reason: e.target.value })}
                                    />
                                </div>

                                <div className="pt-6">
                                    <ArcadeButton
                                        onClick={handleCoinAdjustment}
                                        disabled={loading || !coinForm.userId || coinForm.amount <= 0}
                                        variant={coinForm.type === 'credit' ? 'cyan' : 'magenta'}
                                        glow
                                        className="w-full py-4 text-center"
                                    >
                                        {loading ? 'PROCESSING...' : `CONFIRM ${coinForm.type.toUpperCase()} ${coinForm.amount} VQC`}
                                    </ArcadeButton>
                                </div>
                            </div>
                        </CyberCard>
                    </div>
                )}

                {activeTab === 'users' && (
                    <CyberCard title="USER_DATABASE" className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10 text-[10px] uppercase text-gray-500 font-mono tracking-widest">
                                        <th className="py-3 px-4">USER_ID / EMAIL</th>
                                        <th className="py-3 px-4">RANK</th>
                                        <th className="py-3 px-4 text-right">COINS</th>
                                        <th className="py-3 px-4 text-right">VOTING_POWER</th>
                                        <th className="py-3 px-4">JOINED</th>
                                        <th className="py-3 px-4">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="text-xs font-mono">
                                    {users.map((user) => (
                                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold">{user.username || user.email?.split('@')[0] || 'Unknown'}</span>
                                                    <span className="text-[10px] text-gray-600 font-mono">{user.email}</span>
                                                    <span className="text-[9px] text-gray-700 font-mono">{user.id}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                                        {user.level}
                                                    </div>
                                                    <span className="text-gray-500">#{user.global_rank}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CyberCard>
                )}


            </div>
        </div>
    );
}
