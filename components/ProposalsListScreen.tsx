import React, { useState } from 'react';
import { Search, Filter, Clock, Users, Check, ArrowRight } from 'lucide-react';
import { ProposalWithOptions } from '@/lib/supabase';
import Tooltip from './Tooltip';

interface ProposalsListScreenProps {
    proposals: ProposalWithOptions[];
    onSelectProposal: (proposal: ProposalWithOptions) => void;
    hasVoted: (proposalId: string) => boolean;
}

const ProposalsListScreen: React.FC<ProposalsListScreenProps> = ({
    proposals,
    onSelectProposal,
    hasVoted
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'closed'>('all');
    const [sortBy, setSortBy] = useState<'deadline' | 'votes' | 'recent'>('deadline');

    const formatTimeLeft = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return `${days}d ${hours}h`;
    };

    // Filter proposals
    const filteredProposals = proposals.filter(proposal => {
        const matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            proposal.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' ||
            (filterStatus === 'active' && proposal.status === 'active') ||
            (filterStatus === 'closed' && proposal.status === 'closed');
        return matchesSearch && matchesFilter;
    });

    // Sort proposals
    const sortedProposals = [...filteredProposals].sort((a, b) => {
        if (sortBy === 'deadline') {
            return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        } else if (sortBy === 'votes') {
            return b.participants - a.participants;
        } else {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
    });

    return (
        <div className="min-h-screen pb-32 animate-fade-in">
            {/* Header */}
            <div className="relative z-10 pt-16 pb-6 px-6">
                <h1 className="text-3xl font-light text-white tracking-tight mb-1 animate-slide-up" style={{ animationDelay: '0.1s' }}>Proposals</h1>
                <p className="text-zinc-500 text-sm font-light animate-slide-up" style={{ animationDelay: '0.2s' }}>Browse and vote on active governance proposals</p>
            </div>

            {/* Search and Filters */}
            <div className="relative z-10 px-6 mb-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="glass rounded-2xl p-4 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" strokeWidth={1.5} />
                        <input
                            type="text"
                            placeholder="Search proposals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/20 border border-white/5 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-white/10 transition-colors font-light"
                        />
                    </div>

                    {/* Filter Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                        {(['all', 'active', 'closed'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-all ${filterStatus === status
                                    ? 'bg-white text-black shadow-lg shadow-white/10'
                                    : 'bg-black/20 text-zinc-500 hover:text-zinc-300 hover:bg-black/40'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                        <div className="h-4 w-px bg-white/10 mx-2"></div>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="bg-black/20 border-none rounded-lg px-3 py-2 text-[10px] text-zinc-400 uppercase tracking-widest focus:outline-none cursor-pointer hover:text-zinc-200 transition-colors"
                        >
                            <option value="deadline">Deadline</option>
                            <option value="votes">Votes</option>
                            <option value="recent">Recent</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Proposals List */}
            <div className="relative z-10 px-6">
                {sortedProposals.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Filter className="w-6 h-6 text-zinc-600" strokeWidth={1.5} />
                        </div>
                        <p className="text-zinc-500 text-sm font-light">No proposals found</p>
                        <p className="text-zinc-600 text-xs mt-1 font-mono">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedProposals.map((proposal, idx) => {
                            const voted = hasVoted(proposal.id);
                            const timeLeft = formatTimeLeft(proposal.end_date);
                            const isActive = proposal.status === 'active';

                            return (
                                <button
                                    key={proposal.id}
                                    onClick={() => onSelectProposal(proposal)}
                                    className="w-full glass glass-hover rounded-xl p-5 text-left group transition-all duration-300 animate-slide-up"
                                    style={{ animationDelay: `${0.4 + (idx * 0.1)}s` }}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="text-zinc-600 text-[10px] font-mono tracking-wider">#{proposal.id.substring(0, 6)}</div>
                                                {isActive ? (
                                                    <Tooltip content="Voting is open" position="right">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse-slow"></div>
                                                            <span className="text-[10px] text-emerald-500 uppercase tracking-wider">Active</span>
                                                        </div>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip content="Voting has ended" position="right">
                                                        <span className="text-[10px] text-zinc-600 uppercase tracking-wider">Closed</span>
                                                    </Tooltip>
                                                )}
                                            </div>
                                            <h3 className="text-white text-lg font-light leading-snug mb-2 group-hover:text-zinc-200 transition-colors">{proposal.title}</h3>
                                            <p className="text-zinc-500 text-xs font-light line-clamp-2 leading-relaxed">{proposal.description}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-white transition-colors duration-300 mt-1 transform group-hover:translate-x-1" strokeWidth={1.5} />
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                                            <Tooltip content="Total Participants" position="bottom">
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                    <span className="font-mono">{proposal.participants}</span>
                                                </div>
                                            </Tooltip>
                                            <Tooltip content="Time Remaining" position="bottom">
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                                                    <span className="font-mono">{timeLeft}</span>
                                                </div>
                                            </Tooltip>
                                        </div>
                                        {voted && (
                                            <Tooltip content="You have already voted" position="left">
                                                <div className="flex items-center gap-1.5 text-emerald-500/80">
                                                    <Check className="w-3.5 h-3.5" strokeWidth={2} />
                                                    <span className="text-[10px] uppercase tracking-wider">Voted</span>
                                                </div>
                                            </Tooltip>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProposalsListScreen;
