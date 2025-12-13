import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, Clock, Plus, Activity, TrendingUp, Zap, Award, Flame, ChevronRight, BarChart3, Vote, ArrowUpRight, Check, Building2, Terminal, Cpu } from 'lucide-react';
import { ProposalWithOptions, Achievement, UserAchievement } from '@/lib/supabase';
import Tooltip from './Tooltip';
import CoinBadge from './CoinBadge';
import NotificationBell from './NotificationBell';
import CoinsPurchaseModal from './CoinsPurchaseModal';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

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
    onSelectProposal,
    onNavigate,
    onTabChange,
    animations
}) => {
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [showCoinModal, setShowCoinModal] = useState(false);
    const [time, setTime] = useState(new Date());
    const [proposalFilter, setProposalFilter] = useState<'active' | 'history'>('active');

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const hasVoted = (proposalId: string) => {
        return userData.votedProposals.includes(proposalId);
    };

    const formatTimeLeft = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return { text: 'ENDED', urgent: false };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const urgent = diff < 24 * 60 * 60 * 1000;

        if (days > 0) return { text: `${days}D ${hours}H`, urgent };
        if (hours > 0) return { text: `${hours}H ${minutes}M`, urgent };
        return { text: `${minutes}M`, urgent: true };
    };

    const progressPercent = (userData.xp / userData.nextLevelXP) * 100;

    const displayedProposals = proposals.filter(p => {
        if (proposalFilter === 'active') return p.status === 'active';
        return p.status === 'closed';
    });

    // Neon color constants for inline styles
    const NEON_CYAN = '#00F0FF';
    const NEON_MAGENTA = '#FF003C';
    const NEON_LIME = '#39FF14';

    return (
        <div className="min-h-screen pb-32 relative overflow-hidden" style={{ backgroundColor: '#050505' }}>
            {/* Header - Arcade Style */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl" style={{ borderBottom: `1px solid ${NEON_CYAN}30` }}>
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Branding */}
                        <div className="flex items-center gap-4">
                            <div
                                className="w-10 h-10 flex items-center justify-center animate-pulse"
                                style={{ border: `1px solid ${NEON_CYAN}`, backgroundColor: `${NEON_CYAN}15` }}
                            >
                                <Vote className="w-6 h-6" style={{ color: NEON_CYAN }} />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight uppercase glitch-text" data-text="VoteQuest">
                                VoteQuest
                            </h1>
                        </div>

                        {/* Top Right Actions */}
                        <div className="flex items-center gap-4">
                            <div
                                className="hidden md:flex items-center gap-2 px-3 py-1 bg-black/50"
                                style={{ border: `1px solid ${NEON_CYAN}50` }}
                            >
                                <Cpu className="w-4 h-4" style={{ color: NEON_CYAN }} />
                                <span className="text-xs font-mono" style={{ color: NEON_CYAN }}>SYS.ONLINE</span>
                            </div>
                            <CoinBadge coins={userData.coins || 0} size="md" />
                            <NotificationBell userId={userData.userId} address={userData.address} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-8 relative z-10">

                {/* HUD / Mission Status */}
                <div className="mb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* User Profile HUD */}
                    <CyberCard className="lg:col-span-2" title="PILOT_DATA">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-mono mb-1" style={{ color: NEON_CYAN }}>ID: {userData.address?.slice(0, 8)}...</p>
                                <h2 className="text-3xl font-bold mb-4 text-white">WELCOME, VOTER</h2>

                                {/* Level Bar */}
                                <div className="max-w-md">
                                    <div className="flex justify-between text-xs font-mono mb-1" style={{ color: NEON_CYAN }}>
                                        <span>LVL {userData.level}</span>
                                        <span>{Math.round(progressPercent)}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-900 border border-gray-800 relative overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full"
                                            style={{
                                                width: `${progressPercent}%`,
                                                backgroundColor: NEON_CYAN,
                                                boxShadow: `0 0 10px ${NEON_CYAN}`
                                            }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-1 font-mono">NEXT RANK: {userData.nextLevelXP - userData.xp} XP REQ</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-right">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-mono">GLOBAL RANK</p>
                                    <p className="text-2xl font-bold" style={{ color: NEON_MAGENTA }}>#{userData.globalRank}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-mono">VOTING POWER</p>
                                    <p className="text-2xl font-bold" style={{ color: NEON_LIME }}>{userData.votingPower.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </CyberCard>

                    {/* Quick Actions HUD */}
                    <CyberCard title="ACTIONS">
                        <div className="flex flex-col gap-3 h-full justify-center">
                            <ArcadeButton variant="cyan" onClick={() => onNavigate('create-proposal')} className="w-full">
                                <Plus className="w-4 h-4 inline-block mr-2" />
                                NEW_PROPOSAL
                            </ArcadeButton>
                            <ArcadeButton variant="magenta" onClick={() => onNavigate('organization')} className="w-full">
                                <Building2 className="w-4 h-4 inline-block mr-2" />
                                ORG_ACCESS
                            </ArcadeButton>
                        </div>
                    </CyberCard>
                </div>

                {/* Proposals Section */}
                <div className="mb-8 flex items-end justify-between pb-2" style={{ borderBottom: `1px solid ${NEON_CYAN}30` }}>
                    <div>
                        <h3 className="text-xl font-bold" style={{ color: NEON_CYAN }}>ACTIVE_QUESTS</h3>
                        <p className="text-xs text-gray-400 font-mono">SELECT MISSION TO ENGAGE</p>
                    </div>

                    {/* Retro Filter Toggle */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setProposalFilter('active')}
                            className="px-4 py-1 text-xs font-mono border"
                            style={{
                                backgroundColor: proposalFilter === 'active' ? NEON_CYAN : 'transparent',
                                color: proposalFilter === 'active' ? '#000000' : '#6B7280',
                                borderColor: proposalFilter === 'active' ? NEON_CYAN : '#1F2937'
                            }}
                        >
                            ACTIVE
                        </button>
                        <button
                            onClick={() => setProposalFilter('history')}
                            className="px-4 py-1 text-xs font-mono border"
                            style={{
                                backgroundColor: proposalFilter === 'history' ? NEON_CYAN : 'transparent',
                                color: proposalFilter === 'history' ? '#000000' : '#6B7280',
                                borderColor: proposalFilter === 'history' ? NEON_CYAN : '#1F2937'
                            }}
                        >
                            HISTORY
                        </button>
                    </div>
                </div>

                {displayedProposals.length === 0 ? (
                    <div className="py-20 text-center border border-dashed border-gray-800">
                        <Terminal className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-mono">NO DATA FOUND IN SECTOR.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {displayedProposals.map((proposal, index) => {
                            const timeLeft = formatTimeLeft(proposal.end_date);
                            const voted = hasVoted(proposal.id);
                            const totalVotes = proposal.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);

                            return (
                                <CyberCard
                                    key={proposal.id}
                                    className="h-full flex flex-col cursor-pointer group"
                                    title={`WQ-${proposal.id.slice(0, 4)}`}
                                >
                                    <div onClick={() => onSelectProposal(proposal)} className="flex-1">
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="text-lg font-bold line-clamp-2 group-hover:text-neon-cyan transition-colors">
                                                {proposal.title}
                                            </h4>
                                            {voted && <Check className="w-5 h-5 text-neon-lime" />}
                                        </div>

                                        <p className="text-sm text-gray-300 font-mono mb-6 line-clamp-2">
                                            {proposal.description}
                                        </p>

                                        {/* Mock Visualization of Options */}
                                        <div className="space-y-2 mb-6">
                                            {proposal.options.slice(0, 2).map((opt: any) => (
                                                <div key={opt.id} className="text-xs font-mono">
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-gray-400">{opt.title}</span>
                                                        <span className="text-[var(--neon-cyan)]">
                                                            {totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0}%
                                                        </span>
                                                    </div>
                                                    <div className="h-1 bg-gray-800">
                                                        <div
                                                            className="h-full bg-[var(--neon-cyan)]/50"
                                                            style={{ width: `${totalVotes > 0 ? (opt.votes / totalVotes) * 100 : 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center text-xs font-mono">
                                        <div className="flex gap-4">
                                            <span className="flex items-center gap-1 text-[var(--neon-magenta)]">
                                                <Users className="w-3 h-3" /> {totalVotes}
                                            </span>
                                            <span className={`flex items-center gap-1 ${timeLeft.urgent ? 'text-[var(--neon-magenta)] animate-pulse' : 'text-gray-300'}`}>
                                                <Clock className="w-3 h-3" /> {timeLeft.text}
                                            </span>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-[var(--neon-cyan)] group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CyberCard>
                            );
                        })}
                    </div>
                )}
            </div>

            <CoinsPurchaseModal
                userId={userData.userId || ''}
                email={userData.email || ''}
                isOpen={showCoinModal}
                onClose={() => setShowCoinModal(false)}
                onSuccess={() => setShowCoinModal(false)}
            />
        </div>
    );
};

export default DashboardScreen;
