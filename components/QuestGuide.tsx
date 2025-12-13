'use client';

import React, { useState, useEffect } from 'react';
import { Map, X, Home, LayoutDashboard, Building2, Vote, ArrowRight, Zap, Target, Cpu, Globe } from 'lucide-react';
import CyberCard from './CyberCard';

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
    { id: 'dashboard', label: 'CMD_CENTER', icon: LayoutDashboard, x: 50, y: 20, connections: ['create-org', 'org-list'], screenId: 'dashboard' },
    { id: 'create-org', label: 'INIT_ORG', icon: Zap, x: 25, y: 50, connections: [], screenId: 'org-setup' },
    { id: 'org-list', label: 'ORG_NEXUS', icon: Building2, x: 75, y: 50, connections: ['room'], screenId: 'organization' },
    { id: 'room', label: 'VOTE_NODE', icon: Vote, x: 75, y: 80, connections: [], screenId: 'organization' },
];

export default function QuestGuide({ currentScreen, onNavigate }: QuestGuideProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showTip, setShowTip] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowTip(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    const currentNode = NODES.find(n => n.screenId === currentScreen) || NODES[0];

    // Neon color hex values - guaranteed to work
    const NEON_CYAN = '#00F0FF';
    const NEON_MAGENTA = '#FF003C';
    const NEON_LIME = '#39FF14';

    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setRotation(window.scrollY * 0.2);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* The Floating Orb - Cyber Style */}
            <div className="fixed bottom-6 right-6 z-50 flex items-center gap-4">
                {showTip && !isOpen && (
                    <div
                        className="bg-black/90 px-4 py-2 text-sm border animate-fade-in shadow-[0_0_15px_rgba(0,240,255,0.3)] font-mono glitch-text"
                        data-text="OPEN_MAP"
                        style={{ color: NEON_CYAN, borderColor: NEON_CYAN }}
                    >
                        OPEN_MAP
                    </div>
                )}

                <button
                    onClick={() => setIsOpen(true)}
                    className="group relative w-16 h-16 flex items-center justify-center transition-all duration-300 transform hover:scale-110"
                >
                    {/* Rotating Rings (Scroll Driven) */}
                    <div
                        className="absolute inset-0 rounded-full border-2 border-t-transparent border-l-transparent opacity-80"
                        style={{
                            borderColor: NEON_CYAN,
                            transform: `rotate(${rotation}deg)`
                        }}
                    ></div>
                    <div
                        className="absolute inset-2 rounded-full border-2 border-b-transparent border-r-transparent opacity-80"
                        style={{
                            borderColor: NEON_MAGENTA,
                            transform: `rotate(-${rotation * 1.5}deg)`
                        }}
                    ></div>

                    {/* Core */}
                    <div className="absolute inset-4 rounded-full bg-black border border-white/20 flex items-center justify-center backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_40px_rgba(0,240,255,0.6)]">
                        <Map className="w-5 h-5 group-hover:animate-pulse" style={{ color: NEON_CYAN }} />
                    </div>
                </button>
            </div>

            {/* The Map Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-3xl animate-fade-in flex flex-col items-center justify-center">

                    {/* Header */}
                    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20">
                        <div className="flex items-center gap-4">
                            <Globe className="w-8 h-8 animate-spin-slow" style={{ color: NEON_CYAN }} />
                            <div>
                                <h2
                                    className="text-3xl font-bold font-mono tracking-tighter"
                                    style={{ color: NEON_CYAN }}
                                >
                                    SYS.MAP_V1
                                </h2>
                                <p className="text-xs font-mono tracking-[0.2em] uppercase mt-1" style={{ color: `${NEON_CYAN}99` }}>
                                    // SELECT_DESTINATION
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-10 h-10 rounded-none border flex items-center justify-center transition-all group"
                            style={{ borderColor: NEON_MAGENTA }}
                        >
                            <X className="w-6 h-6 group-hover:scale-110" style={{ color: NEON_MAGENTA }} />
                        </button>
                    </div>

                    {/* Map Container */}
                    <div className="w-full h-full flex items-center justify-center p-4 sm:p-8 pt-24 pb-12">
                        <div
                            className="w-full max-w-5xl relative bg-black/90 overflow-visible shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                            style={{
                                border: `2px solid ${NEON_CYAN}`,
                                minHeight: '400px',
                                height: '60vh'
                            }}
                        >

                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: NEON_CYAN }}></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: NEON_CYAN }}></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: NEON_CYAN }}></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: NEON_CYAN }}></div>

                            {/* Connection Lines SVG */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
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
                                                stroke={NEON_CYAN}
                                                strokeOpacity="0.5"
                                                strokeWidth="2"
                                                strokeDasharray="5,5"
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
                                            {/* Node Hexagon/Circle */}
                                            <div className={`
                                                w-20 h-20 flex items-center justify-center transition-all duration-300 relative clip-path-hexagon
                                                ${isCurrent
                                                    ? 'scale-110 z-20'
                                                    : 'hover:scale-105 z-10'
                                                }
                                            `}>
                                                {/* Background Shape */}
                                                <div
                                                    className="absolute inset-0 border-2 transition-colors duration-300"
                                                    style={{
                                                        transform: 'rotate(45deg)',
                                                        backgroundColor: isCurrent ? `${NEON_CYAN}30` : 'rgba(0,0,0,0.8)',
                                                        borderColor: isCurrent ? NEON_CYAN : '#ffffff',
                                                        boxShadow: isCurrent ? `0 0 30px ${NEON_CYAN}` : 'none'
                                                    }}
                                                ></div>

                                                <Icon
                                                    className="w-8 h-8 z-10 transition-colors"
                                                    style={{ color: isCurrent ? NEON_CYAN : '#ffffff' }}
                                                />

                                                {/* Ripple for Current */}
                                                {isCurrent && (
                                                    <div
                                                        className="absolute inset-0 border animate-ping opacity-50"
                                                        style={{ transform: 'rotate(45deg)', borderColor: NEON_CYAN }}
                                                    ></div>
                                                )}
                                            </div>

                                            {/* Label */}
                                            <div
                                                className="px-3 py-1 text-[10px] font-mono tracking-widest uppercase transition-all border"
                                                style={{
                                                    backgroundColor: isCurrent ? NEON_CYAN : 'rgba(0,0,0,0.9)',
                                                    color: isCurrent ? 'black' : '#ffffff',
                                                    borderColor: isCurrent ? NEON_CYAN : '#ffffff',
                                                    fontWeight: isCurrent ? 'bold' : 'normal'
                                                }}
                                            >
                                                {node.label}
                                            </div>

                                            {isCurrent && (
                                                <div
                                                    className="absolute -top-12 text-[10px] font-mono animate-bounce flex flex-col items-center"
                                                    style={{ color: NEON_LIME }}
                                                >
                                                    <Target className="w-4 h-4 mb-1" />
                                                    YOU_ARE_HERE
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="absolute bottom-6 left-6 text-xs font-mono text-gray-400">
                        <div className="flex items-center gap-2">
                            <Cpu className="w-4 h-4" />
                            <span>SYSTEM_READY</span>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
