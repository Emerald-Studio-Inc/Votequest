import React from 'react';

const SplashScreen = () => {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"></div>
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600 rounded-full blur-[128px]"></div>
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-violet-600 rounded-full blur-[128px]"></div>
            </div>
            <div className="text-center relative z-10">
                <div className="mb-8 flex justify-center">
                    <div className="relative">
                        <div className="w-3 h-3 bg-blue-500 rounded-full absolute top-0 left-0 animate-pulse"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full absolute top-0 right-0 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full absolute bottom-0 left-0 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full absolute bottom-0 right-0 animate-pulse" style={{ animationDelay: '0.6s' }}></div>
                        <div className="w-16 h-16 border-2 border-zinc-800"></div>
                    </div>
                </div>
                <h1 className="text-5xl font-light text-white tracking-wider mb-2">VOTEQUEST</h1>
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-zinc-700 to-transparent mx-auto mb-2"></div>
                <p className="text-zinc-500 text-sm tracking-widest uppercase">Decentralized Governance</p>
            </div>
        </div>
    );
};

export default SplashScreen;
