import React, { useState, useEffect } from 'react';
import { ArrowRight, Users, Clock, Plus, Activity, TrendingUp, Zap, Award, Flame, ChevronRight, BarChart3, Vote, ArrowUpRight, Check, Building2 } from 'lucide-react';
import { ProposalWithOptions, Achievement, UserAchievement } from '@/lib/supabase';
import Tooltip from './Tooltip';
import CoinBadge from './CoinBadge';
import NotificationBell from './NotificationBell';
import CoinsPurchaseModal from './CoinsPurchaseModal';

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

        if (diff <= 0) return { text: 'Ended', urgent: false };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const urgent = diff < 24 * 60 * 60 * 1000; // Less than 24 hours

        if (days > 0) {
            return { text: `${days}d ${hours}h`, urgent };
        } else if (hours > 0) {
            return { text: `${hours}h ${minutes}m`, urgent };
        } else {
            return { text: `${minutes}m`, urgent: true };
        }
    };

    const [proposalFilter, setProposalFilter] = useState<'active' | 'history'>('active');

    const progressPercent = (userData.xp / userData.nextLevelXP) * 100;

    // Filter proposals based on selection
    const displayedProposals = proposals.filter(p => {
        if (proposalFilter === 'active') return p.status === 'active';
        return p.status === 'closed'; // Capture history status
    });

    return (
        <div className="min-h-screen pb-32 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[120px] animate-float" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[140px] animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
            </div>

            {/* Header - Premium Minimal */}
            <div className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-5">
                    <div className="flex items-center justify-between">
                        {/* Logo & Brand */}
                        <div className="flex items-center gap-10">
                            <div className="flex items-center gap-3 animate-slide-right">
                                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
                                    <Vote className="w-5 h-5 text-black" strokeWidth={2.5} />
                                </div>
                                <h1 className="text-xl font-bold tracking-tight">VoteQuest</h1>
                            </div>

                            {/* Quick Stats - Inline (Hidden on Mobile) */}
                            <div className="hidden md:flex items-center gap-3 md:gap-6 lg:gap-8 text-xs md:text-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
                                <Tooltip content="Current Level" position="bottom">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Zap className="w-4 h-4 text-mono-60" strokeWidth={2} />
                                        <span className="text-mono-95 font-semibold">Level {userData.level}</span>
                                    </div>
                                </Tooltip>

                                <div className="w-px h-4 bg-white/10"></div>

                                <Tooltip content="Voting Streak" position="bottom">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Flame className="w-4 h-4 text-orange-400" strokeWidth={2} />
                                        <span className="text-mono-95 font-semibold">{userData.streak} days</span>
                                    </div>
                                </Tooltip>

                                <div className="w-px h-4 bg-white/10"></div>

                                <Tooltip content="Total Votes Cast" position="bottom">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Activity className="w-4 h-4 text-mono-60" strokeWidth={2} />
                                        <span className="text-mono-95 font-semibold">{userData.votesCount} votes</span>
                                    </div>
                                </Tooltip>
                            </div>
                        </div>

                        {/* Actions - Scrollable on Mobile */}
                        <div className="flex items-center gap-3 md:gap-4 overflow-x-auto no-scrollbar max-w-[60vw] md:max-w-none pl-2 pr-2 -mr-4 md:mr-0 mask-gradient-right">
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <CoinBadge coins={userData.coins || 0} size="md" />
                                <button
                                    onClick={() => setShowCoinModal(true)}
                                    className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-purple-500/20"
                                >
                                    <Plus className="w-5 h-5 fill-current" />
                                </button>
                            </div>

                            <div className="flex-shrink-0">
                                <NotificationBell userId={userData.userId} address={userData.address} />
                            </div>

                            <div className="w-px h-6 bg-white/10 flex-shrink-0 mx-1"></div>

                            <Tooltip content="Create New Proposal" position="bottom">
                                <button
                                    onClick={() => onNavigate('create-proposal')}
                                    className="btn btn-primary btn-sm group flex items-center justify-center flex-shrink-0 whitespace-nowrap px-4 bg-white text-black hover:bg-white/90 border-none"
                                    aria-label="Create new proposal"
                                >
                                    <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" strokeWidth={2.5} />
                                    <span className="font-bold ml-2">New Proposal</span>
                                </button>
                            </Tooltip>

                            <Tooltip content="Institutional Voting" position="bottom">
                                <button
                                    onClick={() => onNavigate('organization')}
                                    className="btn btn-secondary btn-sm group flex items-center justify-center flex-shrink-0 whitespace-nowrap px-4"
                                    style={{
                                        background: 'linear-gradient(135deg, #F4D58D 0%, #FFE999 100%)',
                                        border: 'none',
                                        boxShadow: '0 0 15px rgba(244, 213, 141, 0.3)',
                                        color: '#000000'
                                    }}
                                    aria-label="Organizations"
                                >
                                    <Building2 className="w-4 h-4" strokeWidth={2.5} style={{ color: '#000000' }} />
                                    <span className="ml-2" style={{
                                        color: '#000000',
                                        fontWeight: '700',
                                    }}>Organizations</span>
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-8 md:pt-12 relative z-10">

                {/* Hero Section */}
                <div className="mb-16 animate-slide-up">
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <p className="text-mono-50 text-sm mb-2 uppercase tracking-wider font-semibold">
                                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                            </p>
                            <h2 className="text-display mb-3">
                                Welcome back,
                                <br />
                                <span className="text-mono-70">Voter</span>
                            </h2>
                            <p className="text-body text-mono-60 max-w-2xl">
                                You're ranked <span className="text-mono-95 font-semibold">#{userData.globalRank}</span> globally with <span className="text-mono-95 font-semibold">{userData.votingPower.toLocaleString()}</span> voting power.
                            </p>
                        </div>
                    </div>

                    {/* Progress Overview Card */}
                    <div className="card card-elevated p-8 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative z-10">
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <h3 className="text-heading mb-2">Level Progress</h3>
                                    <p className="text-body-small text-mono-50">
                                        {userData.xp.toLocaleString()} / {userData.nextLevelXP.toLocaleString()} XP
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
                                    <TrendingUp className="w-4 h-4 text-green-400" strokeWidth={2} />
                                    <span className="text-sm font-semibold text-mono-95">{Math.round(progressPercent)}%</span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-3 bg-white/5 rounded-full overflow-hidden mb-6">
                                <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-white via-white/90 to-white/80 rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                >
                                    <div className="absolute inset-0 bg-white/20 animate-shimmer"></div>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                            </div>

                            {/* Stats Grid (Desktop) */}
                            <div className="
                                flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 -mx-4 px-4 
                                md:grid md:grid-cols-4 md:gap-6 md:pb-0 md:mx-0 md:px-0
                                scrollbar-hide
                            ">
                                {[
                                    { icon: Zap, label: 'Level', value: userData.level, color: 'text-mono-70' },
                                    { icon: Flame, label: 'Streak', value: `${userData.streak} days`, color: 'text-orange-400' },
                                    { icon: Activity, label: 'Votes', value: userData.votesCount, color: 'text-mono-70' },
                                    { icon: BarChart3, label: 'Power', value: userData.votingPower.toLocaleString(), color: 'text-mono-70' }
                                ].map((stat, i) => (
                                    <div key={i} className="
                                        snap-center flex-shrink-0 w-[40vw] sm:w-[30vw] md:w-auto
                                        flex items-center gap-3 p-4 md:p-0
                                        rounded-2xl bg-white/5 border border-white/5 md:bg-transparent md:border-none
                                        backdrop-blur-sm md:backdrop-filter-none
                                    ">
                                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                                            <stat.icon className={`w-5 h-5 ${stat.color}`} strokeWidth={2} />
                                        </div>
                                        <div>
                                            <p className="text-caption text-mono-50 uppercase tracking-widest">{stat.label}</p>
                                            <p className="text-xl font-bold whitespace-nowrap font-mono-num">{stat.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Proposals Header with Toggle */}
                <div className="flex items-center justify-between mb-6 md:mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div>
                        <h3 className="text-display font-bold mb-2">VoteQuest</h3>
                        <p className="text-body text-mono-60">Participate in governance</p>
                    </div>

                    {/* Toggle Switch */}
                    {/* Proposals Toggle */}
                    <div className="bg-black/40 backdrop-blur-xl p-1 rounded-xl border border-white/5 flex relative">
                        {/* Animated Background */}
                        <div
                            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-r from-amber-200 to-yellow-500 rounded-lg transition-all duration-300 shadow-lg shadow-amber-500/20`}
                            style={{
                                left: proposalFilter === 'active' ? '4px' : 'calc(50%)'
                            }}
                        />

                        <button
                            onClick={() => setProposalFilter('active')}
                            className={`relative flex-1 px-6 py-2 rounded-lg text-sm font-bold z-10 transition-colors duration-300 ${proposalFilter === 'active' ? 'text-black' : 'text-mono-60 hover:text-white'
                                }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setProposalFilter('history')}
                            className={`relative flex-1 px-6 py-2 rounded-lg text-sm font-bold z-10 transition-colors duration-300 ${proposalFilter === 'history' ? 'text-black' : 'text-mono-60 hover:text-white'
                                }`}
                        >
                            History
                        </button>
                    </div>
                </div>

                {/* Proposals Grid */}
                {displayedProposals.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 backdrop-blur-sm animate-scale-in">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                            <Vote className="w-8 h-8 text-mono-40" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-mono-80">
                            {proposalFilter === 'active' ? 'No Active Proposals' : 'No Past Proposals'}
                        </h3>
                        <p className="text-mono-50 max-w-md mx-auto">
                            {proposalFilter === 'active'
                                ? 'Check back later for new voting opportunities.'
                                : 'History is empty. Participate in active votes to see results here.'}
                        </p>
                        {proposalFilter === 'active' && (
                            <button
                                onClick={() => onNavigate('create-proposal')}
                                className="btn btn-primary mx-auto"
                            >
                                <Plus className="w-4 h-4" strokeWidth={2.5} />
                                Create Proposal
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {displayedProposals.map((proposal, index) => {
                            const timeLeft = formatTimeLeft(proposal.end_date);
                            const voted = hasVoted(proposal.id);
                            const totalVotes = proposal.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);

                            return (
                                <div
                                    key={proposal.id}
                                    className={`card card-interactive relative overflow-hidden group ${proposal.status !== 'active' ? 'opacity-90 grayscale-[0.3]' : ''}`}
                                    onClick={() => onSelectProposal(proposal)}
                                    onMouseEnter={() => setHoveredCard(proposal.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    {/* Hover Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    <div className="relative z-10 p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h4 className="text-subheading mb-2 line-clamp-2 group-hover:text-mono-100 transition-colors">
                                                    {proposal.title}
                                                </h4>
                                                <p className="text-body-small text-mono-50 line-clamp-2 select-text">
                                                    {proposal.description}
                                                </p>
                                            </div>
                                            {voted && (
                                                <Tooltip content="You voted" position="left">
                                                    <div className="flex-shrink-0 ml-3">
                                                        <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                                            <Check className="w-4 h-4 text-green-400" strokeWidth={2.5} />
                                                        </div>
                                                    </div>
                                                </Tooltip>
                                            )}
                                        </div>

                                        {/* Voting Options Preview */}
                                        <div className="space-y-2 mb-6">
                                            {proposal.options.slice(0, 2).map((option: any) => {
                                                const percentage = totalVotes > 0
                                                    ? Math.round((option.votes / totalVotes) * 100)
                                                    : 0;

                                                return (
                                                    <div key={option.id} className="relative">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <span className="text-caption text-mono-60 uppercase">
                                                                {option.title}
                                                            </span>
                                                            <span className="text-caption text-mono-70 font-semibold">
                                                                {percentage}%
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-white/20 rounded-full transition-all duration-500"
                                                                style={{ width: `${percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {proposal.options.length > 2 && (
                                                <p className="text-caption text-mono-40 italic">
                                                    +{proposal.options.length - 2} more options
                                                </p>
                                            )}
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-4">
                                                <Tooltip content="Total Participants" position="top">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="w-4 h-4 text-mono-50" strokeWidth={2} />
                                                        <span className="text-sm text-mono-70 font-medium font-mono-num">
                                                            {totalVotes.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </Tooltip>

                                                <div className={`flex items-center gap-1.5 ${timeLeft.urgent ? 'text-orange-400' : 'text-mono-50'}`}>
                                                    <Clock className="w-4 h-4" strokeWidth={2} />
                                                    <span className="text-sm font-medium font-mono-num">
                                                        {timeLeft.text}
                                                    </span>
                                                </div>
                                            </div>

                                            <ArrowUpRight
                                                className="w-5 h-5 text-mono-40 group-hover:text-mono-95 transition-all group-hover:translate-x-1 group-hover:-translate-y-1"
                                                strokeWidth={2}
                                            />
                                        </div>
                                    </div>
                                </div>
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
                onSuccess={() => {
                    setShowCoinModal(false);
                }}
            />
        </div>
    );
};

export default DashboardScreen;
