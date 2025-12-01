import { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Target, Zap, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LeaderboardScreenProps {
    userData: any;
    onBack: () => void;
}

export default function LeaderboardScreen({ userData, onBack }: LeaderboardScreenProps) {
    const [activeTab, setActiveTab] = useState<'coins' | 'votes'>('coins');
    const [leaders, setLeaders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadLeaderboard();
    }, [activeTab]);

    const loadLeaderboard = async () => {
        setLoading(true);
        const column = activeTab === 'coins' ? 'coins' : 'votes_count';

        const { data } = await supabase
            .from('users')
            .select('id, username, wallet_address, email, level, xp, coins, votes_count, avatar_url')
            .order(column, { ascending: false })
            .limit(50);

        setLeaders(data || []);
        setLoading(false);
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
        if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
        if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
        return null;
    };

    const getUserRank = () => {
        return leaders.findIndex(l => l.id === userData.userId) + 1;
    };

    return (
        <div className="min-h-screen bg-black pb-20">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-white/10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center"
                            >
                                ←
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
                                <p className="text-sm text-mono-60">Top contributors</p>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('coins')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'coins'
                                        ? 'bg-white text-black'
                                        : 'text-mono-70 hover:text-white'
                                    }`}
                            >
                                <Zap className="w-4 h-4 inline mr-1" />
                                Coins
                            </button>
                            <button
                                onClick={() => setActiveTab('votes')}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'votes'
                                        ? 'bg-white text-black'
                                        : 'text-mono-70 hover:text-white'
                                    }`}
                            >
                                <Target className="w-4 h-4 inline mr-1" />
                                Votes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Your Rank Card */}
            {getUserRank() > 0 && (
                <div className="max-w-4xl mx-auto px-6 pt-6">
                    <div className="card-elevated p-6 border-2 border-white/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="text-3xl font-bold text-white">
                                    #{getUserRank()}
                                </div>
                                <div>
                                    <p className="text-sm text-mono-60">Your Rank</p>
                                    <p className="text-lg font-semibold text-white">{userData.username || 'You'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-mono-60">
                                    {activeTab === 'coins' ? 'Coins' : 'Votes'}
                                </p>
                                <p className="text-2xl font-bold text-white">
                                    {activeTab === 'coins' ? userData.coins : userData.votesCount}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Leaderboard */}
            <div className="max-w-4xl mx-auto px-6 py-6">
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="loading-spinner w-12 h-12 mx-auto" />
                        </div>
                    ) : (
                        leaders.map((user, index) => {
                            const rank = index + 1;
                            const isCurrentUser = user.id === userData.userId;

                            return (
                                <div
                                    key={user.id}
                                    className={`card p-6 ${isCurrentUser ? 'border-2 border-white/30' : 'hover:border-white/20'} transition-all`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {/* Rank */}
                                            <div className="w-12 flex items-center justify-center">
                                                {getRankIcon(rank) || (
                                                    <span className="text-2xl font-bold text-mono-50">#{rank}</span>
                                                )}
                                            </div>

                                            {/* Avatar */}
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xl font-bold text-white">
                                                        {(user.username || user.wallet_address || user.email)?.[0]?.toUpperCase()}
                                                    </span>
                                                )}
                                            </div>

                                            {/* User Info */}
                                            <div>
                                                <p className="font-semibold text-white">
                                                    {user.username || user.wallet_address?.slice(0, 10) + '...' || user.email}
                                                    {isCurrentUser && (
                                                        <span className="ml-2 text-xs bg-white/10 text-white px-2 py-1 rounded">You</span>
                                                    )}
                                                </p>
                                                <p className="text-sm text-mono-60">
                                                    Level {user.level} • {user.xp.toLocaleString()} XP
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-white">
                                                {activeTab === 'coins'
                                                    ? (user.coins || 0).toLocaleString()
                                                    : (user.votes_count || 0).toLocaleString()
                                                }
                                            </p>
                                            <p className="text-sm text-mono-60">
                                                {activeTab === 'coins' ? 'VQC' : 'votes'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
