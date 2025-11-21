import React from 'react';
import { ArrowRight, Check, Users, Clock } from 'lucide-react';
import { ProposalWithOptions, Achievement, UserAchievement } from '@/lib/supabase';
import Badge from './Badge';

interface DashboardScreenProps {
    userData: any; // Using any for now to avoid circular dependency or type duplication, ideally import UserData type
    proposals: ProposalWithOptions[];
    achievements: Achievement[];
    userAchievements: UserAchievement[];
    onSelectProposal: (proposal: ProposalWithOptions) => void;
    onNavigate: (screen: string) => void;
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
        <div className="min-h-screen bg-zinc-950 pb-24">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 border-b border-zinc-900">
                <div className="px-6 pt-16 pb-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-light text-white tracking-tight mb-1">Portfolio</h1>
                            <p className="text-zinc-500 text-sm">Governance Dashboard</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Create Proposal Button */}
                            <button
                                onClick={() => onNavigate('create-proposal')}
                                className="px-4 py-2 bg-zinc-100 hover:bg-white text-black rounded text-sm font-medium transition-colors"
                            >
                                Create Proposal
                            </button>
                            <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-400 text-sm font-mono">
                                Lv.{userData.level}
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-4 gap-px bg-zinc-900 border border-zinc-900 rounded overflow-hidden">
                        {[
                            { label: 'Power', value: userData.votingPower.toLocaleString() },
                            { label: 'Votes', value: userData.votesCount },
                            { label: 'Streak', value: `${userData.streak}d` },
                            { label: 'Rank', value: `#${userData.globalRank}` }
                        ].map((stat, idx) => (
                            <div key={idx} className="bg-zinc-950 p-4">
                                <div className="text-zinc-500 text-xs mb-2 uppercase tracking-wider">{stat.label}</div>
                                <div className="text-white text-2xl font-light">{stat.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reputation Section */}
            <div className="relative z-10 border-b border-zinc-900">
                <div className="px-6 py-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Reputation</div>
                            <div className="text-white text-2xl font-light">Level {userData.level}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Progress</div>
                            <div className="text-white text-2xl font-light">{Math.round(progressPercent)}%</div>
                        </div>
                    </div>
                    <div className="relative h-1 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-1000"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="mt-2 text-zinc-600 text-xs">
                        {userData.nextLevelXP - userData.xp} XP remaining to Level {userData.level + 1}
                    </div>
                </div>
            </div>

            {/* Badges Section */}
            <div className="relative z-10 border-b border-zinc-900">
                <div className="px-6 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-light text-white">Achievements</h2>
                        <div className="text-zinc-500 text-xs font-mono">
                            {achievements.filter(a => userAchievements.some(ua => ua.achievement_id === a.id)).length}/{achievements.length}
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {achievements.map(achievement => (
                            <Badge
                                key={achievement.id}
                                achievement={achievement}
                                earned={userAchievements.some(ua => ua.achievement_id === achievement.id)}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Proposals */}
            <div className="relative z-10 border-b border-zinc-900">
                <div className="px-6 py-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-light text-white">Active Proposals</h2>
                        <button className="text-zinc-500 hover:text-white text-sm transition-colors flex items-center gap-1">
                            <span>View All</span>
                            <ArrowRight className="w-3 h-3" strokeWidth={2} />
                        </button>
                    </div>

                    <div className="space-y-3">
                        {proposals.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500">
                                Loading proposals...
                            </div>
                        ) : (
                            proposals.map((proposal: any) => {
                                const participation = calculateParticipation(proposal);
                                const voted = hasVoted(proposal.id);

                                return (
                                    <div
                                        key={proposal.id}
                                        onClick={() => onSelectProposal(proposal)}
                                        className="bg-zinc-900/50 hover:bg-zinc-900 backdrop-blur-xl border border-zinc-800 hover:border-zinc-700 rounded p-5 transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="text-zinc-600 text-xs font-mono">{proposal.id.substring(0, 8)}...</div>
                                                    {voted && (
                                                        <div className="flex items-center gap-1 text-xs text-green-500">
                                                            <Check className="w-3 h-3" strokeWidth={2} />
                                                            <span>Voted</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-white font-light mb-3">{proposal.title}</div>
                                                <div className="flex items-center gap-6 text-xs text-zinc-500">
                                                    <span className="flex items-center gap-2">
                                                        <Users className="w-3 h-3" strokeWidth={1.5} />
                                                        {proposal.participants.toLocaleString()}
                                                    </span>
                                                    <span className="flex items-center gap-2">
                                                        <Clock className="w-3 h-3" strokeWidth={1.5} />
                                                        {formatTimeLeft(proposal.end_date)}
                                                    </span>
                                                </div>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 group-hover:translate-x-1 transition-all mt-1" strokeWidth={2} />
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500" style={{ width: `${participation}%` }} />
                                            </div>
                                            <div className="text-xs text-zinc-500 font-mono">{participation}%</div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* Objectives */}
            <div className="relative z-10">
                <div className="px-6 py-8">
                    <h2 className="text-lg font-light text-white mb-6">Daily Objectives</h2>
                    <div className="space-y-3">
                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded p-5">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    <div>
                                        <div className="text-white text-sm mb-0.5">Active Participation</div>
                                        <div className="text-zinc-500 text-xs">Vote on 3 active proposals</div>
                                    </div>
                                </div>
                                <div className="text-zinc-500 text-xs font-mono">{Math.min(userData.votedProposals.length, 3)}/3</div>
                            </div>
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${(Math.min(userData.votedProposals.length, 3) / 3) * 100}%` }} />
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded p-5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <div>
                                        <div className="text-white text-sm mb-0.5">Consistency Bonus</div>
                                        <div className="text-zinc-500 text-xs">{userData.streak}-day active streak</div>
                                    </div>
                                </div>
                                <div className="text-green-500 text-xs">Active</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-900 z-20">
                <div className="px-6 py-4">
                    <div className="flex justify-around items-center max-w-md mx-auto">
                        {[
                            { label: 'Overview', active: true },
                            { label: 'Proposals', active: false },
                            { label: 'Analytics', active: false },
                            { label: 'Settings', active: false }
                        ].map((item, idx) => (
                            <button key={idx} className={`text-xs uppercase tracking-wider transition-colors ${item.active ? 'text-white' : 'text-zinc-600'}`}>
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {animations.voteSuccess && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-slide-down">
                    <div className="bg-zinc-900 backdrop-blur-xl border border-zinc-800 rounded px-6 py-4 flex items-center gap-3 shadow-2xl">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div>
                            <div className="text-white text-sm font-medium">Vote recorded successfully</div>
                            <div className="text-zinc-500 text-xs">+250 XP earned</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardScreen;
