import React from 'react';
import { ArrowRight } from 'lucide-react';

interface OnboardingScreenProps {
    currentScreen: string;
    onNext: (nextScreen: string) => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ currentScreen, onNext }) => {
    const onboardingScreens = [
        {
            id: 'onboarding1',
            title: 'Cryptographic Security',
            description: 'Military-grade encryption with immutable blockchain records. Every transaction is cryptographically verified and permanently stored.',
            next: 'onboarding2'
        },
        {
            id: 'onboarding2',
            title: 'Merit-Based System',
            description: 'Build influence through consistent participation and quality contributions. Your reputation compounds over time.',
            next: 'onboarding3'
        },
        {
            id: 'onboarding3',
            title: 'Full Transparency',
            description: 'Complete visibility into all governance decisions. Track proposals, voting patterns, and outcomes in real-time.',
            next: 'login'
        }
    ];

    const currentOnboarding = onboardingScreens.find(s => s.id === currentScreen);

    if (!currentOnboarding) return null;

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black"></div>
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[128px]"></div>
            </div>

            <div className="flex-1 flex items-center justify-center px-8 py-20 relative z-10">
                <div className="max-w-xl">
                    <div className="mb-12">
                        <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-violet-500 mb-8"></div>
                        <h2 className="text-4xl font-light text-white mb-6 tracking-tight leading-tight">{currentOnboarding.title}</h2>
                        <p className="text-zinc-400 text-lg leading-relaxed">{currentOnboarding.description}</p>
                    </div>
                </div>
            </div>

            <div className="px-8 pb-12 relative z-10">
                <div className="flex gap-1 justify-center mb-8">
                    {onboardingScreens.map(screen => (
                        <div
                            key={screen.id}
                            className={`h-px transition-all duration-500 ${screen.id === currentScreen
                                    ? 'w-16 bg-white'
                                    : 'w-8 bg-zinc-800'
                                }`}
                        />
                    ))}
                </div>
                <button
                    onClick={() => onNext(currentOnboarding.next)}
                    className="w-full bg-white hover:bg-zinc-100 text-black py-4 rounded font-medium transition-colors flex items-center justify-center gap-2 group"
                >
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                </button>
            </div>
        </div>
    );
};

export default OnboardingScreen;
