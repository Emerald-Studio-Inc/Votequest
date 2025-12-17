'use client';

import { useState, useEffect } from 'react';
import { Shield, Users, AlertTriangle, Activity, Lock, Search, RefreshCw, Trash2, Coins } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CyberCard from '@/components/CyberCard';
import ArcadeButton from '@/components/ArcadeButton';
import { sfx } from '@/lib/sfx';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Simple "God Mode" protection - in production use real auth
    const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY || 'cyber-god-mode';

    const handleLogin = () => {
        if (password === ADMIN_KEY) {
            setIsAuthenticated(true);
            sfx.playSuccess();
            loadUsers();
        } else {
            alert('ACCESS DENIED');
        }
    };

    const loadUsers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (data) setUsers(data);
        setLoading(false);
    };

    const grantCoins = async (userId: string) => {
        if (!confirm('Grant 1000 Coins?')) return;

        try {
            await fetch('/api/admin/adjust-coins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount: 1000, reason: 'God Mode Grant' })
            });
            sfx.playSuccess();
            loadUsers(); // Refresh
        } catch (e) {
            alert('Failed to ecosystem hack');
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black font-mono">
                <div className="p-8 border border-red-500/50 bg-red-900/10 max-w-md w-full text-center">
                    <Shield className="w-16 h-16 text-red-500 mx-auto mb-4 animate-pulse" />
                    <h1 className="text-2xl font-bold text-red-500 mb-6 tracking-widest uppercase">RESTRICTED_ACCESS</h1>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-black border border-red-500/30 p-2 text-center text-red-400 mb-4 focus:outline-none focus:border-red-500"
                        placeholder="ENTER_GOD_KEY"
                    />
                    <ArcadeButton onClick={handleLogin} variant="magenta" className="w-full justify-center">
                        AUTHENTICATE
                    </ArcadeButton>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black font-mono pb-24 relative">
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="p-6 border-b border-red-500/20 bg-red-950/10 sticky top-0 backdrop-blur-md z-50">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Lock className="w-6 h-6 text-red-500" />
                        <h1 className="text-2xl font-bold text-red-500 tracking-widest">GOD_MODE_DASHBOARD</h1>
                    </div>
                    <ArcadeButton onClick={loadUsers} variant="cyan" size="sm">
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        REFRESH_DATA
                    </ArcadeButton>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <CyberCard className="p-4 border-red-500/30">
                        <div className="text-red-400 text-xs uppercase mb-1">TOTAL_USERS</div>
                        <div className="text-3xl font-bold text-white">{users.length}</div>
                    </CyberCard>
                </div>

                <div className="space-y-4">
                    <h2 className="text-red-400 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4" /> USER_DATABASE
                    </h2>

                    <div className="grid gap-4">
                        {users.map(user => (
                            <div key={user.id} className="p-4 border border-white/10 bg-white/5 hover:border-red-500/50 transition-colors flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 bg-red-900/20 border border-red-500/30 flex items-center justify-center text-red-500 font-bold">
                                        {user.level || 1}
                                    </div>
                                    <div>
                                        <div className="text-white font-bold">{user.email || 'ANONYMOUS'}</div>
                                        <div className="text-xs text-gray-500">{user.id}</div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 uppercase">COIN_BALANCE</div>
                                        <div className="text-yellow-400 font-bold">{user.coins || 0} VQC</div>
                                    </div>

                                    <div className="flex gap-2">
                                        <ArcadeButton
                                            size="sm"
                                            variant="lime"
                                            onClick={() => grantCoins(user.id)}
                                            tooltip="Grant 1000 Coins"
                                        >
                                            <Coins className="w-4 h-4" />
                                        </ArcadeButton>
                                        <ArcadeButton
                                            size="sm"
                                            variant="magenta"
                                            onClick={() => alert('Ban logic here')}
                                            tooltip="Ban User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </ArcadeButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
