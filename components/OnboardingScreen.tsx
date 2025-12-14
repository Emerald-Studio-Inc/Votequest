import React from 'react';
import { ArrowRight, Shield, TrendingUp, Eye, Check } from 'lucide-react';
import ArcadeButton from './ArcadeButton';
import CyberCard from './CyberCard';

interface OnboardingScreenProps {
    currentScreen: string;
    onNext: (nextScreen: string) => void;
}

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ currentScreen, onNext }) => {
    const onboardingScreens = [
        {
            id: 'onboarding1',
            title: 'SECURE_VOTING',
            description: 'Every vote is cryptographically secured on the blockchain.',
            icon: Shield,
            color: NEON_CYAN,
            next: 'onboarding2'
        },
        {
            id: 'onboarding2',
            title: 'EARN_REPUTATION',
            description: 'Build your governance score through active participation.',
            icon: TrendingUp,
            color: NEON_MAGENTA,
            next: 'onboarding3'
        },
        {
            id: 'onboarding3',
            title: 'FULL_TRANSPARENCY',
            description: 'Track every proposal with real-time auditability.',
            icon: Eye,
            color: NEON_LIME,
            next: 'login'
        }
    ];

    const currentIndex = onboardingScreens.findIndex(s => s.id === currentScreen);
    const currentOnboarding = onboardingScreens[currentIndex];

    if (!currentOnboarding) return null;

    const Icon = currentOnboarding.icon;
    const progress = ((currentIndex + 1) / onboardingScreens.length) * 100;
    const activeColor = currentOnboarding.color;

    return (
        <div className="min-h-screen bg-black flex flex-col relative overflow-hidden font-mono">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Scanlines Overlay */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-30" style={{ background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }} />

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gray-900 z-20">
                <div
                    className="h-full transition-all duration-500 ease-out"
                    style={{
                        width: `${progress}%`,
                        backgroundColor: activeColor,
                        boxShadow: `0 0 10px ${activeColor}`
                    }}
                />
            </div>

            <div className="flex-1 flex items-center justify-center px-8 py-20 relative z-20">
                <div className="max-w-xl w-full">
                    <CyberCard className="text-center animate-fade-in" cornerStyle="tech">
                        {/* Icon */}
                        <div className="mb-12 inline-block">
                            <div
                                className="w-24 h-24 flex items-center justify-center relative"
                                style={{
                                    border: `1px solid ${activeColor}`,
                                    backgroundColor: `${activeColor}10`
                                }}
                            >
                                {/* Crosshairs */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-2 w-[1px]" style={{ backgroundColor: activeColor }} />
                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-2 w-[1px]" style={{ backgroundColor: activeColor }} />
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-[1px]" style={{ backgroundColor: activeColor }} />
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-[1px]" style={{ backgroundColor: activeColor }} />

                                <Icon className="w-10 h-10 animate-pulse" strokeWidth={1.5} style={{ color: activeColor }} />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold text-white mb-4 tracking-widest uppercase glitch-text" data-text={currentOnboarding.title}>
                            {currentOnboarding.title}
                        </h2>

                        {/* Description */}
                        <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto mb-16 font-mono">
                            {'>'} {currentOnboarding.description}
                        </p>

                        {/* Navigation */}
                        <div className="flex flex-col items-center gap-6">
                            <ArcadeButton
                                onClick={() => onNext(currentOnboarding.next)}
                                variant={currentIndex === 0 ? 'cyan' : currentIndex === 1 ? 'magenta' : 'lime'}
                                className="w-full max-w-xs"
                            >
                                <span>
                                    {currentIndex === onboardingScreens.length - 1 ? 'INITIALIZE_SYSTEM' : 'PROCEED_NEXT'}
                                </span>
                            </ArcadeButton>

                            <ArcadeButton
                                onClick={() => onNext('login')}
                                variant="magenta"
                                size="sm"
                                className="w-full max-w-[120px] text-[10px]"
                            >
                                [ SKIP_TUTORIAL ]
                            </ArcadeButton>
                        </div>

                        {/* Dots Indicator */}
                        <div className="flex items-center justify-center gap-3 mt-16">
                            {onboardingScreens.map((screen, index) => (
                                <div
                                    key={screen.id}
                                    className={`
                                        transition-all duration-300
                                        ${index === currentIndex
                                            ? 'w-4 h-4 border'
                                            : 'w-1.5 h-1.5 bg-gray-700'
                                        }
                                    `}
                                    style={{
                                        borderColor: index === currentIndex ? activeColor : 'transparent',
                                        backgroundColor: index === currentIndex ? `${activeColor}20` : undefined,
                                        boxShadow: index === currentIndex ? `0 0 10px ${activeColor}50` : 'none'
                                    }}
                                />
                            ))}
                        </div>
                    </CyberCard>
                </div>
            </div>
        </div>
    );
};

export default OnboardingScreen;
