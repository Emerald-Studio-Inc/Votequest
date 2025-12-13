import React, { useEffect, useState } from 'react';
import { Sparkles, Zap, Vote } from 'lucide-react';

const SplashScreen = () => {
    const [progress, setProgress] = useState(0);
    const [glowIntensity, setGlowIntensity] = useState(0);

    const NEON_CYAN = '#00F0FF';

    useEffect(() => {
        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    return 100;
                }
                return prev + 2;
            });
        }, 20);

        // Glow pulse animation
        const glowInterval = setInterval(() => {
            setGlowIntensity(prev => (prev + 0.1) % 1);
        }, 50);

        return () => {
            clearInterval(progressInterval);
            clearInterval(glowInterval);
        };
    }, []);

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none z-20" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />

            {/* Animated Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] transition-opacity duration-1000"
                    style={{
                        background: `radial-gradient(circle, rgba(0,240,255,${0.05 + glowIntensity * 0.02}) 0%, transparent 70%)`,
                        transform: `translate(-50%, -50%) scale(${1 + glowIntensity * 0.2})`
                    }}
                ></div>
            </div>

            {/* Main Content */}
            <div className="relative z-30 flex flex-col items-center animate-scale-in">
                {/* Logo Container */}
                <div className="relative mb-12">
                    <div
                        className="w-32 h-32 flex items-center justify-center relative"
                        style={{
                            border: `2px solid ${NEON_CYAN}`,
                            backgroundColor: `${NEON_CYAN}10`,
                            boxShadow: `0 0 ${30 + glowIntensity * 20}px ${NEON_CYAN}40`
                        }}
                    >
                        {/* Cut corners */}
                        <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: NEON_CYAN }} />
                        <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: NEON_CYAN }} />
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: NEON_CYAN }} />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: NEON_CYAN }} />

                        <Vote
                            className="w-16 h-16 animate-pulse"
                            strokeWidth={1.5}
                            style={{ color: NEON_CYAN, animationDuration: '2s' }}
                        />

                        {/* Glitch Bars */}
                        <div className="absolute inset-0 overflow-hidden opacity-30">
                            <div className="w-full h-1 bg-white absolute top-1/4 animate-pulse" style={{ animationDuration: '0.2s' }} />
                            <div className="w-full h-1 bg-white absolute bottom-1/3 animate-pulse" style={{ animationDuration: '0.3s' }} />
                        </div>
                    </div>
                </div>

                {/* Brand Name */}
                <h1 className="text-5xl font-bold tracking-widest mb-4 animate-fade-in glitch-text uppercase" data-text="VoteQuest" style={{ animationDelay: '0.2s', color: '#FFFFFF' }}>
                    VoteQuest
                </h1>

                {/* Tagline */}
                <p className="text-gray-400 text-sm uppercase tracking-[0.2em] mb-12 animate-fade-in font-mono" style={{ animationDelay: '0.3s' }}>
                    Decentralized Governance Protocol
                </p>

                {/* Loading Bar Container */}
                <div className="w-64 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    {/* Progress Bar */}
                    <div className="relative h-2 bg-gray-900 border border-gray-800 rounded-none mb-4 overflow-hidden">
                        {/* Progress Fill */}
                        <div
                            className="absolute inset-y-0 left-0 transition-all duration-300 ease-out"
                            style={{
                                width: `${progress}%`,
                                backgroundColor: NEON_CYAN,
                                boxShadow: `0 0 10px ${NEON_CYAN}`
                            }}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white opacity-50" />
                        </div>
                    </div>

                    {/* Loading Text */}
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-gray-500">
                        <span>{'>'} System_Boot_Sequence...</span>
                        <span style={{ color: NEON_CYAN }}>{progress}%</span>
                    </div>
                </div>
            </div>

            {/* Bottom Branding */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-mono uppercase text-gray-600 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <Zap className="w-3 h-3" strokeWidth={2} style={{ color: NEON_CYAN }} />
                <span>On-Chain Verification Active</span>
            </div>
        </div>
    );
};

export default SplashScreen;
