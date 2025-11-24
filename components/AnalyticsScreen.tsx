import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';
import Tooltip from './Tooltip';
import LoadingSpinner from './LoadingSpinner';
import { getUserVotingActivity, getUserCategoryBreakdown } from '@/lib/database';

interface AnalyticsScreenProps {
    userData: any;
    proposals: any[];
}

const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ userData, proposals }) => {
    const [loading, setLoading] = useState(true);
    const [votingActivityData, setVotingActivityData] = useState<any[]>([]);
    const [categoryData, setCategoryData] = useState<any[]>([]);

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!userData?.userId) return;

            setLoading(true);
            try {
                // Fetch real voting activity
                const activity = await getUserVotingActivity(userData.userId, 7);
                setVotingActivityData(activity);

                // Fetch real category breakdown
                const categories = await getUserCategoryBreakdown(userData.userId);

                // Add colors to categories
                const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
                const categoriesWithColors = categories.map((cat, idx) => ({
                    ...cat,
                    color: colors[idx % colors.length]
                }));
                setCategoryData(categoriesWithColors);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [userData?.userId]);

    const maxVotes = votingActivityData.length > 0 ? Math.max(...votingActivityData.map(d => d.votes)) : 1;

    // Calculate participation rate
    const totalProposals = proposals.length;
    const votedProposals = userData?.votedProposals?.length || 0;
    const participationRate = totalProposals > 0 ? Math.round((votedProposals / totalProposals) * 100) : 0;

    // Use actual voting power (no fake formulas)
    const impactScore = userData.votingPower || 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" message="Loading analytics..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 animate-fade-in">
            {/* Header */}
            <div className="relative z-10 pt-16 pb-6 px-6">
                <h1 className="text-3xl font-light text-white tracking-tight mb-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>Analytics</h1>
                <p className="text-zinc-500 text-sm font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>Your voting statistics and insights</p>
            </div>

            {/* Key Metrics */}
            <div className="relative z-10 px-6 py-6">
                <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <Tooltip content="Percentage of proposals voted on" position="top">
                        <div className="glass rounded-2xl p-5 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-4 h-4 text-blue-500" strokeWidth={1.5} />
                                <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Participation</div>
                            </div>
                            <div className="text-white text-3xl font-thin tracking-tight">{participationRate}%</div>
                            <div className="text-zinc-600 text-[10px] mt-1 font-mono">{votedProposals}/{totalProposals} proposals</div>
                        </div>
                    </Tooltip>

                    <Tooltip content="Impact based on voting power" position="top">
                        <div className="glass rounded-2xl p-5 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-4 h-4 text-violet-500" strokeWidth={1.5} />
                                <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Impact</div>
                            </div>
                            <div className="text-white text-3xl font-thin tracking-tight">{impactScore}</div>
                            <div className="text-zinc-600 text-[10px] mt-1 font-mono">Based on voting power</div>
                        </div>
                    </Tooltip>

                    <Tooltip content="Consecutive days with activity" position="bottom">
                        <div className="glass rounded-2xl p-5 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="w-4 h-4 text-emerald-500" strokeWidth={1.5} />
                                <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Streak</div>
                            </div>
                            <div className="text-white text-3xl font-thin tracking-tight">{userData.streak}d</div>
                            <div className="text-zinc-600 text-[10px] mt-1 font-mono">Consecutive days</div>
                        </div>
                    </Tooltip>

                    <Tooltip content="Global ranking among all users" position="bottom">
                        <div className="glass rounded-2xl p-5 hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-2 mb-3">
                                <Target className="w-4 h-4 text-pink-500" strokeWidth={1.5} />
                                <div className="text-zinc-500 text-[10px] uppercase tracking-widest">Rank</div>
                            </div>
                            <div className="text-white text-3xl font-thin tracking-tight">#{userData.globalRank}</div>
                            <div className="text-zinc-600 text-[10px] mt-1 font-mono">Global position</div>
                        </div>
                    </Tooltip>
                </div>

                {/* Voting Activity Chart - CSS Based */}
                <div className="glass rounded-2xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <h3 className="text-white text-sm font-light mb-6 tracking-wide">Voting Activity (7 Days)</h3>
                    <div className="flex items-end justify-between gap-3 h-40">
                        {votingActivityData.map((day, idx) => {
                            const heightPercent = (day.votes / maxVotes) * 100;
                            return (
                                <Tooltip key={idx} content={`${day.votes} votes on ${day.date}`} position="top">
                                    <div className="flex-1 flex flex-col items-center gap-3 group cursor-pointer">
                                        <div className="flex-1 w-full flex items-end relative">
                                            <div
                                                className="w-full bg-white/10 rounded-t-sm transition-all duration-500 group-hover:bg-white/20 relative overflow-hidden"
                                                style={{ height: `${heightPercent}%` }}
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent"></div>
                                            </div>
                                        </div>
                                        <div className="text-zinc-600 text-[10px] font-mono uppercase">{day.date}</div>
                                    </div>
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>

                {/* Category Breakdown - CSS Based */}
                <div className="glass rounded-2xl p-6 mb-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <h3 className="text-white text-sm font-light mb-6 tracking-wide">Voting by Category</h3>

                    <div className="flex items-center justify-center mb-8">
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 100 100" className="transform -rotate-90 drop-shadow-2xl">
                                {categoryData.reduce((acc, cat, idx) => {
                                    const prevSum = categoryData.slice(0, idx).reduce((sum, c) => sum + c.value, 0);
                                    const circumference = 2 * Math.PI * 40; // radius = 40
                                    const offset = (prevSum / 100) * circumference;
                                    const dashArray = `${(cat.value / 100) * circumference} ${circumference}`;

                                    acc.push(
                                        <Tooltip key={idx} content={`${cat.name}: ${cat.value}%`} position="top">
                                            <circle
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="none"
                                                stroke={cat.color}
                                                strokeWidth="6"
                                                strokeDasharray={dashArray}
                                                strokeDashoffset={-offset}
                                                className="transition-all opacity-80 hover:opacity-100 hover:stroke-[8] cursor-pointer"
                                            />
                                        </Tooltip>
                                    );
                                    return acc;
                                }, [] as JSX.Element[])}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <div className="text-white text-3xl font-thin tracking-tight">{votedProposals}</div>
                                    <div className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1">Total Votes</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {categoryData.map((cat) => (
                            <div key={cat.name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                                <div className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: cat.color }}></div>
                                <div className="text-zinc-400 text-xs font-light">{cat.name}</div>
                                <div className="text-white text-xs font-mono ml-auto opacity-60">{cat.value}%</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* XP Progress */}
                <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <h3 className="text-white text-sm font-light mb-4 tracking-wide">Level Progress</h3>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-zinc-400 text-xs font-mono">Level {userData.level}</div>
                        <div className="text-zinc-400 text-xs font-mono">{userData.xp} / {userData.nextLevelXP} XP</div>
                    </div>
                    <div className="h-0.5 bg-zinc-800 w-full mb-3 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-1000 ease-out"
                            style={{ width: `${(userData.xp / userData.nextLevelXP) * 100}%` }}
                        ></div>
                    </div>
                    <div className="text-zinc-600 text-[10px] font-mono">
                        {userData.nextLevelXP - userData.xp} XP until Level {userData.level + 1}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsScreen;
