import React, { useState, useEffect } from 'react';
import { Wallet, Shield, Zap, Users, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';

interface LoginScreenProps {
    loading: boolean;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ loading }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const features = [
        {
            icon: Shield,
            title: 'Secure & Transparent',
            description: 'Every vote is immutably recorded on the blockchain',
            color: 'from-blue-500/20 to-transparent'
        },
        {
            icon: Zap,
            title: 'Gamified Experience',
            description: 'Earn XP, unlock achievements, and level up',
            color: 'from-purple-500/20 to-transparent'
        },
        {
            icon: Users,
            title: 'Community Driven',
            description: 'Shape decisions that matter to the collective',
            color: 'from-green-500/20 to-transparent'
        }
    ];

    return (
        <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
            {/* Noise Texture */}
            <div className="bg-noise"></div>

            {/* Dynamic Background Gradient */}
            <div 
                className="fixed inset-0 pointer-events-none transition-opacity duration-500"
                style={{
                    background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.03), transparent 80%)`
                }}
            ></div>

            {/* Floating Orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px] animate-float" style={{ animationDuration: '8s' }}></div>
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[120px] animate-float" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-white/[0.01] rounded-full blur-[80px] animate-float" style={{ animationDuration: '10s', animationDelay: '4s' }}></div>
            </div>

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_40%,#000,transparent)]"></div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col justify-center items-center px-6 py-20 relative z-10">
                <div className="max-w-4xl w-full">
                    
                    {/* Logo & Badge */}
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="inline-flex flex-col items-center gap-4 mb-8">
                            {/* Logo */}
                            <div className="relative group">
                                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                                <div className="relative w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-black/50 group-hover:scale-105 transition-transform duration-300">
                                    <div className="flex items-center justify-center">
                                        <div className="w-14 h-14 rounded-lg bg-black flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="badge badge-neutral">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                <span>All Systems Operational</span>
                            </div>
                        </div>

                        {/* Hero Text */}
                        <h1 className="text-display-xl mb-6 tracking-tight">
                            Welcome to
                            <br />
                            <span className="bg-gradient-to-r from-white via-white to-mono-70 bg-clip-text text-transparent">
                                VoteQuest
                            </span>
                        </h1>

                        <p className="text-body-large text-mono-60 max-w-2xl mx-auto leading-relaxed">
                            The next-generation decentralized governance platform.
                            <br />
                            Connect your wallet to participate in shaping the future.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            const isHovered = hoveredFeature === index;

                            return (
                                <div 
                                    key={index}
                                    className="card relative overflow-hidden group cursor-default"
                                    onMouseEnter={() => setHoveredFeature(index)}
                                    onMouseLeave={() => setHoveredFeature(null)}
                                    style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                                >
                                    {/* Gradient Overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                    
                                    {/* Content */}
                                    <div className="relative z-10 p-8 text-center">
                                        <div className={`
                                            w-14 h-14 rounded-xl mx-auto mb-6 flex items-center justify-center transition-all duration-300
                                            ${isHovered ? 'bg-white/10 scale-110' : 'bg-white/5'}
                                        `}>
                                            <Icon className={`w-7 h-7 transition-colors duration-300 ${isHovered ? 'text-white' : 'text-mono-70'}`} strokeWidth={2} />
                                        </div>
                                        <h3 className="text-subheading mb-3">{feature.title}</h3>
                                        <p className="text-body-small text-mono-60 leading-relaxed">
                                            {feature.description}
                                        </p>
                                    </div>

                                    {/* Hover Border Effect */}
                                    <div className="absolute inset-0 rounded-xl border border-white/0 group-hover:border-white/20 transition-all duration-300"></div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Connect Section */}
                    <div className="text-center animate-slide-up" style={{ animationDelay: '0.25s' }}>
                        <div className="inline-flex flex-col items-center gap-6">
                            {/* Connect Button Container */}
                            <div className="relative group">
                                {/* Glow Effect */}
                                <div className="absolute -inset-2 bg-white/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                {/* Button Wrapper with Custom Styling */}
                                <div className="relative scale-125 transform">
                                    <ConnectButton.Custom>
                                        {({
                                            account,
                                            chain,
                                            openAccountModal,
                                            openChainModal,
                                            openConnectModal,
                                            mounted,
                                        }) => {
                                            const ready = mounted;
                                            const connected = ready && account && chain;

                                            return (
                                                <div
                                                    {...(!ready && {
                                                        'aria-hidden': true,
                                                        'style': {
                                                            opacity: 0,
                                                            pointerEvents: 'none',
                                                            userSelect: 'none',
                                                        },
                                                    })}
                                                >
                                                    {(() => {
                                                        if (!connected) {
                                                            return (
                                                                <button
                                                                    onClick={openConnectModal}
                                                                    className="btn btn-primary btn-lg group/btn"
                                                                    disabled={loading}
                                                                >
                                                                    {loading ? (
                                                                        <>
                                                                            <div className="loading-spinner w-5 h-5"></div>
                                                                            <span>Connecting...</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Wallet className="w-5 h-5 transition-transform group-hover/btn:scale-110" strokeWidth={2.5} />
                                                                            <span>Connect Wallet</span>
                                                                            <ArrowRight className="w-5 h-5 transition-transform group-hover/btn:translate-x-1" strokeWidth={2.5} />
                                                                        </>
                                                                    )}
                                                                </button>
                                                            );
                                                        }

                                                        return (
                                                            <button
                                                                onClick={openAccountModal}
                                                                className="btn btn-primary btn-lg group/btn"
                                                            >
                                                                <CheckCircle className="w-5 h-5 text-green-400" strokeWidth={2.5} />
                                                                <span>{account.displayName}</span>
                                                            </button>
                                                        );
                                                    })()}
                                                </div>
                                            );
                                        }}
                                    </ConnectButton.Custom>
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="flex items-start gap-3 max-w-md p-4 rounded-lg bg-white/[0.02] border border-white/5">
                                <Shield className="w-5 h-5 text-mono-60 flex-shrink-0 mt-0.5" strokeWidth={2} />
                                <div className="text-left">
                                    <p className="text-body-small text-mono-70 mb-1 font-medium">
                                        Your wallet, your control
                                    </p>
                                    <p className="text-caption text-mono-50">
                                        We never store your private keys. All transactions are secure and transparent on the blockchain.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-16 text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                        <div className="flex items-center justify-center gap-2 text-caption text-mono-40">
                            <span>Powered by</span>
                            <span className="text-mono-70 font-semibold">Blockchain Technology</span>
                        </div>
                        <div className="flex items-center justify-center gap-6 text-caption">
                            <button className="text-mono-50 hover:text-mono-95 transition-fast">
                                Terms of Service
                            </button>
                            <div className="w-1 h-1 rounded-full bg-mono-40"></div>
                            <button className="text-mono-50 hover:text-mono-95 transition-fast">
                                Privacy Policy
                            </button>
                            <div className="w-1 h-1 rounded-full bg-mono-40"></div>
                            <button className="text-mono-50 hover:text-mono-95 transition-fast">
                                Help Center
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
