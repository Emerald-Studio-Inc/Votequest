'use client';

import { useState, useEffect } from 'react';
import { Shield, Users, AlertTriangle, Activity, Lock, Search, RefreshCw, Trash2, Coins } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import CyberCard from '@/components/CyberCard';
import CyberButton from '@/components/CyberButton';
import { sfx } from '@/lib/sfx';

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [users, setUsers] = useState<any[]>([]);
    const [orgs, setOrgs] = useState<any[]>([]);
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

        // Load Orgs
        const { data: orgData } = await supabase
            .from('organizations')
            .select('*')
            .order('created_at', { ascending: false });

        if (orgData) setOrgs(orgData);

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
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)] font-mono">
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
                    <CyberButton onClick={handleLogin} className="w-full justify-center">
                        <Shield className="w-4 h-4 mr-2 inline-block" />
                        ACCESS_SYSTEM
                    </CyberButton>
                </div>
            </div>
        );
    }

    const adjustCoins = async (userId: string, amount: number) => {
        try {
            const res = await fetch('/api/admin/coins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, amount })
            });

            if (res.ok) {
                // Refresh data
                const updatedUsers = users.map(u =>
                    u.id === userId ? { ...u, coins: (u.coins || 0) + amount } : u
                );
                setUsers(updatedUsers);
            }
        } catch (error) {
            console.error('Failed to adjust coins:', error);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-void)] font-mono pb-24 relative">
            <div className="fixed inset-0 bg-[linear-gradient(rgba(255,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <div className="p-6 border-b border-red-500/20 bg-red-950/10 sticky top-0 backdrop-blur-md z-50">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Lock className="w-6 h-6 text-red-500" />
                        <h1 className="text-2xl font-bold text-red-500 tracking-widest">GOD_MODE_DASHBOARD</h1>
                    </div>
                    <CyberButton onClick={loadUsers} className="!py-1 !px-3">
                        <Activity className="w-3 h-3 mr-2 inline-block" />
                        REFRESH_DATA
                    </CyberButton>
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
                                        <CyberButton
                                            onClick={() => adjustCoins(user.id, 100)}
                                            className="!py-1 !px-2 flex-1 justify-center"
                                        >
                                            +100
                                        </CyberButton>
                                        <CyberButton
                                            onClick={() => adjustCoins(user.id, -100)}
                                            className="!py-1 !px-2 flex-1 justify-center opacity-60"
                                        >
                                            -100
                                        </CyberButton>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-8 mt-8 border-t border-white/5">
                    <h2 className="text-red-400 text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4" /> ORGANIZATION_DATABASE
                    </h2>

                    <div className="grid gap-4">
                        {orgs.length > 0 ? orgs.map(org => (
                            <div key={org.id} className="p-4 border border-white/10 bg-white/5 hover:border-red-500/50 transition-colors flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-10 h-10 bg-cyan-900/20 border border-cyan-500/30 flex items-center justify-center text-cyan-500 font-bold">
                                        ORG
                                    </div>
                                    <div>
                                        <div className="text-white font-bold">{org.name}</div>
                                        <div className="text-xs text-gray-500">{org.id}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-gray-500 uppercase">TYPE</div>
                                    <div className="text-cyan-400 font-bold">{org.type || 'UNKNOWN'}</div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-gray-500">NO ORGANIZATIONS DETECTED</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
