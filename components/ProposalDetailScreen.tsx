import React from 'react';
import { ChevronLeft, Clock, Users, Check, Shield } from 'lucide-react';
import { ProposalWithOptions } from '@/lib/supabase';

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
        <div className="min-h-screen bg-zinc-950 pb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black pointer-events-none"></div>

            {/* Header */}
            <div className="relative z-10 border-b border-zinc-900">
                <div className="px-6 pt-16 pb-8">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8"
                    >
                        <ChevronLeft className="w-4 h-4" strokeWidth={2} />
                        <span className="text-sm">Back</span>
                    </button>

                    <div className="text-zinc-600 text-xs font-mono mb-3">{proposal.id}</div>
                    <h1 className="text-3xl font-light text-white mb-6 tracking-tight leading-tight">{proposal.title}</h1>

                    <div className="flex items-center gap-6 text-sm text-zinc-500">
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" strokeWidth={1.5} />
                            {formatTimeLeft(proposal.end_date)} remaining
                        </span>
                        <span className="flex items-center gap-2">
                            <Users className="w-4 h-4" strokeWidth={1.5} />
                            {proposal.participants.toLocaleString()} participants
                        </span>
                    </div>
                </div>
            </div>

            <div className="relative z-10 px-6 py-8 space-y-8">
                {/* Proposal Summary */}
                <div>
                    <div className="text-zinc-500 text-xs uppercase tracking-wider mb-4">Executive Summary</div>
                    <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded p-6">
                        <p className="text-zinc-400 leading-relaxed">
                            {proposal.description}
                        </p>
                    </div>
                </div>

                {/* Voting Options */}
                <div>
                    <div className="text-zinc-500 text-xs uppercase tracking-wider mb-4">
                        {hasVoted ? 'Your Vote (Results)' : 'Cast Your Vote'}
                    </div>
                    <div className="space-y-3">
                        {proposal.options.map((option: any) => {
                            const votePercent = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => !hasVoted && setSelectedOption(option.id)}
                                    disabled={hasVoted || loading}
                                    className={`w-full p-6 rounded border transition-all text-left ${hasVoted || loading
                                        ? 'border-zinc-800 bg-zinc-900/30 cursor-default'
                                        : selectedOption === option.id
                                            ? 'border-white bg-zinc-900'
                                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="text-white font-light text-lg mb-2">{option.title}</div>
                                            {option.allocation && (
                                                <div className="text-zinc-500 text-sm mb-3">{option.allocation} • {option.percentage}</div>
                                            )}
                                            <div className="text-zinc-600 text-sm">{option.description}</div>
                                        </div>
                                        <div className="text-white text-3xl font-light ml-6">{votePercent}%</div>
                                    </div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-500" style={{ width: `${votePercent}%` }} />
                                        </div>
                                        <div className="text-zinc-500 text-xs font-mono">{option.votes.toLocaleString()} votes</div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {!hasVoted && (
                        <button
                            onClick={onVote}
                            disabled={!selectedOption || loading}
                            className={`w-full mt-6 py-4 rounded font-medium transition-all ${selectedOption && !loading
                                ? 'bg-white hover:bg-zinc-100 text-black'
                                : 'bg-zinc-900 text-zinc-700 cursor-not-allowed'
                                }`}
                        >
                            {loading ? 'Submitting...' : selectedOption ? 'Submit Vote & Earn 250 XP' : 'Select an option to continue'}
                        </button>
                    )}

                    {hasVoted && (
                        <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded p-4 flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-500" strokeWidth={2} />
                            <div className="text-green-500 text-sm">You have already voted on this proposal</div>
                        </div>
                    )}
                </div>

                {/* Security Info */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded p-6">
                    <div className="flex items-start gap-4">
                        <Shield className="w-5 h-5 text-zinc-500 mt-0.5" strokeWidth={1.5} />
                        <div>
                            <div className="text-white text-sm mb-1">Cryptographic Verification</div>
                            <div className="text-zinc-500 text-xs leading-relaxed">
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
