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

    // Hide tip after 5 seconds
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
                    <div className="bg-black/90 text-white px-4 py-2 rounded-xl text-sm border border-purple-500/30 animate-fade-in shadow-lg shadow-purple-500/20">
                        Need help? Open the Map! 🗺️
                    </div>
                )}

                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 rounded-full bg-black/80 backdrop-blur-xl border border-white/20 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all flex items-center justify-center group"
                >
                    <div className="relative">
                        <Map className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping" />
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full" />
                    </div>
                </button>
            </div>

            {/* The Map Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md animate-fade-in flex items-center justify-center p-4 overflow-y-auto">
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>

                    <div className="w-full max-w-4xl h-[80vh] relative">
                        <div className="absolute top-0 left-0 p-6">
                            <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                                Quest Guide
                            </h2>
                            <p className="text-mono-60 mt-1">Navigate the Verse</p>
                        </div>

                        {/* Map Visualization */}
                        <div className="w-full h-full flex items-center justify-center relative">
                            {/* Connection Lines */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
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
                                                stroke="#ffffff20"
                                                strokeWidth="2"
                                                strokeDasharray="4 4"
                                            />
                                        );
                                    })
                                )}
                            </svg>

                            {/* Nodes */}
                            {NODES.map((node) => {
                                const Icon = node.icon;
                                const isCurrent = node.id === currentNode.id;
                                const isAvailable = true; // Could be gated logic here

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
                                        <div className={`
                                            w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-500
                                            ${isCurrent
                                                ? 'bg-purple-600 border-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.6)] scale-110'
                                                : 'bg-black border-white/20 hover:border-white/60 hover:scale-105'
                                            }
                                        `}>
                                            <Icon className={`w-8 h-8 ${isCurrent ? 'text-white' : 'text-mono-40 group-hover:text-white'}`} />
                                        </div>

                                        <div className={`
                                            px-3 py-1 rounded-full text-sm font-bold border transition-all
                                            ${isCurrent
                                                ? 'bg-purple-500/20 border-purple-500 text-purple-200'
                                                : 'bg-black/50 border-white/10 text-mono-60 group-hover:border-white/30'
                                            }
                                        `}>
                                            {node.label}
                                        </div>

                                        {isCurrent && (
                                            <div className="absolute -bottom-8 animate-bounce text-purple-400 text-xs font-bold flex items-center gap-1">
                                                <Target className="w-3 h-3" />
                                                YOU ARE HERE
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="absolute bottom-8 text-center w-full text-mono-60 text-sm">
                        Click a node to fast-travel
                    </div>
                </div>
            )}
        </>
    );
}
