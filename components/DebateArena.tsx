'use client';

import { useState, useEffect } from 'react';
import { Shield, Users, Mic2, AlertTriangle, Send, Loader2 } from 'lucide-react';
import CyberCard from './CyberCard';
import CyberButton from './CyberButton';
import { sfx } from '@/lib/sfx';

interface Argument {
    id: string;
    content: string;
    side: 'pro' | 'con';
    upvotes: number;
    user?: {
        username: string;
        global_rank: number;
    };
    created_at: string;
}

export default function DebateArena({ roomId, userId, onBack }: { roomId: string, userId: string, onBack: () => void }) {
    const [side, setSide] = useState<'pro' | 'con' | null>(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Data State
    const [debate, setDebate] = useState<any>(null);
    const [proArgs, setProArgs] = useState<Argument[]>([]);
    const [conArgs, setConArgs] = useState<Argument[]>([]);

    useEffect(() => {
        loadDebate();
    }, [roomId]);

    const loadDebate = async () => {
        try {
            const res = await fetch(`/api/debates/${roomId}`);
            if (res.ok) {
                const data = await res.json();
                setDebate(data.debate);
                setProArgs(data.proArguments || []);
                setConArgs(data.conArguments || []);
            }
        } catch (error) {
            console.error('Failed to load debate:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!input.trim() || !side) return;

        setSubmitting(true);
        sfx.playClick();

        try {
            const res = await fetch(`/api/debates/${roomId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    content: input,
                    side
                })
            });

            if (res.ok) {
                setInput('');
                // Reload to see new argument
                loadDebate();
            }
        } catch (error) {
            console.error('Failed to submit argument:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-mono overflow-hidden flex flex-col">
            {/* Immersive Header */}
            <div className="h-48 relative flex items-center justify-center border-b border-white/10 shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.1),transparent)]" />
                <div className="z-10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2 animate-pulse">
                        <AlertTriangle className="text-red-500 w-6 h-6" />
                        <span className="text-red-500 tracking-[0.3em] text-sm">
                            {debate?.status === 'live' ? 'INSTITUTIONAL_DEBATE_ACTIVE' : 'DEBATE_ARCHIVE'}
                        </span>
                        <AlertTriangle className="text-red-500 w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-bold uppercase glitch-text mb-4 max-w-3xl truncate px-4">{debate?.title || 'Unknown Debate'}</h1>
                    <div className="flex gap-8 justify-center">
                        <div className="text-blue-400 font-bold text-xl">PRO: {proArgs.length}</div>
                        <div className="text-white/20 text-xl">VS</div>
                        <div className="text-pink-500 font-bold text-xl">CON: {conArgs.length}</div>
                    </div>
                </div>

                <button onClick={onBack} className="absolute top-6 left-6 text-gray-500 hover:text-white">{'< EXIT_ARENA'}</button>
            </div>

            {/* The Arena Split */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* PRO ZONE */}
                <div className="flex-1 border-r border-blue-900/30 bg-blue-950/5 p-4 overflow-y-auto custom-scrollbar relative">
                    <div className="sticky top-0 bg-black/80 backdrop-blur p-4 border-b border-blue-500/30 mb-4 z-10 flex justify-between items-center">
                        <h2 className="text-blue-400 font-bold text-lg tracking-widest">PRO_ARGUMENTS</h2>
                        <button
                            onClick={() => setSide('pro')}
                            className={`px-3 py-1 border text-xs uppercase transition-all ${side === 'pro' ? 'bg-blue-500 text-black border-blue-500' : 'border-blue-500/50 text-blue-500 hover:bg-blue-500/10'}`}
                        >
                            JOIN_SIDE
                        </button>
                    </div>

                    <div className="space-y-4">
                        {proArgs.map(arg => (
                            <div key={arg.id} className="p-4 border-l-2 border-blue-500 bg-blue-900/10 hover:bg-blue-900/20 transition-colors animate-slide-up">
                                <div className="text-xs text-blue-300 mb-1 flex justify-between">
                                    <span>{arg.user?.username || 'Anon'} (Rank {arg.user?.global_rank ?? '?'})</span>
                                    <span>+{arg.upvotes}</span>
                                </div>
                                <p className="text-gray-200 text-sm leading-relaxed">{arg.content}</p>
                            </div>
                        ))}

                        {proArgs.length === 0 && (
                            <div className="text-center py-10 text-blue-500/30 italic">No arguments yet. Be the first.</div>
                        )}

                        {side === 'pro' && (
                            <div className="mt-4 animate-fade-in p-4 bg-blue-950/20 border border-blue-500/30 rounded">
                                <textarea
                                    className="w-full bg-black/50 border border-blue-500/30 p-3 text-sm focus:border-blue-500 focus:outline-none text-white placeholder-blue-700/50"
                                    placeholder="Enter your supporting argument..."
                                    rows={3}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    disabled={submitting}
                                />
                                <CyberButton
                                    className="mt-2 w-full justify-center"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? 'TRANSMITTING...' : 'SUBMIT_ARGUMENT'}
                                </CyberButton>
                            </div>
                        )}
                    </div>
                </div>

                {/* CON ZONE */}
                <div className="flex-1 bg-pink-950/5 p-4 overflow-y-auto custom-scrollbar relative">
                    <div className="sticky top-0 bg-black/80 backdrop-blur p-4 border-b border-pink-500/30 mb-4 z-10 flex justify-between items-center">
                        <h2 className="text-pink-500 font-bold text-lg tracking-widest">CON_ARGUMENTS</h2>
                        <button
                            onClick={() => setSide('con')}
                            className={`px-3 py-1 border text-xs uppercase transition-all ${side === 'con' ? 'bg-pink-500 text-black border-pink-500' : 'border-pink-500/50 text-pink-500 hover:bg-pink-500/10'}`}
                        >
                            JOIN_SIDE
                        </button>
                    </div>

                    <div className="space-y-4">
                        {conArgs.map(arg => (
                            <div key={arg.id} className="p-4 border-r-2 border-pink-500 bg-pink-900/10 hover:bg-pink-900/20 transition-colors animate-slide-up text-right">
                                <div className="text-xs text-pink-300 mb-1 flex justify-between flex-row-reverse">
                                    <span>{arg.user?.username || 'Anon'} (Rank {arg.user?.global_rank ?? '?'})</span>
                                    <span>+{arg.upvotes}</span>
                                </div>
                                <p className="text-gray-200 text-sm leading-relaxed">{arg.content}</p>
                            </div>
                        ))}

                        {conArgs.length === 0 && (
                            <div className="text-center py-10 text-pink-500/30 italic">No counter-arguments yet.</div>
                        )}

                        {side === 'con' && (
                            <div className="mt-4 animate-fade-in p-4 bg-pink-950/20 border border-pink-500/30 rounded">
                                <textarea
                                    className="w-full bg-black/50 border border-pink-500/30 p-3 text-sm focus:border-pink-500 focus:outline-none text-right text-white placeholder-pink-700/50"
                                    placeholder="Enter your counter argument..."
                                    rows={3}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    disabled={submitting}
                                />
                                <CyberButton
                                    className="mt-2 w-full justify-center"
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                >
                                    {submitting ? 'TRANSMITTING...' : 'SUBMIT_COUNTER'}
                                </CyberButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
