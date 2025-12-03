import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users, Check, Shield, TrendingUp, Activity, AlertCircle, CheckCircle2, ChevronRight, Share2 } from 'lucide-react';
import { ProposalWithOptions } from '@/lib/supabase';
import Tooltip from './Tooltip';
import ShareModal from './ShareModal';
import VoteCaptcha from './VoteCaptcha';

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
            return { text: `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours > 1 ? 's' : ''} left`, urgent, ended: false };
        } else if (hours > 0) {
            return { text: `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min left`, urgent, ended: false };
        } else {
            return { text: `${minutes} minute${minutes > 1 ? 's' : ''} left`, urgent: true, ended: false };
        }
    };

    const timeLeft = formatTimeLeft(proposal.end_date);
    const sortedOptions = [...proposal.options].sort((a, b) => b.votes - a.votes);
    const leadingOption = sortedOptions[0];

    return (
        <div className="min-h-screen pb-32 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[150px] animate-float" style={{ animationDuration: '10s' }}></div>
            </div>

            {/* Header */}
            <div className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="max-w-[1000px] mx-auto px-8 py-5">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={onBack}
                            className="btn btn-ghost btn-sm group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" strokeWidth={2} />
                            <span>Back to Proposals</span>
                        </button>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowShareModal(true)}
                                className="btn btn-secondary btn-sm group"
                            >
                                <Share2 className="w-4 h-4 transition-transform group-hover:scale-110" strokeWidth={2} />
                                <span>Share</span>
                            </button>

                            {hasVoted && (
                                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 animate-scale-in">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" strokeWidth={2} />
                                    <span className="text-sm font-semibold text-green-400">Vote Recorded</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-[1000px] mx-auto px-8 pt-12 relative z-10">

                {/* Proposal Header */}
                <div className="mb-12 animate-slide-up">
                    {/* Status Banner */}
                    <div className="flex items-center gap-4 mb-8">
                        <div className={`badge ${timeLeft.urgent ? 'badge-warning' : 'badge-neutral'} ${timeLeft.ended ? 'badge-neutral' : ''}`}>
                            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                            <span>{timeLeft.text}</span>
                        </div>

                        <div className="badge badge-neutral">
                            <Users className="w-3.5 h-3.5" strokeWidth={2} />
                            <span>{totalVotes.toLocaleString()} votes</span>
                        </div>

                        {proposal.status === 'active' && (
                            <div className="badge badge-success">
                                <Activity className="w-3.5 h-3.5" strokeWidth={2} />
                                <span>Active</span>
                            </div>
                        )}
                    </div>

                    {/* Title & Description */}
                    <h1 className="text-display-xl mb-6 leading-tight">
                        {proposal.title}
                    </h1>
                    <p className="text-body-large text-mono-70 leading-relaxed max-w-3xl">
                        {proposal.description}
                    </p>
                </div>

                {/* Voting Section */}
                <div className="mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="card-elevated p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-heading mb-2">Cast Your Vote</h2>
                                <p className="text-body text-mono-60">
                                    {hasVoted
                                        ? 'You have already voted on this proposal'
                                        : 'Select an option below to participate in this vote'
                                    }
                                </p>
                            </div>

                            {/* Security Check - Shows after selecting option */}
                            {!hasVoted && selectedOption && !captchaToken && (
                                <div className="mb-6 p-4 bg-blue-500/10 border-2 border-blue-500/30 rounded-xl animate-slide-up">
                                    <div className="flex items-start gap-3 mb-3">
                                        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-100 mb-1">🔒 Security Verification Required</p>
                                            <p className="text-xs text-blue-200/70">Complete this quick check to cast your vote</p>
                                        </div>
                                    </div>
                                    <VoteCaptcha onVerify={setCaptchaToken} />
                                </div>
                            )}

                            {!hasVoted && selectedOption && (
                                <button
                                    onClick={async () => {
                                        if (selectedOption && captchaToken) {
                                            await onVote(proposal.id, selectedOption, captchaToken);
                                        }
                                    }}
                                    disabled={loading || hasVoted || !selectedOption || !captchaToken}
                                    className={`btn btn-lg group relative overflow-hidden w-full transition-all duration-300 ${!captchaToken
                                        ? 'bg-mono-10 text-mono-50 cursor-not-allowed opacity-60'
                                        : 'btn-primary'
                                        }`}
                                    title={!captchaToken ? '⚠️ Complete security check above to enable voting' : 'Click to cast your vote'}
                                >
                                    {loading ? (
                                        <>
                                            <div className="loading-spinner w-4 h-4"></div>
                                            <span>Confirming...</span>
                                        </>
                                    ) : (
                                        <>
                                            {!captchaToken && <Shield className="w-5 h-5" strokeWidth={2.5} />}
                                            {captchaToken && <Check className="w-5 h-5 transition-transform group-hover:scale-110" strokeWidth={2.5} />}
                                            <span>{!captchaToken ? 'Complete Security Check Above ↑' : 'Confirm Vote'}</span>
                                            {captchaToken && <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />}
                                        </>
                                    )}
                                </button>
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
                                        className={`relative group transition-all duration-300 animate-slide-up`}
                                        style={{ animationDelay: `${index * 0.05}s` }}
                                        onMouseEnter={() => setHoveredOption(option.id)}
                                        onMouseLeave={() => setHoveredOption(null)}
                                    >
                                        {/* Vote Button/Card */}
                                        <button
                                            onClick={() => !hasVoted && setSelectedOption(option.id)}
                                            disabled={hasVoted}
                                            className={`
                                                w-full text-left relative overflow-hidden rounded-xl border transition-all duration-300
                                                ${isSelected
                                                    ? 'bg-white/10 border-white/30 shadow-lg'
                                                    : hasVoted
                                                        ? 'bg-glass-light border-white/5 cursor-not-allowed'
                                                        : 'bg-glass-light border-white/10 hover:bg-glass-medium hover:border-white/20 cursor-pointer'
                                                }
                                                ${isSelected && 'scale-[1.02]'}
                                            `}
                                        >
                                            {/* Background Progress Bar */}
                                            <div
                                                className={`absolute inset-0 transition-all duration-700 ${isLeading
                                                    ? 'bg-gradient-to-r from-white/5 to-transparent'
                                                    : 'bg-white/[0.02]'
                                                    }`}
                                                style={{
                                                    width: `${percentage}%`,
                                                    opacity: totalVotes > 0 ? 1 : 0
                                                }}
                                            ></div>

                                            {/* Hover Gradient */}
                                            <div className={`absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 ${isHovered && 'opacity-100'}`}></div>

                                            {/* Content */}
                                            <div className="relative z-10 p-6 flex items-center justify-between">
                                                <div className="flex-1 flex items-center gap-4">
                                                    {/* Selection Indicator */}
                                                    <div className={`
                                                        w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300
                                                        ${isSelected
                                                            ? 'border-white bg-white'
                                                            : hasVoted
                                                                ? 'border-white/20'
                                                                : 'border-white/30 group-hover:border-white/50'
                                                        }
                                                    `}>
                                                        {isSelected && (
                                                            <Check className="w-4 h-4 text-black" strokeWidth={3} />
                                                        )}
                                                    </div>

                                                    {/* Option Content */}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h3 className={`text-subheading transition-colors ${isSelected ? 'text-white' : 'text-mono-95'
                                                                }`}>
                                                                {option.title}
                                                            </h3>
                                                            {isLeading && totalVotes > 0 && (
                                                                <Tooltip content="Leading Option" position="top">
                                                                    <div className="badge badge-success badge-sm">
                                                                        <TrendingUp className="w-3 h-3" strokeWidth={2} />
                                                                        <span>Leading</span>
                                                                    </div>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                        {option.description && (
                                                            <p className="text-body-small text-mono-60">
                                                                {option.description}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Vote Stats */}
                                                    <div className="text-right flex-shrink-0">
                                                        <div className={`text-2xl font-bold mb-1 transition-colors ${isLeading ? 'text-white' : 'text-mono-95'
                                                            }`}>
                                                            {percentage}%
                                                        </div>
                                                        <div className="text-caption text-mono-50">
                                                            {option.votes.toLocaleString()} votes
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
                            <div className="mt-8 flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
                                <AlertCircle className="w-5 h-5 text-mono-60 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                <div>
                                    <p className="text-body-small text-mono-70 mb-1 font-medium">
                                        Your vote is permanent
                                    </p>
                                    <p className="text-caption text-mono-50">
                                        Once you vote, you cannot change your selection. Make sure to review all options carefully before confirming.
                                    </p>
                                </div>
                            </div>
                        )}

                        {hasVoted && (
                            <div className="mt-8 flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                <div>
                                    <p className="text-body-small text-green-400 mb-1 font-medium">
                                        Vote recorded successfully
                                    </p>
                                    <p className="text-caption text-green-400/70">
                                        Your vote has been recorded on the blockchain and cannot be changed. Thank you for participating!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Proposal Details */}
                <div className="grid grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <Users className="w-5 h-5 text-mono-70" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-caption text-mono-50 uppercase">Participants</p>
                                <p className="text-xl font-bold">{totalVotes.toLocaleString()}</p>
                            </div>
                        </div>
                        <p className="text-caption text-mono-50">
                            Total votes cast
                        </p>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-mono-70" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-caption text-mono-50 uppercase">Options</p>
                                <p className="text-xl font-bold">{proposal.options.length}</p>
                            </div>
                        </div>
                        <p className="text-caption text-mono-50">
                            Voting choices
                        </p>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-mono-70" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-caption text-mono-50 uppercase">Status</p>
                                <p className="text-xl font-bold capitalize">{proposal.status}</p>
                            </div>
                        </div>
                        <p className="text-caption text-mono-50">
                            Current state
                        </p>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {showVoteAnimation && loading && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in">
                    <div className="card-elevated p-12 text-center max-w-md animate-scale-bounce">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center">
                            <div className="loading-spinner w-10 h-10"></div>
                        </div>
                        <h3 className="text-heading mb-3">Confirming Your Vote</h3>
                        <p className="text-body text-mono-60">
                            Please wait while your vote is being recorded on the blockchain...
                        </p>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                proposalId={proposal.blockchain_id.toString()}
                proposalTitle={proposal.title}
                userId={userId}
            />
        </div>
    );
};

export default ProposalDetailScreen;
