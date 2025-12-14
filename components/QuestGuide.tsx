'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Map, X, LayoutDashboard, Building2, Vote, Zap, Globe, Target, Cpu } from 'lucide-react';

interface QuestGuideProps {
    currentScreen: string;
    onNavigate: (screen: string) => void;
}

interface MapNode {
    id: string;
    label: string;
    icon: any;
    screenId: string;
    desc: string;
}

const NODES: MapNode[] = [
    { id: 'dashboard', label: 'CMD_CENTER', icon: LayoutDashboard, screenId: 'dashboard', desc: 'Main Operations' },
    { id: 'create-org', label: 'INIT_ORG', icon: Zap, screenId: 'org-setup', desc: 'Create Organization' },
    { id: 'org-list', label: 'ORG_NEXUS', icon: Building2, screenId: 'organization', desc: 'Browse Organizations' },
    { id: 'vote', label: 'VOTE_NODE', icon: Vote, screenId: 'organization', desc: 'Active Votes' }, // Simplified routing
];

export default function QuestGuide({ currentScreen, onNavigate }: QuestGuideProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showTip, setShowTip] = useState(true);
    const [rotation, setRotation] = useState(0); // For Orb
    const [wheelRotation, setWheelRotation] = useState(0); // For 3D Wheel

    // Auto-snap to nearest node
    const snapTimeout = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const timer = setTimeout(() => setShowTip(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    // Ambient rotation for Orb
    useEffect(() => {
        const handleScroll = () => {
            setRotation(window.scrollY * 0.2);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Neon colors
    const NEON_CYAN = '#00F0FF';
    const NEON_MAGENTA = '#FF003C';
    const NEON_LIME = '#39FF14';

    const handleWheel = (e: React.WheelEvent) => {
        setWheelRotation(prev => prev + (e.deltaY * 0.1));

        // Clear existing snap
        if (snapTimeout.current) clearTimeout(snapTimeout.current);

        // Set new snap
        snapTimeout.current = setTimeout(() => {
            const step = 360 / NODES.length;
            setWheelRotation(prev => {
                const remainder = prev % step;
                return prev - remainder + (remainder > step / 2 ? step : 0);
            });
        }, 500);
    };

    // Calculate current node based on rotation
    const normalizedRotation = (wheelRotation % 360 + 360) % 360;
    const step = 360 / NODES.length;
    const currentIndex = Math.round(normalizedRotation / step) % NODES.length;
    const activeNode = NODES[(NODES.length - currentIndex) % NODES.length]; // Reversed due to rotation direction

    return (
        <>
            {/* The Floating Orb - Z-index fixed to be above content but below HUD if needed, essentially float z-[60] */}
            <div className="fixed bottom-24 right-6 z-[60] flex items-center gap-4">
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
                    {/* Rotating Rings */}
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

            {/* The Map Overlay - HIGH VISIBILITY Z-INDEX [100] */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl animate-fade-in flex flex-col items-center justify-center overflow-hidden"
                    onWheel={handleWheel}
                    onClick={() => setIsOpen(false)}
                >

                    {/* Header Info */}
                    <div className="absolute top-12 left-0 w-full text-center pointer-events-none z-10">
                        <h2 className="text-4xl font-bold font-mono tracking-tighter glow-text-cyan mb-2" style={{ color: NEON_CYAN }}>
                            NAV_SYSTEM
                        </h2>
                        <div className="flex justify-center gap-4 text-xs font-mono uppercase tracking-widest">
                            <span className="px-2 py-1 border border-white/20 rounded text-white bg-white/5">
                                SCROLL TO ROTATE
                            </span>
                            <span className="px-2 py-1 border border-white/20 rounded text-white bg-white/5">
                                CLICK TO ENTER
                            </span>
                        </div>
                    </div>

                    {/* 3D Wheel Container */}
                    <div
                        className="relative w-full max-w-lg h-[500px] flex items-center justify-center"
                        style={{ perspective: '1200px' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="relative w-full h-full transition-transform duration-500 ease-out"
                            style={{
                                transformStyle: 'preserve-3d',
                                transform: `rotateX(-5deg) rotateY(${wheelRotation}deg)`
                            }}
                        >
                            {NODES.map((node, index) => {
                                const angle = (index * 360) / NODES.length;
                                const radius = 300; // Larger radius for separation

                                return (
                                    <div
                                        key={node.id}
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                                        style={{
                                            transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                                            transformStyle: 'preserve-3d'
                                        }}
                                        onClick={() => {
                                            onNavigate(node.screenId);
                                            setIsOpen(false);
                                        }}
                                    >
                                        <div
                                            className="w-56 h-64 bg-black border-2 flex flex-col items-center justify-center gap-6 transition-all duration-300 hover:scale-110 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
                                            style={{
                                                borderColor: NEON_CYAN,
                                                boxShadow: `0 0 20px ${NEON_CYAN}40`
                                            }}
                                        >
                                            <div className="p-4 rounded-full border-2 bg-black/50" style={{ borderColor: NEON_MAGENTA }}>
                                                <node.icon className="w-10 h-10" style={{ color: NEON_CYAN }} />
                                            </div>

                                            <div className="text-center px-4">
                                                <p className="text-lg font-bold font-mono text-white mb-2 tracking-wider">{node.label}</p>
                                                <p className="text-xs text-white/80 font-bold uppercase tracking-wide bg-white/10 py-1 px-2 rounded">{node.desc}</p>
                                            </div>

                                            {/* Corner Accents - HIGH VISIBILITY */}
                                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4" style={{ borderColor: NEON_CYAN }} />
                                            <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4" style={{ borderColor: NEON_CYAN }} />
                                            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4" style={{ borderColor: NEON_CYAN }} />
                                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4" style={{ borderColor: NEON_CYAN }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Close Button - High contrast at bottom */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute bottom-20 flex items-center gap-2 px-8 py-3 border-2 bg-black hover:bg-white/10 transition-colors z-50 pointer-events-auto shadow-[0_0_20px_rgba(255,0,60,0.3)]"
                        style={{ borderColor: NEON_MAGENTA }}
                    >
                        <X className="w-5 h-5" style={{ color: NEON_MAGENTA }} />
                        <span className="font-mono text-sm font-bold text-white uppercase tracking-widest">CLOSE MAP</span>
                    </button>

                </div>
            )}
        </>
    );
}
