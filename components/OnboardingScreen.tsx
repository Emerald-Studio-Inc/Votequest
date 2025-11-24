import React from 'react';
import { ArrowRight, Shield, TrendingUp, Eye, Check } from 'lucide-react';

interface OnboardingScreenProps {
    currentScreen: string;
    onNext: (nextScreen: string) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ currentScreen, onNext }) => {
    const onboardingScreens = [
        {
            id: 'onboarding1',
            title: 'Secure Voting',
            description: 'Every vote is cryptographically secured and permanently recorded on the blockchain.',
            icon: Shield,
            next: 'onboarding2'
        },
        {
            id: 'onboarding2',
            title: 'Earn Reputation',
            description: 'Build your governance score through active participation and wise decision making.',
            icon: TrendingUp,
            next: 'onboarding3'
        },
        {
            id: 'onboarding3',
            title: 'Full Transparency',
            description: 'Track every proposal, vote, and outcome in real-time with complete auditability.',
            icon: Eye,
            next: 'login'
        }
    ];

    const currentIndex = onboardingScreens.findIndex(s => s.id === currentScreen);
    const currentOnboarding = onboardingScreens[currentIndex];

    if (!currentOnboarding) return null;

    const Icon = currentOnboarding.icon;
    const progress = ((currentIndex + 1) / onboardingScreens.length) * 100;

    return (
        <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
            {/* Minimal Background */}
            <div className="absolute inset-0 bg-noise opacity-50"></div>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/5 z-20">
                <div
                    className="h-full bg-white transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="flex-1 flex items-center justify-center px-8 py-20 relative z-10">
                <div className="max-w-xl w-full">
                    <div className="text-center animate-fade-in">
                        {/* Icon */}
                        <div className="mb-12 inline-block">
                            <div className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                                <Icon className="w-10 h-10 text-black" strokeWidth={2} />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-4xl font-semibold text-white mb-6 tracking-tight">
                            {currentOnboarding.title}
                        </h2>

                        {/* Description */}
                        <p className="text-lg text-gray-500 leading-relaxed max-w-md mx-auto mb-16">
                            {currentOnboarding.description}
                        </p>

                        {/* Navigation */}
                        <div className="flex flex-col items-center gap-6">
                            <button
                                onClick={() => onNext(currentOnboarding.next)}
                                className="btn btn-primary w-full max-w-xs py-4 text-base flex items-center justify-center gap-2"
                            >
                                <span>
                                    {currentIndex === onboardingScreens.length - 1 ? 'Get Started' : 'Continue'}
                                </span>
                                <ArrowRight className="w-4 h-4" strokeWidth={2} />
                            </button>

                            <button
                                onClick={() => onNext('login')}
                                className="text-sm text-gray-600 hover:text-white transition-colors"
                            >
                                Skip Tutorial
                            </button>
                        </div>

                        {/* Dots Indicator */}
                        <div className="flex items-center justify-center gap-3 mt-16">
                            {onboardingScreens.map((screen, index) => (
                                <div
                                    key={screen.id}
                                    className={`
                                        rounded-full transition-all duration-300
                                        ${index === currentIndex
                                            ? 'w-8 h-1.5 bg-white'
                                            : 'w-1.5 h-1.5 bg-white/20'
                                        }
                                    `}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingScreen;
