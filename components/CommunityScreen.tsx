'use client';

import { useState } from 'react';
import { MessageSquare, Flame, TrendingUp, Search, Filter } from 'lucide-react';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

export default function CommunityScreen({ onNavigate }: { onNavigate: (screen: string, data?: any) => void }) {
    const [activeTab, setActiveTab] = useState<'hot' | 'new' | 'debates'>('hot');

    const MOCK_THREADS = [
        { id: 1, title: "Should we implement Quadratic Voting?", author: "DAO_Architect", replies: 45, upvotes: 120, tag: "Governance" },
        { id: 2, title: "[DEBATE] AI-Driven Treasury Management", author: "System", type: "debate", status: "live", participants: 12 },
        { id: 3, title: "Proposal 104 Needs a revision", author: "Voter_One", replies: 8, upvotes: 24, tag: "General" }
    ];

    return (
        <div className="min-h-screen pb-32 animate-fade-in font-mono relative bg-black">
            {/* Background */}
            <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,100,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,100,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            {/* Header */}
            <div className="pt-24 px-6 mb-8 relative z-10">
                <h1 className="text-4xl font-bold uppercase tracking-wider glitch-text mb-2" data-text="COMMUNITY_GRID">COMMUNITY_GRID</h1>
                <p className="text-green-400/60 font-mono text-sm">{'>'} GLOBAL_DISCOURSE_NETWORK</p>
            </div>

            {/* Filters */}
            <div className="px-6 mb-8 flex gap-4 overflow-x-auto relative z-10 scrollbar-hide">
                {['HOT', 'NEW', 'DEBATES'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab.toLowerCase() as any)}
                        className={`
                            px-6 py-2 border font-bold tracking-wider transition-all
                            ${activeTab === tab.toLowerCase()
                                ? 'bg-green-500/20 border-green-500 text-green-400'
                                : 'bg-black/40 border-white/10 text-gray-500 hover:text-white'}
                        `}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Feed */}
            <div className="px-6 space-y-4 max-w-4xl relative z-10">
                {MOCK_THREADS.map((thread) => (
                    <CyberCard key={thread.id} className="p-0 overflow-hidden cursor-pointer group hover:border-green-500/50 transition-colors"
                        onClick={() => onNavigate('thread', thread.id)}
                    >
                        <div className="p-6 flex gap-4">
                            {/* Vote Column */}
                            <div className="flex flex-col items-center gap-1 text-gray-500 bg-white/5 p-2 rounded self-start">
                                <TrendingUp className="w-4 h-4 hover:text-green-400" />
                                <span className="text-sm font-bold text-white">{thread.upvotes || 0}</span>
                            </div>

                            <div className="flex-1">
                                {thread.type === 'debate' && (
                                    <span className="inline-block px-2 py-0.5 bg-red-500/20 text-red-500 text-[10px] font-bold border border-red-500/30 rounded mb-2 animate-pulse">
                                        LIVE_DEBATE
                                    </span>
                                )}
                                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{thread.title}</h3>
                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>by {thread.author}</span>
                                    <span>{thread.replies || thread.participants} {thread.type === 'debate' ? 'PARTICIPANTS' : 'COMMENTS'}</span>
                                    {thread.tag && <span className="px-2 py-0.5 bg-white/10 rounded">{thread.tag}</span>}
                                </div>
                            </div>
                        </div>
                    </CyberCard>
                ))}
            </div>
        </div>
    );
}
