import React, { useState, useMemo } from 'react';
import { Search, Filter, Clock, Users, TrendingUp, Check, ArrowUpRight, X, ChevronDown, Sparkles } from 'lucide-react';
import { ProposalWithOptions } from '@/lib/supabase';
import Tooltip from './Tooltip';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

interface ProposalsListScreenProps {
    proposals: ProposalWithOptions[];
    onSelectProposal: (proposal: ProposalWithOptions) => void;
    hasVoted: (proposalId: string) => boolean;
}

type SortOption = 'recent' | 'popular' | 'ending-soon';
type FilterOption = 'all' | 'active' | 'voted' | 'not-voted';

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

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

        if (diff <= 0) return { text: 'EXPIRED', urgent: false, ended: true, sortValue: 0 };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        const urgent = diff < 24 * 60 * 60 * 1000;

        if (days > 0) {
            return { text: `${days}D ${hours}H`, urgent, ended: false, sortValue: diff };
        } else if (hours > 0) {
            return { text: `${hours}H ${minutes}M`, urgent, ended: false, sortValue: diff };
        } else {
            return { text: `${minutes}M LEFT`, urgent: true, ended: false, sortValue: diff };
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
                    // Sort featured first, then by date
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }
        });

        return sorted;
    }, [proposals, searchQuery, sortBy, filterBy, hasVoted]);

    const activeCount = proposals.filter(p => p.status === 'active').length;
    const votedCount = proposals.filter(p => hasVoted(p.id)).length;

    return (
        <div className="min-h-screen pb-32 relative">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header Section */}
            <div className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl" style={{ borderBottom: `1px solid ${NEON_CYAN}30` }}>
                <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6">
                    <div className="mb-6 flex items-end justify-between">
                        <div>
                            <h1 className="text-2xl font-bold uppercase tracking-widest text-white glitch-text" data-text="MISSION_LOG">MISSION_LOG</h1>
                            <p className="text-xs font-mono text-gray-400 mt-1 uppercase">
                                {'>'} DISPLAYING {processedProposals.length} / {proposals.length} RECORDS
                            </p>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex items-center gap-4">
                        {/* Search Bar */}
                        <div className="flex-1 relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[color:var(--neon-cyan)]" style={{ '--neon-cyan': NEON_CYAN } as React.CSSProperties} />
                            <input
                                type="text"
                                placeholder="SEARCH_DATABASE..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black border border-gray-800 py-2 pl-12 pr-12 text-sm font-mono text-white focus:outline-none transition-colors"
                                style={{ borderColor: searchQuery ? NEON_CYAN : undefined }}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:text-white text-gray-500"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="appearance-none bg-black border border-gray-800 text-white text-xs font-mono uppercase px-4 py-2.5 pr-10 cursor-pointer focus:outline-none hover:border-gray-500"
                            >
                                <option value="recent">SORT: MOST_RECENT</option>
                                <option value="popular">SORT: POPULARITY</option>
                                <option value="ending-soon">SORT: TIME_REMAINING</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                        </div>

                        {/* Filter Toggle */}
                        {/* Filter Toggle */}
                        <ArcadeButton
                            onClick={() => setShowFilters(!showFilters)}
                            variant="cyan"
                            size="sm"
                            className={!showFilters ? 'opacity-60 hover:opacity-100' : ''}
                            glow={showFilters}
                        >
                            <Filter className="w-3 h-3 mr-2" />
                            FILTERS
                        </ArcadeButton>
                    </div>

                    {/* Filter Pills */}
                    {showFilters && (
                        <div className="mt-4 flex items-center gap-3 animate-slide-down border-t border-gray-800 pt-4">
                            <span className="text-[10px] text-gray-500 font-mono uppercase">FILTER_BY:</span>
                            <div className="flex items-center gap-2">
                                {[
                                    { value: 'all' as FilterOption, label: 'ALL', count: proposals.length },
                                    { value: 'active' as FilterOption, label: 'ACTIVE', count: activeCount },
                                    { value: 'voted' as FilterOption, label: 'COMPLETED', count: votedCount },
                                    { value: 'not-voted' as FilterOption, label: 'PENDING', count: activeCount - votedCount }
                                ].map((filter) => (
                                    <ArcadeButton
                                        key={filter.value}
                                        onClick={() => setFilterBy(filter.value)}
                                        variant="cyan"
                                        size="sm"
                                        className={`text-[10px] ${filterBy !== filter.value ? 'opacity-60 hover:opacity-100' : ''}`}
                                        glow={filterBy === filter.value}
                                    >
                                        {filter.label} <span className="opacity-50 ml-1">[{filter.count}]</span>
                                    </ArcadeButton>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Proposals Grid */}
            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 pt-6 md:pt-8 bg-transparent">
                {processedProposals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {processedProposals.map((proposal, index) => {
                            const timeLeft = formatTimeLeft(proposal.end_date);
                            const voted = hasVoted(proposal.id);
                            const totalVotes = proposal.options.reduce((sum: number, opt: any) => sum + opt.votes, 0);
                            const leadingOption = [...proposal.options].sort((a, b) => b.votes - a.votes)[0];
                            const leadingPercentage = totalVotes > 0
                                ? Math.round((leadingOption.votes / totalVotes) * 100)
                                : 0;

                            return (
                                <CyberCard
                                    key={proposal.id}
                                    className="h-full flex flex-col cursor-pointer group hover:bg-white/[0.02]"
                                    onClick={() => onSelectProposal(proposal)}
                                    title={`WQ-${proposal.id.slice(0, 4)}`}
                                    cornerStyle="tech"
                                >
                                    {/* Featured Badge */}
                                    {proposal.featured && (
                                        <div className="absolute top-0 right-0 z-20 bg-yellow-500/10 border-l border-b border-yellow-500/50 text-yellow-500 text-[10px] uppercase font-bold px-3 py-1 flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            PRIORITY
                                        </div>
                                    )}

                                    <div className="flex-1 flex flex-col h-full">
                                        {/* Header */}
                                        <div className="mb-4">
                                            <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 uppercase group-hover:text-[color:var(--neon-cyan)] transition-colors" style={{ '--neon-cyan': NEON_CYAN } as React.CSSProperties}>
                                                {proposal.title}
                                            </h3>
                                            <p className="text-xs text-gray-500 line-clamp-2 font-mono">
                                                {'>'} {proposal.description}
                                            </p>
                                        </div>

                                        {/* Quick Stats */}
                                        <div className="mt-auto space-y-4">
                                            {/* Leading Option */}
                                            {leadingOption && (
                                                <div className="p-3 bg-white/[0.03] border border-white/10">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-[10px] text-gray-300 uppercase font-mono">CURRENT_LEAD</span>
                                                        <span className="text-xs font-bold text-white font-mono">{leadingPercentage}%</span>
                                                    </div>
                                                    <div className="h-1 bg-gray-800 w-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-white transition-all duration-1000"
                                                            style={{
                                                                width: `${leadingPercentage}%`,
                                                                backgroundColor: NEON_CYAN,
                                                                boxShadow: `0 0 5px ${NEON_CYAN}`
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Footer Metadata */}
                                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 font-mono">
                                                        <Users className="w-3 h-3" />
                                                        <span>{totalVotes.toLocaleString()}</span>
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 text-xs font-mono ${timeLeft.urgent ? 'text-orange-400 animate-pulse' : 'text-gray-400'}`}>
                                                        <Clock className="w-3 h-3" />
                                                        <span>{timeLeft.text}</span>
                                                    </div>
                                                </div>

                                                {voted ? (
                                                    <div className="px-2 py-1 border text-[10px] font-bold uppercase flex items-center gap-1" style={{ borderColor: NEON_LIME, color: NEON_LIME, backgroundColor: `${NEON_LIME}10` }}>
                                                        <Check className="w-3 h-3" />
                                                        LOGGED
                                                    </div>
                                                ) : (
                                                    <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CyberCard>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 border border-dashed border-gray-800">
                        <div className="inline-block p-4 rounded-full bg-white/5 mb-4">
                            <Search className="w-8 h-8 text-gray-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white uppercase tracking-widest mb-2">NO_DATA_FOUND</h3>
                        <div className="flex gap-2 justify-center mt-4">
                            <button
                                onClick={() => { setSearchQuery(''); setFilterBy('all'); }}
                                className="text-xs text-gray-500 hover:text-white uppercase font-mono underline"
                            >
                                [ RESET_PARAMETERS ]
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProposalsListScreen;
