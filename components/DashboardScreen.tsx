import React from 'react';
import { ArrowRight, Check, Users, Clock, Plus } from 'lucide-react';
import { ProposalWithOptions, Achievement, UserAchievement } from '@/lib/supabase';
import Badge from './Badge';
import Tooltip from './Tooltip';

interface DashboardScreenProps {
    userData: any;
    proposals: ProposalWithOptions[];
    achievements: Achievement[];
    userAchievements: UserAchievement[];
    onSelectProposal: (proposal: ProposalWithOptions) => void;
    onNavigate: (screen: string) => void;
    activeTab: string;
    onTabChange: (tab: 'overview' | 'proposals' | 'analytics' | 'settings') => void;
    animations: Record<string, boolean>;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({
    userData,
    proposals,
    achievements,
    userAchievements,
    onSelectProposal,
    onNavigate,
    animations
}) => {
    const calculateParticipation = (proposal: any) => {
        const totalVotes = proposal.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
        return proposal.participants > 0 ? Math.round((totalVotes / proposal.participants) * 100) : 0;
    };

    const hasVoted = (proposalId: string) => {
        return userData.votedProposals.includes(proposalId);
    };

    const formatTimeLeft = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return `${days}d ${hours}h`;
    };

    const progressPercent = (userData.xp / userData.nextLevelXP) * 100;

    return (
        <div className="min-h-screen pb-32 animate-fade-in">
            {/* Header */}
            <div className="relative z-10 pt-16 pb-8 px-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-light text-white tracking-tight mb-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>Portfolio</h1>
                        <p className="text-zinc-500 text-sm font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>Governance Dashboard</p>
                    </div>
                    <Tooltip content="Create New Proposal" position="left">
                        <button
                            onClick={() => onNavigate('create-proposal')}
                            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform animate-scale-in shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            <Plus className="w-5 h-5" strokeWidth={2} />
                        </button>
                    </Tooltip>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-4 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    {[
                        { label: 'Power', value: userData.votingPower.toLocaleString(), tooltip: 'Your Voting Weight' },
                        { label: 'Votes', value: userData.votesCount, tooltip: 'Total Votes Cast' },
                        { label: 'Streak', value: `${userData.streak}d`, tooltip: 'Consecutive Days Active' },
                        { label: 'Rank', value: `#${userData.globalRank}`, tooltip: 'Global Leaderboard Rank' }
                    ].map((stat, idx) => (
                        <Tooltip key={idx} content={stat.tooltip} position="bottom">
                            <div className="bg-black/20 p-4 hover:bg-black/40 transition-colors w-full h-full flex flex-col justify-center">
                                <div className="text-zinc-500 text-[10px] uppercase tracking-widest mb-2">{stat.label}</div>
                                <div className="text-white text-xl font-light tracking-tight">{stat.value}</div>
                            </div>
                        </Tooltip>
                    ))}
                </div>
            </div>

            {/* Reputation Section */}
            <div className="relative z-10 px-6 py-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="glass rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-500"></div>

                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div>
                            <div className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Reputation</div>
                            <div className="text-white text-2xl font-light">Level {userData.level}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-zinc-500 text-[10px] uppercase tracking-widest mb-1">Progress</div>
                            <div className="text-white text-2xl font-light">{Math.round(progressPercent)}%</div>
                        </div>
                    </div>
                    <div className="relative h-0.5 bg-zinc-800 w-full rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-white transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="mt-3 text-zinc-600 text-xs font-mono flex justify-between items-center">
                        <span>{userData.nextLevelXP - userData.xp} XP to next level</span>
                        <Tooltip content="Next Level Reward: 2x Voting Power" position="left">
                            <span className="text-white/50 hover:text-white cursor-help transition-colors">Reward Info</span>
                        </Tooltip>
                    </div>
                </div>
            </div>

            {/* Active Proposals */}
            <div className="relative z-10 px-6 py-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-light text-white">Active Proposals</h2>
                    <Tooltip content="See all proposals" position="left">
                        <button className="text-zinc-500 hover:text-white text-xs uppercase tracking-widest transition-colors flex items-center gap-2 group">
                            View All
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                        </button>
                    </Tooltip>
                </div>

                <div className="space-y-4">
                    {proposals.length === 0 ? (
                        <div className="text-center py-12 text-zinc-600 font-light">
                            No active proposals
                        </div>
                    ) : (
                        proposals.map((proposal: any, idx: number) => {
                            const participation = calculateParticipation(proposal);
                            const voted = hasVoted(proposal.id);

                            return (
                                <div
                                    key={proposal.id}
                                    onClick={() => onSelectProposal(proposal)}
                                    className="glass glass-hover rounded-2xl p-6 transition-all cursor-pointer group animate-slide-up"
                                    style={{ animationDelay: `${0.6 + (idx * 0.1)}s` }}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="text-zinc-600 text-[10px] font-mono tracking-wider">#{proposal.id.substring(0, 6)}</div>
                                                {voted && (
                                                    <Tooltip content="You have voted on this proposal" position="right">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse-slow"></div>
                                                    </Tooltip>
                                                )}
                                            </div>
                                            <div className="text-white text-lg font-light leading-snug mb-4 group-hover:text-zinc-200 transition-colors">{proposal.title}</div>
                                            <div className="flex items-center gap-6 text-xs text-zinc-500">
                                                <Tooltip content="Time Remaining" position="bottom">
                                                    <span className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                        {formatTimeLeft(proposal.end_date)}
                                                    </span>
                                                </Tooltip>
                                                <Tooltip content="Total Participants" position="bottom">
                                                    <span className="flex items-center gap-2">
                                                        <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                        {proposal.participants.toLocaleString()}
                                                    </span>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-white transition-colors duration-300 transform group-hover:translate-x-1" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-0.5 bg-zinc-800/50 overflow-hidden rounded-full">
                                            <div className="h-full bg-zinc-400 group-hover:bg-white transition-colors duration-500" style={{ width: `${participation}%` }} />
                                        </div>
                                        <div className="text-[10px] text-zinc-600 font-mono">{participation}% Turnout</div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Notifications */}
            {animations.voteSuccess && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-slide-down w-full max-w-sm px-6">
                    <div className="glass bg-black/80 rounded-xl px-6 py-4 flex items-center gap-4 shadow-2xl border-l-2 border-emerald-500">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
                        <div>
                            <div className="text-white text-sm font-medium tracking-wide">Vote Recorded</div>
                            <div className="text-zinc-500 text-xs font-mono mt-0.5">+250 XP earned</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardScreen;
