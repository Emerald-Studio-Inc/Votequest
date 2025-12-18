'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Map, X, LayoutDashboard, Building2, Vote, Zap, Globe, Target, Cpu, Send, MessageCircle, Maximize2, Minimize2 } from 'lucide-react';
import ArcadeButton from './ArcadeButton';

interface ChatMessage {
    role: 'user' | 'architect';
    content: string;
}

interface QuestGuideProps {
    currentScreen: string;
    onNavigate: (screen: string) => void;
    message?: string | null;
    onMessageComplete?: () => void;
    userData?: { level?: number; coins?: number };
}

interface MapNode {
    id: string;
    label: string;
    icon: any;
    screenId: string;
    desc: string;
}

const NODES: MapNode[] = [
    {
        id: 'dashboard',
        label: 'CMD_CENTER',
        icon: LayoutDashboard,
        screenId: 'dashboard',
        desc: 'Your central hub for operations. Monitor your Voting Power, track Global Rank, and manage your active mission status. This is where your governance journey begins.'
    },
    {
        id: 'create-org',
        label: 'INIT_ORG',
        icon: Zap,
        screenId: 'org-setup',
        desc: 'Launch a new Decentralized Organization. Establish governance protocols, set voting thresholds, and deploy smart contracts to bring your community on-chain.'
    },
    {
        id: 'org-list',
        label: 'ORG_NEXUS',
        icon: Building2,
        screenId: 'organization',
        desc: 'The directory of all active organizations. Discover communities, join causes, and analyze governance metrics across the entire VoteQuest ecosystem.'
    },
    {
        id: 'vote',
        label: 'VOTE_NODE',
        icon: Vote,
        screenId: 'proposals',
        desc: 'Execute your civic duty. Cast immutable votes on active proposals, earn VQC tokens for participation, and influence the future of your organizations.'
    },
    {
        id: 'about',
        label: 'SYSTEM_INTEL',
        icon: Cpu,
        screenId: 'dashboard', // Stays on dashboard but shows info
        desc: 'VoteQuest solves the transparency crisis in modern governance. By gamifying civic engagement and securing votes on-chain, we ensure every voice matters and every action is verifiable.'
    },
];

