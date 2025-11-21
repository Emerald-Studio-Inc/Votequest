import React from 'react';
import { ChevronLeft, Clock, Users, Check, Shield, ArrowLeft } from 'lucide-react';
import { ProposalWithOptions } from '@/lib/supabase';
import Tooltip from './Tooltip';

interface ProposalDetailScreenProps {
    proposal: ProposalWithOptions;
    onBack: () => void;
    onVote: () => void;
    loading: boolean;
    hasVoted: boolean;
    selectedOption: string | null;
    setSelectedOption: (optionId: string | null) => void;
}

const ProposalDetailScreen: React.FC<ProposalDetailScreenProps> = ({
    proposal,
    onBack,
    onVote,
    loading,
    hasVoted,
    selectedOption,
    setSelectedOption
}) => {
    const totalVotes = proposal.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);

    const formatTimeLeft = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return `${days}d ${hours}h`;
    };

    return (
        <div className="min-h-screen pb-8 animate-fade-in">
            {/* Header */}
            <div className="relative z-10 pt-8 pb-6 px-6">
                <Tooltip content="Return to list" position="right">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group animate-slide-up"
                        style={{ animationDelay: '0.1s' }}
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
                        <span className="text-xs font-light tracking-wide">Back to Proposals</span>
                    </button>
                </Tooltip>

                <div className="text-zinc-600 text-[10px] font-mono tracking-wider mb-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>#{proposal.id.substring(0, 8)}</div>
                <h1 className="text-3xl font-light text-white mb-6 tracking-tight leading-tight animate-slide-up" style={{ animationDelay: '0.3s' }}>{proposal.title}</h1>

                <div className="flex items-center gap-6 text-xs text-zinc-500 font-light animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <Tooltip content={`Ends on ${new Date(proposal.end_date).toLocaleDateString()}`} position="bottom">
                        <span className="flex items-center gap-2 cursor-help">
                            <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {formatTimeLeft(proposal.end_date)} remaining
                        </span>
                    </Tooltip>
                    <Tooltip content={`${totalVotes} total votes cast`} position="bottom">
                        <span className="flex items-center gap-2 cursor-help">
                            <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                            {proposal.participants.toLocaleString()} participants
                        </span>
                    </Tooltip>
                </div>
            </div>

            <div className="relative z-10 px-6 space-y-8">
                {/* Proposal Summary */}
                <div className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
                    <div className="text-zinc-500 text-[10px] uppercase tracking-widest mb-4 pl-2">Executive Summary</div>
                    <div className="glass rounded-2xl p-6">
                        <p className="text-zinc-400 text-sm font-light leading-relaxed">
                            {proposal.description}
                        </p>
                    </div>
                </div>

                {/* Voting Options */}
                <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
                    <div className="text-zinc-500 text-[10px] uppercase tracking-widest mb-4 pl-2">
                        {hasVoted ? 'Results' : 'Cast Your Vote'}
                    </div>
                    <div className="space-y-3">
                        {proposal.options.map((option: any, idx: number) => {
                            const votePercent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                            const isSelected = selectedOption === option.id;

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => !hasVoted && setSelectedOption(option.id)}
                                    disabled={hasVoted || loading}
                                    className={`w-full p-6 rounded-2xl border transition-all text-left relative overflow-hidden group ${hasVoted || loading
                                        ? 'border-white/5 bg-black/20 cursor-default'
                                        : isSelected
                                            ? 'border-white/20 bg-white/5 shadow-[0_0_30px_rgba(255,255,255,0.05)]'
                                            : 'border-white/5 bg-black/20 hover:border-white/10 hover:bg-white/5'
                                        }`}
                                    style={{ animationDelay: `${0.7 + (idx * 0.1)}s` }}
                                >
                                    {/* Progress Background for Results */}
                                    {(hasVoted || loading) && (
                                        <div
                                            className="absolute inset-0 bg-white/5 transition-all duration-1000 ease-out"
                                            style={{ width: `${votePercent}%` }}
                                        ></div>
                                    )}

                                    <div className="relative z-10">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className={`text-lg font-light mb-2 transition-colors ${isSelected ? 'text-white' : 'text-zinc-300 group-hover:text-white'}`}>{option.title}</div>
                                                {option.allocation && (
                                                    <div className="text-zinc-500 text-xs font-mono mb-2">{option.allocation} • {option.percentage}</div>
                                                )}
                                                <div className="text-zinc-500 text-xs font-light leading-relaxed">{option.description}</div>
                                            </div>
                                            {(hasVoted || loading) && (
                                                <div className="text-white text-2xl font-thin ml-6">{votePercent}%</div>
                                            )}
                                        </div>

                                        {(hasVoted || loading) && (
                                            <div className="text-zinc-600 text-[10px] font-mono text-right">{option.votes.toLocaleString()} votes</div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {!hasVoted && (
                        <button
                            onClick={onVote}
                            disabled={!selectedOption || loading}
                            className={`w-full mt-6 py-4 rounded-xl font-light tracking-wide transition-all duration-300 ${selectedOption && !loading
                                ? 'bg-white hover:bg-zinc-200 text-black shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transform hover:-translate-y-0.5'
                                : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
                                }`}
                        >
                            {loading ? 'Submitting...' : selectedOption ? 'Submit Vote & Earn 250 XP' : 'Select an option to continue'}
                        </button>
                    )}

                    {hasVoted && (
                        <div className="mt-6 glass rounded-xl p-4 flex items-center gap-3 border-l-2 border-l-emerald-500 animate-scale-in">
                            <Check className="w-4 h-4 text-emerald-500" strokeWidth={2} />
                            <div className="text-emerald-500 text-xs tracking-wide">Vote confirmed on-chain</div>
                        </div>
                    )}
                </div>

                {/* Security Info */}
                <div className="glass rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.8s' }}>
                    <div className="flex items-start gap-4">
                        <Shield className="w-4 h-4 text-zinc-500 mt-0.5" strokeWidth={1.5} />
                        <div>
                            <div className="text-zinc-300 text-xs font-medium mb-1 tracking-wide">Cryptographic Verification</div>
                            <div className="text-zinc-500 text-[10px] leading-relaxed font-light">
                                Your vote will be cryptographically signed using your wallet&apos;s private key and permanently recorded on-chain. Transaction hash will be provided upon confirmation for full auditability.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProposalDetailScreen;
