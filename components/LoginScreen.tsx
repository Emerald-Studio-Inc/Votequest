import React from 'react';
import { ArrowRight, Wallet } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Tooltip from './Tooltip';

interface LoginScreenProps {
    loading: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ loading }) => {
    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col px-8 py-16 relative overflow-hidden animate-fade-in">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"></div>
            <div className="absolute inset-0 opacity-30">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[128px] animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full relative z-10">
                <div className="mb-16 text-center animate-slide-up">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-xl border border-white/10 shadow-2xl shadow-violet-500/20">
                        <Wallet className="w-8 h-8 text-white" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-4xl font-light text-white mb-3 tracking-tight">Connect Wallet</h1>
                    <p className="text-zinc-500 font-light">Authenticate using your Web3 wallet to continue</p>
                </div>

                <div className="flex justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <ConnectButton />
                </div>

                <div className="mt-12 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <p className="text-zinc-600 text-xs font-light">
                        By connecting, you agree to our Terms of Service
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
