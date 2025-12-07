'use client';

import { Home, FileText, BarChart3, Settings as SettingsIcon } from 'lucide-react';

interface BottomNavigationProps {
    activeTab: 'overview' | 'proposals' | 'analytics' | 'settings';
    onTabChange: (tab: 'overview' | 'proposals' | 'analytics' | 'settings') => void;
}

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
    const tabs = [
        { id: 'overview' as const, label: 'Overview', icon: Home },
        { id: 'proposals' as const, label: 'Proposals', icon: FileText },
        { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
        { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
    ];

    return (
        <>
            {/* Gold flowing border at top of nav */}
            <div className="fixed bottom-20 left-0 right-0 h-0.5 gold-border-animated z-50" />

            <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-xl border-t border-white/10 z-40">
                <div className="max-w-md mx-auto px-6 py-4">
                    <nav className="flex justify-around items-center">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => onTabChange(tab.id)}
                                    className={`
                    flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300
                    ${isActive
                                            ? 'text-white'
                                            : 'text-mono-50 hover:text-mono-80'
                                        }
                  `}
                                >
                                    <div className={`
                    relative p-2 rounded-xl transition-all duration-300
                    ${isActive
                                            ? 'bg-white/10 gold-border'
                                            : 'hover:bg-white/5'
                                        }
                  `}>
                                        <Icon
                                            className={`w-5 h-5 ${isActive ? 'gold-text' : ''}`}
                                            strokeWidth={isActive ? 2.5 : 2}
                                        />

                                        {/* Gold glow indicator for active tab */}
                                        {isActive && (
                                            <div className="absolute inset-0 rounded-xl gold-glow animate-pulse-subtle" />
                                        )}
                                    </div>

                                    <span className={`
                    text-xs font-medium transition-all duration-300
                    ${isActive ? 'gold-text' : ''}
                  `}>
                                        {tab.label}
                                    </span>

                                    {/* Gold bottom indicator */}
                                    {isActive && (
                                        <div className="absolute bottom-0 w-12 h-1 bg-gold-gradient rounded-t-full animate-pulse-subtle" />
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );
}
