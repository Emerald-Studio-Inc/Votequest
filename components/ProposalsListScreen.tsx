import React, { useState, useMemo } from 'react';
import { Search, Filter, Clock, Users, TrendingUp, Check, ArrowUpRight, X, ChevronDown } from 'lucide-react';
import { ProposalWithOptions } from '@/lib/supabase';
import Tooltip from './Tooltip';

interface ProposalsListScreenProps {
    proposals: ProposalWithOptions[];
    onSelectProposal: (proposal: ProposalWithOptions) => void;
    hasVoted: (proposalId: string) => boolean;
}

type SortOption = 'recent' | 'popular' | 'ending-soon';
type FilterOption = 'all' | 'active' | 'voted' | 'not-voted';

const ProposalsListScreen: React.FC<ProposalsListScreenProps> = ({
    proposals,
    onSelectProposal,
    hasVoted
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [filterBy, setFilterBy] = useState<FilterOption>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const formatTimeLeft = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return { text: 'Ended', urgent: false, ended: true, sortValue: 0 };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const urgent = diff < 24 * 60 * 60 * 1000;

        if (days > 0) {
            return { text: `${days}d ${hours}h`, urgent, ended: false, sortValue: diff };
        } else if (hours > 0) {
            return { text: `${hours}h ${minutes}m`, urgent, ended: false, sortValue: diff };
        } else {
            return { text: `${minutes}m`, urgent: true, ended: false, sortValue: diff };
        }
    };

    // Filtered and sorted proposals
    const processedProposals = useMemo(() => {
        let filtered = proposals;

        // Apply search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query)
            );
        }

        // Apply filters
        switch (filterBy) {
            case 'active':
                filtered = filtered.filter(p => p.status === 'active');
                break;
            case 'voted':
                filtered = filtered.filter(p => hasVoted(p.id));
                break;
            case 'not-voted':
                filtered = filtered.filter(p => !hasVoted(p.id) && p.status === 'active');
                break;
        }

        // Apply sorting
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'popular':
                    const totalVotesA = a.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
                    const totalVotesB = b.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
                    return totalVotesB - totalVotesA;
                case 'ending-soon':
                    const timeA = formatTimeLeft(a.end_date).sortValue;
                    const timeB = formatTimeLeft(b.end_date).sortValue;
                    return timeA - timeB;
                case 'recent':
                default:
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

        return sorted;
    }, [proposals, searchQuery, sortBy, filterBy, hasVoted]);

    const activeCount = proposals.filter(p => p.status === 'active').length;
    const votedCount = proposals.filter(p => hasVoted(p.id)).length;

    return (
        <div className="min-h-screen pb-32 relative">
            {/* Header Section */}
            <div className="sticky top-0 z-40 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
                    <div className="mb-6">
                        <h1 className="text-display mb-2">All Proposals</h1>
                        <p className="text-body text-mono-60">
                            Showing {processedProposals.length} of {proposals.length} proposals
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mono-50" strokeWidth={2} />
                            <input
                                type="text"
                                placeholder="Search proposals..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-12 pr-12"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-fast"
                                >
                                    <X className="w-3.5 h-3.5" strokeWidth={2} />
                                </button>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="input w-48 appearance-none cursor-pointer pr-10"
                            >
                                <option value="recent">Most Recent</option>
                                <option value="popular">Most Popular</option>
                                <option value="ending-soon">Ending Soon</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-mono-50 pointer-events-none" strokeWidth={2} />
                        </div>

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn ${showFilters ? 'btn-secondary' : 'btn-ghost'}`}
                        >
                            <Filter className="w-4 h-4" strokeWidth={2} />
                            <span>Filters</span>
                            {filterBy !== 'all' && (
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                            )}
                        </button>
                    </div>

                    {/* Filter Pills */}
                    {showFilters && (
                        <div className="mt-4 flex items-center gap-3 animate-slide-down">
                            <span className="text-caption text-mono-50 uppercase">Filter by:</span>
                            <div className="flex items-center gap-2">
                                {[
                                    { value: 'all' as FilterOption, label: 'All', count: proposals.length },
                                    { value: 'active' as FilterOption, label: 'Active', count: activeCount },
                                    { value: 'voted' as FilterOption, label: 'Voted', count: votedCount },
                                    { value: 'not-voted' as FilterOption, label: 'Not Voted', count: activeCount - votedCount }
                                ].map((filter) => (
                                    <button
                                        key={filter.value}
                                        onClick={() => setFilterBy(filter.value)}
                                        className={`
                                            badge transition-all
                                            ${filterBy === filter.value
                                                ? 'badge-primary scale-105'
                                                : 'badge-neutral hover:bg-glass-medium'
                                            }
                                        `}
                                    >
                                        {filter.label}
                                        <span className="text-mono-50">({filter.count})</span>
                                    </button>
                                ))}
                            </div>

                            {filterBy !== 'all' && (
                                <button
                                    onClick={() => setFilterBy('all')}
                                    className="text-caption text-mono-50 hover:text-mono-95 transition-fast"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Proposals Grid */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-8">
                {processedProposals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                        {processedProposals.map((proposal, index) => {
                            const timeLeft = formatTimeLeft(proposal.end_date);
                            const voted = hasVoted(proposal.id);
                            const totalVotes = proposal.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
                            const leadingOption = [...proposal.options].sort((a, b) => b.votes - a.votes)[0];
                            const leadingPercentage = totalVotes > 0
                                ? Math.round((leadingOption.votes / totalVotes) * 100)
                                : 0;

                            return (
                                <div
                                    key={proposal.id}
                                    className="card card-interactive relative overflow-hidden group animate-slide-up"
                                    onClick={() => onSelectProposal(proposal)}
                                    onMouseEnter={() => setHoveredCard(proposal.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s` }}
                                >
                                    {/* Hover Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    {/* Status Indicator */}
                                    {timeLeft.urgent && !timeLeft.ended && (
                                        <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-orange-400 to-transparent animate-pulse"></div>
                                    )}

                                    <div className="relative z-10 p-6">
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-subheading mb-2 line-clamp-2 group-hover:text-mono-100 transition-colors">
                                                    {proposal.title}
                                                </h3>
                                                <p className="text-body-small text-mono-50 line-clamp-2">
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

                                        {/* Leading Option Stats */}
                                        {leadingOption && (
                                            <div className="mb-6 p-4 rounded-lg bg-white/[0.03] border border-white/5">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-caption text-mono-50 uppercase flex items-center gap-2">
                                                        <TrendingUp className="w-3.5 h-3.5" strokeWidth={2} />
                                                        Leading Option
                                                    </span>
                                                    <span className="text-sm text-mono-95 font-bold">
                                                        {leadingPercentage}%
                                                    </span>
                                                </div>
                                                <p className="text-body-small text-mono-70 line-clamp-1">
                                                    {leadingOption.title}
                                                </p>
                                                <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-white/25 rounded-full transition-all duration-700"
                                                        style={{ width: `${leadingPercentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-4">
                                                <Tooltip content="Total Votes" position="top">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="w-4 h-4 text-mono-50" strokeWidth={2} />
                                                        <span className="text-sm text-mono-70 font-medium">
                                                            {totalVotes.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </Tooltip>

                                                <div className={`flex items-center gap-1.5 ${timeLeft.urgent ? 'text-orange-400' : timeLeft.ended ? 'text-mono-40' : 'text-mono-50'
                                                    }`}>
                                                    <Clock className="w-4 h-4" strokeWidth={2} />
                                                    <span className="text-sm font-medium">
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
                ) : (
                    <div className="card p-20 text-center animate-fade-in">
                        <div className="w-16 h-16 rounded-full bg-white/5 mx-auto mb-6 flex items-center justify-center">
                            <Search className="w-8 h-8 text-mono-50" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-heading mb-3">No Proposals Found</h3>
                        <p className="text-body text-mono-60 mb-6 max-w-md mx-auto">
                            {searchQuery
                                ? `No proposals match your search "${searchQuery}". Try different keywords or adjust your filters.`
                                : 'No proposals match your current filters. Try adjusting your selection.'
                            }
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setFilterBy('all');
                            }}
                            className="btn btn-secondary mx-auto"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProposalsListScreen;
