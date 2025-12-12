'use client';

import React, { useState, useEffect } from 'react';
import { Map, X, Home, LayoutDashboard, Building2, Vote, ArrowRight, Zap, Target } from 'lucide-react';

interface QuestGuideProps {
    currentScreen: string;
    onNavigate: (screen: string) => void;
}

interface MapNode {
    id: string;
    label: string;
    icon: any;
    x: number;
    y: number;
    connections: string[];
    screenId: string;
}

const NODES: MapNode[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, x: 50, y: 20, connections: ['create-org', 'org-list'], screenId: 'dashboard' },
    { id: 'create-org', label: 'Create Org', icon: Zap, x: 25, y: 50, connections: [], screenId: 'org-setup' },
    { id: 'org-list', label: 'Organizations', icon: Building2, x: 75, y: 50, connections: ['room'], screenId: 'organization' },
    // Point 'Voting Room' to 'organization' list since specific room needs selection
    { id: 'room', label: 'Find a Room', icon: Vote, x: 75, y: 80, connections: [], screenId: 'organization' },
];

export default function QuestGuide({ currentScreen, onNavigate }: QuestGuideProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showTip, setShowTip] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowTip(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    const currentNode = NODES.find(n => n.screenId === currentScreen) || NODES[0];

    return (
        <>
            {/* The Floating Orb */}
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">
                {showTip && !isOpen && (
                    <div className="bg-amber-950/90 text-amber-100 px-4 py-2 rounded-xl text-sm border border-amber-500/30 animate-fade-in shadow-lg shadow-amber-500/20">
                        Open Map 🗺️
                    </div>
                )}

                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-900/90 to-black backdrop-blur-xl border border-amber-500/50 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center group"
                >
                    <div className="relative">
                        <Map className="w-6 h-6 text-amber-200 group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                    </div>
                </button>
            </div>

            {/* The Map Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-3xl animate-fade-in flex flex-col items-center justify-center">
                    {/* Header */}
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 bg-gradient-to-b from-black/80 to-transparent">
                        <div>
                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600">
                                WORLD MAP
                            </h2>
                            <p className="text-amber-500/60 text-sm tracking-widest uppercase mt-1">Select Destination</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors backdrop-blur-md"
                        >
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    {/* Map Container */}
                    <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 pt-24 pb-12">
                        <div className="w-full max-w-5xl h-full relative border border-white/5 rounded-3xl bg-black/40 overflow-hidden shadow-2xl shadow-black">

                            {/* Grid Background */}
                            <div className="absolute inset-0 opacity-10"
                                style={{ backgroundImage: 'linear-gradient(#F59E0B 1px, transparent 1px), linear-gradient(90deg, #F59E0B 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                            </div>

                            {/* Connection Lines (Behind Nodes) */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                                {NODES.map(node =>
                                    node.connections.map(targetId => {
                                        const target = NODES.find(n => n.id === targetId);
                                        if (!target) return null;
                                        return (
                                            <line
                                                key={`${node.id}-${targetId}`}
                                                x1={`${node.x}%`}
                                                y1={`${node.y}%`}
                                                x2={`${target.x}%`}
                                                y2={`${target.y}%`}
                                                stroke="#F59E0B"
                                                strokeOpacity="0.3"
                                                strokeWidth="1"
                                                strokeDasharray="6 6"
                                            />
                                        );
                                    })
                                )}
                            </svg>

                            {/* Nodes */}
                            <div className="absolute inset-0 z-10">
                                {NODES.map((node) => {
                                    const Icon = node.icon;
                                    const isCurrent = node.id === currentNode.id;

                                    return (
                                        <div
                                            key={node.id}
                                            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3 cursor-pointer group"
                                            style={{ left: `${node.x}%`, top: `${node.y}%` }}
                                            onClick={() => {
                                                onNavigate(node.screenId);
                                                setIsOpen(false);
                                            }}
                                        >
                                            {/* Node Icon Circle */}
                                            <div className={`
                                            w-16 h-16 rounded-2xl flex items-center justify-center border transition-all duration-300 relative
                                            ${isCurrent
                                                    ? 'bg-gradient-to-br from-amber-600 to-amber-900 border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.5)] scale-110 z-20'
                                                    : 'bg-black/60 border-white/10 hover:border-amber-500/50 hover:bg-amber-900/10 hover:scale-105 z-10'
                                                }
                                        `}>
                                                <Icon className={`w-7 h-7 ${isCurrent ? 'text-white' : 'text-zinc-500 group-hover:text-amber-200'} transition-colors`} />

                                                {/* Pulse Effect for Current */}
                                                {isCurrent && (
                                                    <div className="absolute inset-0 rounded-2xl border border-amber-400 animate-ping opacity-50"></div>
                                                )}
                                            </div>

                                            {/* Label Tag - Styled like the reference image (Gold Button style) */}
                                            <div className={`
                                            px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase transition-all
                                            ${isCurrent
                                                    ? 'bg-gradient-to-r from-amber-200 to-yellow-500 text-black shadow-lg shadow-amber-500/20 translate-y-1'
                                                    : 'bg-white/5 text-zinc-500 border border-white/5 group-hover:border-amber-500/30 group-hover:text-amber-200'
                                                }
                                        `}>
                                                {node.label}
                                            </div>

                                            {isCurrent && (
                                                <div className="absolute -top-10 text-amber-400 text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 animate-bounce">
                                                    <Target className="w-3 h-3" />
                                                    Current Location
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
