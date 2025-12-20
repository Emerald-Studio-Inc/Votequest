
import React, { useState, useEffect } from 'react';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';
import Tooltip from './Tooltip';
import LoadingSpinner from './LoadingSpinner';
import { getUserVotingActivity, getUserCategoryBreakdown } from '@/lib/database';
import CyberCard from './CyberCard';

interface AnalyticsScreenProps {
    userData: any;
    proposals: any[];
}

const NEON_CYAN = '#0055FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';
const NEON_YELLOW = '#0033FF';

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

                // Add colors to categories (Neon palette)
                const colors = [NEON_CYAN, NEON_MAGENTA, NEON_LIME, NEON_YELLOW, '#FF9900', '#9900FF'];
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

    // Use actual voting power
    const impactScore = userData.votingPower || 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" message="ANALYZING_USER_DATA..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-32 animate-fade-in font-mono bg-black text-white relative">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 pt-24 pb-6 px-6">
                <h1 className="text-3xl font-bold tracking-widest uppercase glitch-text mb-2" data-text="ANALYTICS" style={{ color: NEON_CYAN }}>
                    ANALYTICS_CORE
                </h1>
                <p className="text-gray-500 text-xs uppercase tracking-wide animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    {'>'} User_Statistics_And_Incentive_Metrics
                </p>
            </div>

            {/* Key Metrics */}
            <div className="relative z-10 px-6 py-6 pb-24">
                <div className="grid grid-cols-2 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <Tooltip content="Percentage of proposals voted on" position="top">
                        <CyberCard className="h-full" hoverEffect={true} title="PARTICIPATION">
                            <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-4 h-4" style={{ color: NEON_CYAN }} />
                                <div className="text-gray-300 text-[9px] uppercase tracking-widest">COVERAGE</div>
                            </div>
                            <div className="text-3xl font-bold tracking-tight mb-1" style={{ textShadow: `0 0 10px ${NEON_CYAN}` }}>{participationRate}%</div>
                            <div className="text-gray-300 text-[9px] uppercase">{votedProposals || 0}/{totalProposals || 0} PROPOSALS</div>
                        </CyberCard>
                    </Tooltip>

                    <Tooltip content="Impact based on voting power" position="top">
                        <CyberCard className="h-full" hoverEffect={true} title="IMPACT_FACTOR">
                            <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-4 h-4" style={{ color: NEON_MAGENTA }} />
                                <div className="text-gray-400 text-[9px] uppercase tracking-widest">POWER_LEVEL</div>
                            </div>
                            <div className="text-3xl font-bold tracking-tight mb-1" style={{ textShadow: `0 0 10px ${NEON_MAGENTA}` }}>{impactScore}</div>
                            <div className="text-gray-400 text-[9px] uppercase">VOTING_WEIGHT</div>
                        </CyberCard>
                    </Tooltip>

                    <Tooltip content="Consecutive days with activity" position="bottom">
                        <CyberCard className="h-full" hoverEffect={true} title="STREAK_LOG">
                            <div className="flex items-center gap-2 mb-3">
                                <Award className="w-4 h-4" style={{ color: NEON_LIME }} />
                                <div className="text-gray-400 text-[9px] uppercase tracking-widest">CONSISTENCY</div>
                            </div>
                            <div className="text-3xl font-bold tracking-tight mb-1" style={{ textShadow: `0 0 10px ${NEON_LIME}` }}>{userData.streak}D</div>
                            <div className="text-gray-400 text-[9px] uppercase">CONSECUTIVE_DAYS</div>
                        </CyberCard>
                    </Tooltip>

                    <Tooltip content="Global ranking among all users" position="bottom">
                        <CyberCard className="h-full" hoverEffect={true} title="GLOBAL_RANK">
                            <div className="flex items-center gap-2 mb-3">
                                <Target className="w-4 h-4" style={{ color: NEON_YELLOW }} />
                                <div className="text-gray-400 text-[9px] uppercase tracking-widest">POSITION</div>
                            </div>
                            <div className="text-3xl font-bold tracking-tight mb-1" style={{ textShadow: `0 0 10px ${NEON_YELLOW}` }}>#{userData.globalRank}</div>
                            <div className="text-gray-400 text-[9px] uppercase">LEADERBOARD</div>
                        </CyberCard>
                    </Tooltip>
                </div>

                {/* Voting Activity Chart */}
                <CyberCard className="mb-8 p-6" title="ACTIVITY_GRAPH" hoverEffect={false}>
                    <h3 className="text-gray-300 text-xs uppercase mb-6 tracking-wide">VOTING_ACTIVITY (Last 7 Cycles)</h3>
                    <div className="flex items-end justify-between gap-2" style={{ height: '160px' }}>
                        {votingActivityData.map((day, idx) => {
                            const barHeightPx = maxVotes > 0 ? Math.max((day.votes / maxVotes) * 140, day.votes > 0 ? 20 : 4) : 4;
                            return (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full flex items-end justify-center relative" style={{ height: '140px' }}>
                                        <div
                                            className="w-full transition-all duration-300 group-hover:opacity-80 relative"
                                            style={{
                                                height: `${barHeightPx}px`,
                                                backgroundColor: day.votes > 0 ? NEON_CYAN : 'rgba(255,255,255,0.25)', // Visible inactive bars
                                                boxShadow: day.votes > 0 ? `0 0 10px ${NEON_CYAN}` : 'none'
                                            }}
                                            title={`${day.votes} votes`}
                                        >
                                            {/* Top accent */}
                                            {day.votes > 0 && (
                                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-white opacity-50" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-gray-600 text-[9px] font-mono">{day.date.split('/')[1]}/{day.date.split('/')[0]}</div>
                                </div>
                            );
                        })}
                    </div>
                </CyberCard>

                {/* Category Breakdown */}
                <CyberCard className="mb-8 p-6" title="CATEGORY_DISTRIBUTION" hoverEffect={false}>
                    <h3 className="text-gray-400 text-xs uppercase mb-6 tracking-wide">VOTE_ALLOCATION_BY_SECTOR</h3>

                    <div className="flex items-center justify-center mb-8">
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 100 100" className="transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                {categoryData.reduce((acc, cat, idx) => {
                                    const prevSum = categoryData.slice(0, idx).reduce((sum, c) => sum + c.percentage, 0);
                                    const circumference = 2 * Math.PI * 40; // radius = 40
                                    const offset = (prevSum / 100) * circumference;
                                    const dashArray = `${(cat.percentage / 100) * circumference} ${circumference}`;

                                    acc.push(
                                        <circle
                                            key={idx}
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke={cat.color}
                                            strokeWidth="6"
                                            strokeDasharray={dashArray}
                                            strokeDashoffset={-offset}
                                            className="transition-all opacity-90 hover:opacity-100 hover:stroke-[8]"
                                        />
                                    );
                                    return acc;
                                }, [] as JSX.Element[])}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <div className="text-white text-3xl font-bold tracking-tighter drop-shadow-md">{votedProposals}</div>
                                    <div className="text-gray-500 text-[8px] uppercase tracking-widest mt-1">TOTAL_VOTES</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {categoryData.map((cat) => (
                            <div key={cat.name} className="flex items-center gap-3 p-2 border border-transparent hover:border-white/10 bg-white/5 transition-colors">
                                <div className="w-2 h-2 shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: cat.color, boxShadow: `0 0 5px ${cat.color}` }}></div>
                                <div className="text-gray-300 text-[10px] uppercase font-bold tracking-wide">{cat.name}</div>
                                <div className="text-white text-[10px] font-mono ml-auto opacity-80" style={{ color: cat.color }}>{cat.percentage}%</div>
                            </div>
                        ))}
                    </div>
                </CyberCard>

                {/* XP Progress */}
                <CyberCard className="p-6" title="LEVEL_PROGRESSION" hoverEffect={false}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-gray-400 text-xs font-mono uppercase">LEVEL {userData.level}</div>
                        <div className="text-white text-xs font-mono font-bold">{userData.xp} / {userData.nextLevelXP} XP</div>
                    </div>

                    <div className="h-2 bg-black border border-white/20 w-full mb-3 relative overflow-hidden">
                        {/* Progress Bar */}
                        <div
                            className="h-full transition-all duration-1000 ease-out relative"
                            style={{
                                width: `${(userData.xp / userData.nextLevelXP) * 100}%`,
                                backgroundColor: NEON_LIME,
                                boxShadow: `0 0 10px ${NEON_LIME}`
                            }}
                        >
                            {/* Animated Shine */}
                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
                        </div>
                    </div>

                    <div className="text-gray-500 text-[10px] font-mono uppercase text-right">
                        {'>'} {userData.nextLevelXP - userData.xp} XP_REQUIRED_FOR_UPGRADE
                    </div>
                </CyberCard>
            </div >
        </div >
    );
};

export default AnalyticsScreen;