export default function QuestGuide({ currentScreen, onNavigate, message, onMessageComplete }: QuestGuideProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [showTip, setShowTip] = useState(true);
    const [rotation, setRotation] = useState(0); // For Orb
    const [wheelRotation, setWheelRotation] = useState(0); // For 3D Wheel

    // AI Dialogue State
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Chat State
    const [showChat, setShowChat] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom of chat on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Ask The Architect
    const askArchitect = async (query: string) => {
        if (!query.trim() || isAiLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: query };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsAiLoading(true);

        try {
            const res = await fetch('/api/architect', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query,
                    context: {
                        screen: currentScreen,
                        level: (QuestGuide as any).userData?.level,
                        coins: (QuestGuide as any).userData?.coins
                    }
                })
            });
            const data = await res.json();
            const aiMessage: ChatMessage = { role: 'architect', content: data.response || 'SYSTEM_ERROR' };
            setChatMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'architect', content: 'CONNECTION_ERROR: Unable to reach AI core.' }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    // Auto-open if message exists
    useEffect(() => {
        if (message) {
            setIsOpen(true);
            setIsTyping(true);
            setDisplayedText('');

            let i = 0;
            const timer = setInterval(() => {
                setDisplayedText(message.substring(0, i + 1));
                i++;
                if (i >= message.length) {
                    clearInterval(timer);
                    setIsTyping(false);
                    if (onMessageComplete) setTimeout(onMessageComplete, 3000); // Auto dismiss after 3s? Or wait for user?
                }
            }, 30); // Typing speed

            return () => clearInterval(timer);
        } else {
            setDisplayedText('');
        }
    }, [message, onMessageComplete]);

    // Listen for external open commands
    useEffect(() => {
        const handleOpenMap = () => setIsOpen(true);
        window.addEventListener('votequest:open-map', handleOpenMap);
        return () => window.removeEventListener('votequest:open-map', handleOpenMap);
    }, []);

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

    // Momentum Physics State
    const [velocity, setVelocity] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const requestRef = useRef<number>();

    // Physics Loop for Momentum
    const animateLines = () => {
        if (!isDragging && Math.abs(velocity) > 0.05) {
            setWheelRotation(prev => prev + velocity);
            setVelocity(prev => prev * 0.95); // Decay factor (Friction) => 0.95 = slippery, 0.85 = grippy
            requestRef.current = requestAnimationFrame(animateLines);
        } else if (!isDragging && Math.abs(velocity) <= 0.05 && velocity !== 0) {
            setVelocity(0); // Stop completely
            triggerSnap();
        } else {
            // Idle or dragging
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animateLines);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [velocity, isDragging]);

    const handleWheel = (e: React.WheelEvent) => {
        if (snapTimeout.current) clearTimeout(snapTimeout.current);
        // Direct control
        setWheelRotation(prev => prev + (e.deltaY * 0.5));
        // Add small velocity for "throw" feel
        setVelocity(e.deltaY * 0.1);

        // Debounce snap
        if (snapTimeout.current) clearTimeout(snapTimeout.current);
        snapTimeout.current = setTimeout(triggerSnap, 800);
    };

    // Touch support for mobile with Momentum
    const lastTouchY = useRef<number>(0);
    const lastTime = useRef<number>(0);

    const handleTouchStart = (e: React.TouchEvent) => {
        setIsDragging(true);
        lastTouchY.current = e.touches[0].clientY;
        lastTime.current = Date.now();
        setVelocity(0); // Stop existing momentum
        if (snapTimeout.current) clearTimeout(snapTimeout.current);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const currentY = e.touches[0].clientY;
        const deltaY = lastTouchY.current - currentY;
        const currentTime = Date.now();

        // Update rotation directly
        setWheelRotation(prev => prev + (deltaY * 1.5)); // 1.5x sensitivity

        // Calculate velocity for throw
        const timeDelta = currentTime - lastTime.current;
        if (timeDelta > 0) {
            // Pixels per ms
            const v = deltaY / timeDelta * 15; // Scale factor
            setVelocity(v);
        }

        lastTouchY.current = currentY;
        lastTime.current = currentTime;
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        // Momentum loop will take over based on 'velocity' state
    };

    const triggerSnap = () => {
        if (isDragging) return;

        const step = 360 / NODES.length;
        setWheelRotation(prev => {
            const remainder = prev % step;
            // Find nearest slot
            return prev - remainder + (remainder > step / 2 ? step : 0);
        });
    };

    // Calculate current node based on rotation
    const normalizedRotation = (wheelRotation % 360 + 360) % 360;
    const step = 360 / NODES.length;
    const currentIndex = Math.round(normalizedRotation / step) % NODES.length;
    const activeNode = NODES[(NODES.length - currentIndex) % NODES.length]; // Reversed due to rotation direction

    return (
        <>
            {/* The Floating Orb - Still visible in Ambient Mode, but acts as toggle */}
            <div className={`fixed bottom-24 right-6 z-[2100] flex items-center gap-4 transition-all duration-500 ${isOpen ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100'}`}>
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

            {/* The Map Overlay - Active Only */}
            <div
                className={`fixed inset-0 transition-all duration-700 ease-in-out flex flex-col items-center justify-center overflow-hidden
                    ${isOpen
                        ? 'z-[10000] bg-black/95 backdrop-blur-xl opacity-100 pointer-events-auto'
                        : 'z-0 opacity-40 pointer-events-none blur-sm' // Ambient Mode: Visible (40%) but background (z-0)
                    }
                `}
                style={{ touchAction: isOpen ? 'none' : 'auto' }}
                onWheel={isOpen ? handleWheel : undefined}
                onTouchStart={isOpen ? handleTouchStart : undefined}
                onTouchMove={isOpen ? handleTouchMove : undefined}
                onTouchEnd={isOpen ? handleTouchEnd : undefined}
                onClick={() => isOpen && setIsOpen(false)}
            >
                {/* Click Handler Removed - No more ambient map opening */}

                {/* Header Info - Replaced by Dialogue if Message Active */}
                {!message ? (
                    <div className={`absolute top-12 left-0 w-full text-center pointer-events-none z-10 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
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
                ) : (
                    <div className="absolute top-12 left-0 w-full flex justify-center z-50 animate-slide-up">
                        <div className="bg-black/90 border-2 border-cyan-500 p-6 rounded-lg max-w-lg w-full shadow-[0_0_50px_rgba(0,240,255,0.4)] relative overflow-hidden">
                            {/* Scanline */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.1)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

                            <div className="flex items-center gap-4 mb-4 border-b border-cyan-500/30 pb-2">
                                <div className="w-2 h-2 bg-cyan-500 animate-ping rounded-full" />
                                <span className="text-cyan-500 font-bold tracking-widest uppercase text-sm">ARCHITECT_AI_ONLINE</span>
                            </div>

                            <p className="text-lg md:text-xl text-white font-mono leading-relaxed" style={{ textShadow: '0 0 10px rgba(0,255,255,0.5)' }}>
                                {displayedText}
                                <span className="animate-pulse">_</span>
                            </p>
                        </div>
                    </div>
                )}

                {/* ... Contextual Info Panel ... (Keep existing) */}
                {/* Actually I should hide Contextual Panel if AI is speaking to avoid clutter */}
                {!message && (
                    <div className={`absolute top-24 md:top-32 w-full max-w-md px-6 text-center z-20 transition-all duration-300 transform 
                    ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
                        <div className="bg-black/90 border border-cyan-500/30 p-6 rounded-xl backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.1)]">
                            <h3 className="text-2xl font-bold font-mono text-white mb-2 tracking-wider animate-pulse uppercase">
                                {activeNode.label}
                            </h3>
                            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-4" />
                            <p className="text-sm md:text-base text-gray-300 font-mono leading-relaxed">
                                {activeNode.desc}
                            </p>
                            <div className="mt-4 flex justify-center gap-2 items-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
                                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">
                                    TARGET LOCKED
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3D Wheel Container */}
                <div
                    className="relative w-full max-w-lg h-[500px] flex items-center justify-center mt-20"
                    style={{ perspective: '1200px', opacity: message ? 0.3 : 1, transition: 'opacity 0.5s' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ... (Content of 3D wheel same as before) ... */}

                    <div
                        className={`relative w-full h-full transition-transform duration-500 ease-out`}
                        style={{
                            transformStyle: 'preserve-3d',
                            // Removed rotateX(-5deg) for pure axis stability, added subtle tilt only
                            transform: `rotateX(0deg) rotateY(${wheelRotation + (isOpen ? 0 : rotation * 0.5)}deg)`
                        }}
                    >
                        {NODES.map((node, index) => {
                            const angle = (index * 360) / NODES.length;
                            const radius = 300;

                            // Calculate if this node is currently "active" / facing front
                            // This is a rough visual approximation based on rotation
                            // normalizedRotation (0-360) reversed matches index

                            return (
                                <div
                                    key={node.id}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                                    style={{
                                        transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                                        transformStyle: 'preserve-3d'
                                    }}
                                    onClick={() => {
                                        if (isOpen) {
                                            onNavigate(node.screenId);
                                            setIsOpen(false);
                                        }
                                    }}
                                >
                                    <div
                                        className={`w-56 h-64 bg-black border-2 flex flex-col items-center justify-center gap-6 transition-all duration-300 shadow-[0_0_50px_rgba(0,0,0,0.8)]
                                            ${isOpen ? 'hover:scale-105' : 'opacity-80 scale-90'}
                                            ${activeNode.id === node.id ? 'border-cyan-400 shadow-[0_0_30px_rgba(0,240,255,0.4)] scale-105' : 'border-cyan-900/50 opacity-60'}
                                        `}
                                        style={{
                                            borderColor: activeNode.id === node.id ? NEON_CYAN : `${NEON_CYAN}40`,
                                        }}
                                    >
                                        <div className={`p-4 rounded-full border-2 transition-colors duration-300 ${activeNode.id === node.id ? 'bg-cyan-900/20 border-cyan-400' : 'bg-black/50 border-gray-800'}`}>
                                            <node.icon className="w-10 h-10 transition-colors" style={{ color: activeNode.id === node.id ? NEON_CYAN : 'gray' }} />
                                        </div>

                                        <div className="text-center px-4">
                                            <p className={`text-lg font-bold font-mono mb-2 tracking-wider ${activeNode.id === node.id ? 'text-white' : 'text-gray-500'}`}>{node.label}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Panel Toggle */}
                {isOpen && (
                    <div className="absolute bottom-4 left-4 right-4 z-50 pointer-events-auto max-w-lg mx-auto" onClick={e => e.stopPropagation()}>
                        {/* Toggle Button */}
                        <button
                            onClick={() => setShowChat(!showChat)}
                            className="mb-2 flex items-center gap-2 px-4 py-2 bg-black/80 border border-cyan-500/50 text-cyan-400 font-mono text-sm hover:bg-cyan-900/30 transition-colors"
                        >
                            <MessageCircle className="w-4 h-4" />
                            {showChat ? 'HIDE_CHAT' : 'ASK_ARCHITECT'}
                        </button>

                        {/* Chat Panel */}
                        {showChat && (
                            <div className={`bg-black/95 border border-cyan-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.2)] flex flex-col transition-all duration-300 ${isExpanded ? 'fixed top-24 left-4 right-4 bottom-24 z-[2200] max-w-4xl mx-auto h-auto' : 'h-80'}`}>

                                {/* Chat Header with Expand Toggle */}
                                <div className="flex justify-between items-center p-2 border-b border-cyan-500/20 bg-cyan-950/20">
                                    <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest pl-2">Architect_Link_v3.0</span>
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="p-1 hover:bg-cyan-500/20 rounded text-cyan-400"
                                    >
                                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
                                    {chatMessages.length === 0 && (
                                        <p className="text-gray-500 text-sm font-mono text-center pt-10">QUERY_THE_ARCHITECT...</p>
                                    )}
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] px-4 py-3 rounded font-mono text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-500/30'
                                                : 'bg-white/5 text-gray-100 border border-white/10 shadow-lg'
                                                }`}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                    {isAiLoading && (
                                        <div className="flex justify-start">
                                            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded font-mono text-sm text-gray-400 animate-pulse">
                                                PROCESSING...
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input */}
                                <div className="border-t border-cyan-500/20 p-3 flex gap-2 bg-black/50">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={e => setChatInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && askArchitect(chatInput)}
                                        placeholder="Ask for strategy, lore, or guidance..."
                                        className="flex-1 bg-black/50 border border-white/20 rounded px-3 py-2 text-white font-mono text-sm focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                                    />
                                    <button
                                        onClick={() => askArchitect(chatInput)}
                                        disabled={isAiLoading || !chatInput.trim()}
                                        className="px-4 py-2 bg-cyan-500/20 border border-cyan-500 text-cyan-400 rounded hover:bg-cyan-500/30 disabled:opacity-50 transition-colors font-bold"
                                        style={{ textShadow: '0 0 5px rgba(0,240,255,0.5)' }}
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Close Map Button */}
                        <ArcadeButton
                            onClick={() => setIsOpen(false)}
                            variant="magenta"
                            size="md"
                            className="mt-2 w-full"
                        >
                            <X className="w-5 h-5 mr-2" />
                            CLOSE MAP
                        </ArcadeButton>
                    </div>
                )}

            </div>
        </>
    );
}
