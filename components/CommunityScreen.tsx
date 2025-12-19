'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Flame, TrendingUp, Search, Filter, ShieldAlert, Zap, Loader2 } from 'lucide-react';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

interface FeedItem {
    id: string;
    title: string;
    author: string;
    type: 'debate' | 'discussion';
    status?: string | null;
    participants?: number | null;
    views?: string | null;
    upvotes?: number | null;
    replies?: number | null;
    tag?: string | null;
}

export default function CommunityScreen({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
    const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'debates'>('hot');
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch feed from API
    useEffect(() => {
        const fetchFeed = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/community?filter=${activeTab}`);
                const data = await res.json();
                setFeed(data.feed || []);
            } catch (error) {
                console.error('Failed to fetch community feed:', error);
                setFeed([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeed();
    }, [activeTab]);

    return (
        <div className="min-h-screen pb-32 animate-fade-in font-mono relative bg-void">
            {/* Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(0,85,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,85,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <div className="pt-24 px-6 md:px-8 mb-8 relative z-10 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter glitch-text mb-2 text-white" data-text="THE_GRID">THE_GRID</h1>
                    <p className="text-blue-500/60 font-mono text-sm tracking-widest">{'>'} GLOBAL_DISCOURSE_NETWORK</p>
                </div>
                <div className="flex gap-2">
                    <ArcadeButton variant="cyan" size="sm" onClick={() => { }} className="text-xs">
                        <Filter className="w-3 h-3 mr-2" /> FILTER
                    </ArcadeButton>
                    <ArcadeButton variant="lime" size="sm" onClick={() => { }} className="text-xs">
                        <Search className="w-3 h-3 mr-2" /> SEARCH
                    </ArcadeButton>
                </div>
            </div>

            {/* Filters */}
            <div className="px-6 md:px-8 mb-8 flex gap-4 overflow-x-auto relative z-10 scrollbar-hide pb-2">
                {[
                    { id: 'hot', label: '🔥 HOT' },
                    { id: 'new', label: '✨ NEW' },
                    { id: 'debates', label: '⚔️ ARENA' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            px-6 py-2 border font-bold tracking-wider transition-all clip-corner
                            ${activeTab === tab.id
                                ? 'bg-[#0055FF] text-white border-[#0055FF] shadow-[0_0_15px_rgba(0,85,255,0.4)]'
                                : 'bg-void/40 border-white/5 text-gray-400 hover:text-white hover:border-white/20'}
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Grid Layout */}
            <div className="px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 max-w-7xl mx-auto">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    </div>
                ) : feed.length === 0 ? (
                    <div className="col-span-full text-center py-20">
                        <p className="text-gray-500 font-mono text-lg uppercase">NO_THREADS_FOUND</p>
                        <p className="text-gray-600 text-sm mt-2">Initialize discourse to begin.</p>
                    </div>
                ) : (
                    feed.map((thread) => {
                        const isDebate = thread.type === 'debate';
                        const colSpan = isDebate ? 'md:col-span-2 lg:col-span-2' : 'col-span-1';

                        return (
                            <div key={thread.id} className={`${colSpan} group`}>
                                <CyberCard
                                    className={`h-full p-0 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 
                                        ${isDebate ? 'hover:shadow-[0_0_30px_rgba(255,0,60,0.15)]' : 'hover:shadow-[0_0_20px_rgba(0,85,255,0.1)]'}
                                    `}
                                    onClick={() => onNavigate('thread', thread.id)}
                                >
                                    <div className={`p-6 flex flex-col h-full bg-ash-dark ${isDebate ? 'border-l-2 border-red-900/40 bg-gradient-to-br from-red-950/10 to-transparent' : ''}`}>

                                        {/* Header / Badges */}
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex gap-2">
                                                {isDebate && (
                                                    <span className="flex items-center px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold border border-red-500/30 rounded animate-pulse">
                                                        <ShieldAlert className="w-3 h-3 mr-1" />
                                                        LIVE_BATTLE
                                                    </span>
                                                )}
                                                {thread.tag && (
                                                    <span className="px-2 py-0.5 bg-white/5 text-gray-500 border border-white/5 text-[10px] rounded uppercase tracking-wider">
                                                        {thread.tag}
                                                    </span>
                                                )}
                                            </div>
                                            {isDebate ? (
                                                <div className="flex items-center text-red-400 text-xs font-mono">
                                                    <Zap className="w-3 h-3 mr-1" /> {thread.views} watching
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-blue-500 text-xs font-mono">
                                                    <TrendingUp className="w-3 h-3 mr-1" /> {thread.upvotes}
                                                </div>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <h3 className={`text-lg md:text-xl font-bold mb-3 leading-snug font-mono
                                        ${isDebate ? 'text-white' : 'text-gray-100 group-hover:text-blue-500 transition-colors'}
                                    `}>
                                            {thread.title}
                                        </h3>

                                        {/* Footer */}
                                        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-gray-500 border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-ash-light flex items-center justify-center font-bold text-[10px] text-gray-400 border border-white/5">
                                                    {thread.author.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-mono">@{thread.author}</span>
                                            </div>
                                            <div className="flex items-center gap-1 font-mono">
                                                <MessageSquare className="w-3 h-3" />
                                                <span>{thread.replies || thread.participants} {isDebate ? 'FIGHTERS' : 'REPLIES'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CyberCard>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
