import React, { useEffect, useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';

const SplashScreen = () => {
    const [progress, setProgress] = useState(0);
    const [glowIntensity, setGlowIntensity] = useState(0);

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
            {/* Noise Texture */}
            <div className="bg-noise"></div>

            {/* Animated Background Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px] transition-opacity duration-1000"
                    style={{ 
                        background: `radial-gradient(circle, rgba(255,255,255,${0.03 + glowIntensity * 0.02}) 0%, transparent 70%)`,
                        transform: `translate(-50%, -50%) scale(${1 + glowIntensity * 0.2})`
                    }}
                ></div>
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000,transparent)]"></div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center animate-scale-in">
                {/* Logo Container */}
                <div className="relative mb-12">
                    {/* Outer Glow Ring - Pulsing */}
                    <div 
                        className="absolute inset-0 rounded-3xl transition-all duration-1000"
                        style={{
                            boxShadow: `0 0 ${60 + glowIntensity * 40}px rgba(255,255,255,${0.15 + glowIntensity * 0.1})`,
                            transform: `scale(${1.1 + glowIntensity * 0.15})`
                        }}
                    ></div>

                    {/* Logo Box */}
                    <div className="relative w-32 h-32 rounded-3xl bg-white flex items-center justify-center shadow-2xl shadow-black/80 overflow-hidden group">
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] animate-shimmer" style={{ animationDuration: '2s' }}></div>
                        
                        {/* Icon Container */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-transparent rounded-2xl"></div>
                            <div className="relative w-20 h-20 rounded-2xl bg-black flex items-center justify-center">
                                <Sparkles 
                                    className="w-12 h-12 text-white animate-pulse" 
                                    strokeWidth={2.5}
                                    style={{ animationDuration: '2s' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brand Name */}
                <h1 className="text-5xl font-bold tracking-tight mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    VoteQuest
                </h1>

                {/* Tagline */}
                <p className="text-mono-50 text-sm uppercase tracking-wider mb-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    Decentralized Governance Platform
                </p>

                {/* Loading Bar Container */}
                <div className="w-64 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    {/* Progress Bar */}
                    <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                        {/* Progress Fill */}
                        <div 
                            className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Shimmer on Progress */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>

                        {/* Glow Effect */}
                        <div 
                            className="absolute inset-y-0 left-0 bg-white/50 rounded-full blur-sm transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    {/* Loading Text */}
                    <div className="flex items-center justify-center gap-2 text-caption text-mono-50">
                        <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '0s' }}></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span>Loading Experience</span>
                    </div>
                </div>
            </div>

            {/* Bottom Branding */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 text-caption text-mono-40 animate-fade-in" style={{ animationDelay: '0.6s' }}>
                <Zap className="w-3.5 h-3.5" strokeWidth={2} />
                <span>Powered by Blockchain</span>
            </div>
        </div>
    );
};

export default SplashScreen;
