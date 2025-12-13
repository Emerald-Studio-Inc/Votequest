import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, Check, Shield, TrendingUp, Activity, AlertCircle, CheckCircle2, ChevronRight, Share2, Zap, Star } from 'lucide-react';
import { ProposalWithOptions } from '@/lib/supabase';
import Tooltip from './Tooltip';
import ShareModal from './ShareModal';
import VoteCaptcha from './VoteCaptcha';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

interface ProposalDetailScreenProps {
    proposal: ProposalWithOptions;
    onBack: () => void;
    onVote: (proposalId: string, optionId: string, captchaToken: string) => Promise<any>;
    loading: boolean;
    hasVoted: boolean;
    selectedOption: string | null;
    setSelectedOption: (optionId: string | null) => void;
    userId: string;
    captchaToken: string;
    setCaptchaToken: (token: string) => void;
}

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

const ProposalDetailScreen: React.FC<ProposalDetailScreenProps> = ({
    proposal,
    onBack,
    onVote,
    loading,
    hasVoted,
    selectedOption,
    setSelectedOption,
    userId,
    captchaToken,
    setCaptchaToken
}) => {
    const [hoveredOption, setHoveredOption] = useState<string | null>(null);
    const [showVoteAnimation, setShowVoteAnimation] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [boostLoading, setBoostLoading] = useState(false);
    const [highlightLoading, setHighlightLoading] = useState(false);

    // TODO: Import toast properly
    const [boosted, setBoosted] = useState(false);

    const toast = {
        success: (title: string, msg: string) => alert(`${title}\n${msg}`),
        error: (title: string, msg: string) => alert(`${title}\n${msg}`)
    };

    const handleBoost = async () => {
        if (!hasVoted) {
            toast.error('Vote Required', 'You must vote before boosting.');
            return;
        }
        setBoostLoading(true);
        try {
            const response = await fetch('/api/coins/boost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    proposalId: proposal.id,
                    optionId: selectedOption // We might need to fetch the voted option if not in state
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            setBoosted(true);
            toast.success('Boost Activated!', 'Your vote power has been doubled.');
        } catch (error: any) {
            toast.error('Boost Failed', error.message);
        } finally {
            setBoostLoading(false);
        }
    };

    const handleHighlight = async () => {
        setHighlightLoading(true);
        try {
            const response = await fetch('/api/coins/highlight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    proposalId: proposal.id
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error);
            toast.success('Proposal Highlighted!', 'Your proposal is now featured for 24 hours.');
        } catch (error: any) {
            toast.error('Highlight Failed', error.message);
        } finally {
            setHighlightLoading(false);
        }
    };

    const totalVotes = proposal.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);

    const getPercentage = (votes: number, total: number) => {
        if (total === 0) return 0;
        return ((votes / total) * 100).toFixed(1);
    };

    useEffect(() => {
        if (loading) {
            setShowVoteAnimation(true);
        }
    }, [loading]);

    const formatTimeLeft = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return { text: 'Voting Ended', urgent: false, ended: true };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const urgent = diff < 24 * 60 * 60 * 1000;

        if (days > 0) {
            return { text: `${days}D ${hours}H LEFT`, urgent, ended: false };
        } else if (hours > 0) {
            return { text: `${hours}H ${minutes}M LEFT`, urgent, ended: false };
        } else {
            return { text: `${minutes} MIN LEFT`, urgent: true, ended: false };
        }
    };

    const timeLeft = formatTimeLeft(proposal.end_date);
    const sortedOptions = [...proposal.options].sort((a, b) => b.votes - a.votes);
    const leadingOption = sortedOptions[0];

    return (
        <div className="min-h-screen pb-32 relative bg-black font-mono overflow-auto custom-scrollbar">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-xl" style={{ borderBottom: `1px solid ${NEON_CYAN}30` }}>
                <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-4 md:py-5">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 group text-gray-400 hover:text-white transition-colors"
                        >
                            <div className="w-8 h-8 flex items-center justify-center border group-hover:bg-white/10 transition-colors" style={{ borderColor: NEON_CYAN }}>
                                <ArrowLeft className="w-4 h-4" style={{ color: NEON_CYAN }} strokeWidth={2.5} />
                            </div>
                            <span className="hidden sm:inline font-mono text-sm uppercase">BACK_TO_MISSIONS</span>
                        </button>

                        <div className="flex items-center gap-3">
                            {/* Highlight Button (Creator Only) */}
                            {userId === proposal.created_by && !proposal.featured && (
                                <button
                                    onClick={handleHighlight}
                                    disabled={highlightLoading}
                                    className="flex items-center gap-2 px-3 py-1.5 border hover:bg-yellow-500/10 transition-colors"
                                    style={{ borderColor: '#EAB308', color: '#EAB308' }}
                                    title="Highlight this proposal (200 coins)"
                                >
                                    <Star className="w-4 h-4" strokeWidth={2} />
                                    <span className="hidden sm:inline font-bold text-xs uppercase">PRIORITY_BOOST</span>
                                </button>
                            )}

                            <ArcadeButton
                                onClick={() => setShowShareModal(true)}
                                variant="cyan"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Share2 className="w-4 h-4" />
                                <span className="hidden sm:inline">SHARE_DATA</span>
                            </ArcadeButton>

                            {hasVoted && (
                                <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border bg-green-900/20" style={{ borderColor: NEON_LIME }}>
                                    <CheckCircle2 className="w-4 h-4" style={{ color: NEON_LIME }} strokeWidth={2} />
                                    <span className="text-xs font-bold uppercase hidden sm:inline" style={{ color: NEON_LIME }}>VOTE_LOGGED</span>
                                </div>
                            )}

                            {boosted && (
                                <div className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 border bg-purple-900/20" style={{ borderColor: NEON_MAGENTA }}>
                                    <Zap className="w-4 h-4" style={{ color: NEON_MAGENTA }} strokeWidth={2} />
                                    <span className="text-xs font-bold uppercase hidden sm:inline" style={{ color: NEON_MAGENTA }}>POWER_UP_ACTIVE</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1000px] mx-auto px-4 md:px-8 pt-12 relative z-10">

                {/* Proposal Header */}
                <div className="mb-12">
                    {/* Status Banner */}
                    <div className="flex flex-wrap items-center gap-4 mb-8">
                        <div className={`px-2 py-1 text-xs font-bold border flex items-center gap-2 uppercase tracking-wider ${timeLeft.urgent ? 'animate-pulse' : ''}`}
                            style={{
                                borderColor: timeLeft.urgent ? '#EF4444' : timeLeft.ended ? '#6B7280' : NEON_CYAN,
                                color: timeLeft.urgent ? '#EF4444' : timeLeft.ended ? '#9CA3AF' : NEON_CYAN,
                                backgroundColor: timeLeft.urgent ? '#EF444410' : timeLeft.ended ? '#6B728010' : `${NEON_CYAN}10`
                            }}>
                            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                            <span>{timeLeft.text}</span>
                        </div>

                        <div className="px-2 py-1 text-xs font-bold border border-gray-700 bg-gray-900 text-gray-300 flex items-center gap-2 uppercase tracking-wider">
                            <Users className="w-3.5 h-3.5" strokeWidth={2} />
                            <span>{totalVotes.toLocaleString()} LOGGED</span>
                        </div>

                        {proposal.featured && (
                            <div className="px-2 py-1 text-xs font-bold border border-yellow-500 bg-yellow-900/20 text-yellow-500 flex items-center gap-2 uppercase tracking-wider animate-pulse">
                                <Star className="w-3.5 h-3.5 fill-current" strokeWidth={2} />
                                <span>PRIORITY_MISSION</span>
                            </div>
                        )}

                        {proposal.status === 'active' && (
                            <div className="px-2 py-1 text-xs font-bold border flex items-center gap-2 uppercase tracking-wider" style={{ borderColor: NEON_LIME, color: NEON_LIME, backgroundColor: `${NEON_LIME}10` }}>
                                <Activity className="w-3.5 h-3.5" strokeWidth={2} />
                                <span>ACTIVE_STATUS</span>
                            </div>
                        )}
                    </div>

                    {/* Title & Description */}
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight uppercase tracking-wider text-white glitch-text" data-text={proposal.title}>
                        {proposal.title}
                    </h1>
                    <p className="text-lg text-gray-400 leading-relaxed max-w-3xl font-mono border-l-2 pl-4" style={{ borderColor: NEON_CYAN }}>
                        {'>'} {proposal.description}
                    </p>
                </div>

                {/* Voting Section */}
                <div className="mb-12">
                    <CyberCard className="p-8" title="CAST_YOUR_VOTE" cornerStyle="tech">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                            <div>
                                <p className="text-sm text-gray-400 font-mono uppercase">
                                    {hasVoted
                                        ? '// MISSION_STATUS: COMPLETE_ALREADY_VOTED'
                                        : '// INSTRUCTIONS: SELECT_PREFERRED_OPTION'
                                    }
                                </p>
                            </div>

                            {/* Security Check - Shows after selecting option */}
                            {!hasVoted && selectedOption && !captchaToken && (
                                <div className="w-full md:w-auto p-4 border rounded-none relative overflow-hidden" style={{ borderColor: `${NEON_CYAN}50`, backgroundColor: `${NEON_CYAN}05` }}>
                                    <div className="absolute top-0 right-0 p-1">
                                        <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: NEON_CYAN }}></div>
                                    </div>
                                    <div className="flex items-start gap-3 mb-3">
                                        <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NEON_CYAN }} />
                                        <div>
                                            <p className="text-sm font-bold uppercase mb-1" style={{ color: NEON_CYAN }}>SECURITY_VERIFICATION</p>
                                            <p className="text-[10px] text-gray-400 font-mono">REQUIRED_FOR_Submission</p>
                                        </div>
                                    </div>
                                    <VoteCaptcha onVerify={setCaptchaToken} />
                                </div>
                            )}

                            {!hasVoted && selectedOption && (
                                <div className="w-full md:w-auto">
                                    <ArcadeButton
                                        onClick={async () => {
                                            if (selectedOption && captchaToken) {
                                                await onVote(proposal.id, selectedOption, captchaToken);
                                            }
                                        }}
                                        disabled={loading || hasVoted || !selectedOption || !captchaToken}
                                        variant={!captchaToken ? 'magenta' : 'cyan'}
                                        className="w-full md:w-auto flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"></div>
                                                <span>TRANSMITTING...</span>
                                            </>
                                        ) : (
                                            <>
                                                {!captchaToken && <Shield className="w-5 h-5" />}
                                                {captchaToken && <Check className="w-5 h-5" strokeWidth={3} />}
                                                <span>{!captchaToken ? 'VERIFY_SECURITY' : 'CONFIRM_VOTE'}</span>
                                            </>
                                        )}
                                    </ArcadeButton>
                                </div>
                            )}
                        </div>

                        {/* Options List */}
                        <div className="space-y-4">
                            {sortedOptions.map((option: any, index: number) => {
                                const percentage = getPercentage(option.votes, totalVotes);
                                const isSelected = selectedOption === option.id;
                                const isLeading = option.id === leadingOption?.id && totalVotes > 0;
                                const isHovered = hoveredOption === option.id;

                                return (
                                    <div
                                        key={option.id}
                                        className="relative group transition-all duration-300"
                                        onMouseEnter={() => setHoveredOption(option.id)}
                                        onMouseLeave={() => setHoveredOption(null)}
                                    >
                                        {/* Vote Button/Card */}
                                        <button
                                            onClick={() => !hasVoted && setSelectedOption(option.id)}
                                            disabled={hasVoted}
                                            className="w-full text-left relative overflow-hidden transition-all duration-300 border bg-black/40 hover:bg-white/5"
                                            style={{
                                                borderColor: isSelected ? NEON_CYAN : 'rgba(255,255,255,0.1)',
                                                boxShadow: isSelected ? `0 0 15px ${NEON_CYAN}40` : 'none',
                                                clipPath: 'polygon(0 0, 100% 0, 100% 85%, 98% 100%, 0 100%)' // Subtle corner cut
                                            }}
                                        >
                                            {/* Background Progress Bar */}
                                            <div
                                                className="absolute inset-0 transition-all duration-700 opacity-20"
                                                style={{
                                                    width: `${percentage}%`,
                                                    backgroundColor: isLeading ? NEON_LIME : NEON_CYAN,
                                                    display: totalVotes > 0 ? 'block' : 'none'
                                                }}
                                            ></div>

                                            {/* Scanline Effect on Hover */}
                                            <div className={`absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,240,255,0.05)_50%)] bg-[size:4px_4px] pointer-events-none opacity-0 transition-opacity duration-300 ${isHovered ? 'opacity-100' : ''}`} />

                                            {/* Content */}
                                            <div className="relative z-10 p-6 flex items-center justify-between">
                                                <div className="flex-1 flex items-center gap-4">
                                                    {/* Selection Indicator */}
                                                    <div className="w-6 h-6 border flex items-center justify-center flex-shrink-0 transition-all duration-300"
                                                        style={{
                                                            borderColor: isSelected ? NEON_CYAN : 'rgba(255,255,255,0.3)',
                                                            backgroundColor: isSelected ? `${NEON_CYAN}20` : 'transparent'
                                                        }}
                                                    >
                                                        {isSelected && (
                                                            <div className="w-3 h-3 bg-current" style={{ color: NEON_CYAN }} />
                                                        )}
                                                    </div>

                                                    {/* Option Content */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className="font-bold uppercase tracking-wide text-white">
                                                                {option.title}
                                                            </h3>
                                                            {isLeading && totalVotes > 0 && (
                                                                <div className="px-1.5 py-0.5 text-[10px] font-bold border uppercase flex items-center gap-1" style={{ borderColor: NEON_LIME, color: NEON_LIME, backgroundColor: `${NEON_LIME}10` }}>
                                                                    <TrendingUp className="w-3 h-3" strokeWidth={2} />
                                                                    <span>LEADING</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {option.description && (
                                                            <p className="text-xs text-gray-500 font-mono">
                                                                {option.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Vote Stats */}
                                                    <div className="text-right flex-shrink-0">
                                                        <div className="text-2xl font-bold mb-1 font-mono text-white" style={{ textShadow: isLeading ? `0 0 10px ${NEON_LIME}80` : 'none' }}>
                                                            {percentage}%
                                                        </div>
                                                        <div className="text-[10px] text-gray-500 font-mono uppercase">
                                                            {option.votes.toLocaleString()} VOTES
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Info Banner */}
                        {!hasVoted && !selectedOption && (
                            <div className="mt-8 flex items-start gap-3 p-4 border bg-gray-900/50" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <AlertCircle className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                <div>
                                    <p className="text-sm text-gray-300 mb-1 font-bold uppercase">
                                        IMMUTABLE_ACTION_WARNING
                                    </p>
                                    <p className="text-xs text-gray-500 font-mono">
                                        {'>'} VOTE_SUBMISSION_IS_FINAL._NO_ROLLBACKS.
                                    </p>
                                </div>
                            </div>
                        )}

                        {hasVoted && (
                            <div className="mt-8 flex flex-col md:flex-row items-center gap-4 p-4 border bg-green-900/10" style={{ borderColor: `${NEON_LIME}40` }}>
                                <div className="flex items-start gap-3 flex-1">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: NEON_LIME }} strokeWidth={2} />
                                    <div>
                                        <p className="text-sm font-bold uppercase mb-1" style={{ color: NEON_LIME }}>
                                            TRANSACTION_CONFIRMED
                                        </p>
                                        <p className="text-xs text-green-400/70 font-mono uppercase">
                                            {'>'} BLOCKCHAIN_VERIFICATION_COMPLETE
                                        </p>
                                    </div>
                                </div>
                                <ArcadeButton
                                    onClick={handleBoost}
                                    disabled={boostLoading}
                                    variant="magenta"
                                    className="flex items-center gap-2"
                                >
                                    <Zap className="w-4 h-4" />
                                    <span>BOOST_VOTE (500)</span>
                                </ArcadeButton>
                            </div>
                        )}
                    </CyberCard>
                </div>

                {/* Proposal Details Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <CyberCard className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 border flex items-center justify-center bg-gray-900" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                                <Users className="w-5 h-5 text-gray-400" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-mono">TOTAL_PARTICIPANTS</p>
                                <p className="text-xl font-bold text-white font-mono">{totalVotes.toLocaleString()}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-mono uppercase">
                            {'>'} UNIQUE_ADDRESSES
                        </p>
                    </CyberCard>

                    <CyberCard className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 border flex items-center justify-center bg-gray-900" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                                <Activity className="w-5 h-5 text-gray-400" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-mono">DECISION_PATHS</p>
                                <p className="text-xl font-bold text-white font-mono">{proposal.options.length}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-mono uppercase">
                            {'>'} AVAILABLE_OPTIONS
                        </p>
                    </CyberCard>

                    <CyberCard className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 border flex items-center justify-center bg-gray-900" style={{ borderColor: 'rgba(255,255,255,0.2)' }}>
                                <Shield className="w-5 h-5 text-gray-400" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase font-mono">CURRENT_STATE</p>
                                <p className="text-xl font-bold text-white font-mono uppercase">{proposal.status}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-mono uppercase">
                            {'>'} SYSTEM_STATUS
                        </p>
                    </CyberCard>
                </div>
            </div>

            {/* Loading Overlay */}
            {showVoteAnimation && loading && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center">
                    <div className="text-center max-w-md p-8 border border-white/10 bg-black relative overflow-hidden" style={{ width: '400px' }}>
                        <div className="absolute top-0 left-0 w-full h-1 bg-white/20">
                            <div className="h-full bg-cyan-400 animate-[loading_2s_ease-in-out_infinite]" style={{ backgroundColor: NEON_CYAN }}></div>
                        </div>

                        <div className="w-20 h-20 mx-auto mb-8 relative">
                            <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${NEON_CYAN}40`, borderTopColor: NEON_CYAN }}></div>
                            <div className="absolute inset-4 border-4 border-b-transparent rounded-full animate-spin-reverse" style={{ borderColor: `${NEON_MAGENTA}40`, borderBottomColor: NEON_MAGENTA }}></div>
                            <Vote className="w-8 h-8 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: 'white' }} />
                        </div>

                        <h3 className="text-xl font-bold uppercase mb-2 tracking-widest text-white">CONFIRMING_VOTE</h3>
                        <p className="text-sm text-gray-400 font-mono uppercase animate-pulse">
                            {'>'} WRITING_TO_BLOCKCHAIN...
                        </p>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                proposalId={(proposal.blockchain_id ?? proposal.id).toString()}
                proposalTitle={proposal.title}
                userId={userId}
            />
        </div>
    );
};

export default ProposalDetailScreen;

function Vote(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m9 12 2 2 4-4" />
            <path d="M5 7c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v12H5V7Z" />
            <path d="M22 19H2" />
        </svg>
    )
}
