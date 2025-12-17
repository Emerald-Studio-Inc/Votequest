'use client';

import { useState } from 'react';
import { Shield, Users, Mic2, AlertTriangle, Send } from 'lucide-react';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';
import { sfx } from '@/lib/sfx';

export default function DebateArena({ roomId, onBack }: { roomId: string, onBack: () => void }) {
    const [side, setSide] = useState<'pro' | 'con' | null>(null);
    const [input, setInput] = useState('');

    const PRO_ARGUMENTS = [
        { id: 1, user: "Citizen_A", text: "We need this infrastructure for long term scalability.", score: 45 },
        { id: 2, user: "Trader_X", text: "ROI is calculated to be > 20%.", score: 12 }
    ];

    const CON_ARGUMENTS = [
        { id: 3, user: "Skeptic_01", text: "The treasury cannot sustain this burn rate.", score: 30 },
    ];

    return (
        <div className="min-h-screen bg-black text-white font-mono overflow-hidden flex flex-col">
            {/* Immersive Header */}
            <div className="h-48 relative flex items-center justify-center border-b border-white/10 shrink-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,0,0.1),transparent)]" />
                <div className="z-10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2 animate-pulse">
                        <AlertTriangle className="text-red-500 w-6 h-6" />
                        <span className="text-red-500 tracking-[0.3em] text-sm">INSTITUTIONAL_DEBATE_ACTIVE</span>
                        <AlertTriangle className="text-red-500 w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-bold uppercase glitch-text mb-4">Treasury Allocation #4092</h1>
                    <div className="flex gap-8 justify-center">
                        <div className="text-cyan-400 font-bold text-xl">PRO: {PRO_ARGUMENTS.length}</div>
                        <div className="text-white/20 text-xl">VS</div>
                        <div className="text-pink-500 font-bold text-xl">CON: {CON_ARGUMENTS.length}</div>
                    </div>
                </div>

                <button onClick={onBack} className="absolute top-6 left-6 text-gray-500 hover:text-white">{'< EXIT_ARENA'}</button>
            </div>

            {/* The Arena Split */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* PRO ZONE */}
                <div className="flex-1 border-r border-cyan-900/30 bg-cyan-950/5 p-4 overflow-y-auto custom-scrollbar relative">
                    <div className="sticky top-0 bg-black/80 backdrop-blur p-4 border-b border-cyan-500/30 mb-4 z-10 flex justify-between items-center">
                        <h2 className="text-cyan-400 font-bold text-lg tracking-widest">PRO_ARGUMENTS</h2>
                        <button
                            onClick={() => setSide('pro')}
                            className={`px-3 py-1 border text-xs uppercase transition-all ${side === 'pro' ? 'bg-cyan-500 text-black border-cyan-500' : 'border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10'}`}
                        >
                            JOIN_SIDE
                        </button>
                    </div>

                    <div className="space-y-4">
                        {PRO_ARGUMENTS.map(arg => (
                            <div key={arg.id} className="p-4 border-l-2 border-cyan-500 bg-cyan-900/10 hover:bg-cyan-900/20 transition-colors animate-slide-up">
                                <div className="text-xs text-cyan-300 mb-1 flex justify-between">
                                    <span>{arg.user}</span>
                                    <span>+{arg.score}</span>
                                </div>
                                <p className="text-gray-200 text-sm leading-relaxed">{arg.text}</p>
                            </div>
                        ))}

                        {side === 'pro' && (
                            <div className="mt-4 animate-fade-in">
                                <textarea
                                    className="w-full bg-black/50 border border-cyan-500/30 p-3 text-sm focus:border-cyan-500 focus:outline-none"
                                    placeholder="Enter your supporting argument..."
                                    rows={3}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                />
                                <ArcadeButton
                                    size="sm"
                                    variant="cyan"
                                    className="mt-2 w-full justify-center"
                                    onClick={() => {
                                        sfx.playClick();
                                        setInput('');
                                        // Mock submit
                                    }}
                                >
                                    SUBMIT_ARGUMENT
                                </ArcadeButton>
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
                        {CON_ARGUMENTS.map(arg => (
                            <div key={arg.id} className="p-4 border-r-2 border-pink-500 bg-pink-900/10 hover:bg-pink-900/20 transition-colors animate-slide-up text-right">
                                <div className="text-xs text-pink-300 mb-1 flex justify-between flex-row-reverse">
                                    <span>{arg.user}</span>
                                    <span>+{arg.score}</span>
                                </div>
                                <p className="text-gray-200 text-sm leading-relaxed">{arg.text}</p>
                            </div>
                        ))}

                        {side === 'con' && (
                            <div className="mt-4 animate-fade-in">
                                <textarea
                                    className="w-full bg-black/50 border border-pink-500/30 p-3 text-sm focus:border-pink-500 focus:outline-none text-right"
                                    placeholder="Enter your counter argument..."
                                    rows={3}
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                />
                                <ArcadeButton
                                    size="sm"
                                    variant="magenta"
                                    className="mt-2 w-full justify-center"
                                    onClick={() => {
                                        sfx.playClick();
                                        setInput('');
                                    }}
                                >
                                    SUBMIT_COUNTER
                                </ArcadeButton>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
