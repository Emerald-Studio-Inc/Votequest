'use client';

import React from 'react';
import { Home, FileText, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { sfx } from '@/lib/sfx';
import { triggerHaptic } from '@/lib/haptics';

interface BottomNavigationProps {
    activeTab: 'overview' | 'proposals' | 'analytics' | 'settings';
    onTabChange: (tab: 'overview' | 'proposals' | 'analytics' | 'settings') => void;
}

const NEON_CYAN = '#0055FF';

export default function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
    const tabs = [
        { id: 'overview' as const, label: 'HUB', icon: Home },
        { id: 'proposals' as const, label: 'QUESTS', icon: FileText },
        { id: 'analytics' as const, label: 'DATA', icon: BarChart3 },
        { id: 'settings' as const, label: 'SYS', icon: SettingsIcon },
    ];

    const handleTabClick = (tabId: 'overview' | 'proposals' | 'analytics' | 'settings') => {
        if (tabId !== activeTab) {
            sfx.playClick();
            triggerHaptic('light');
            onTabChange(tabId);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[1000] flex justify-center pb-6 pointer-events-none px-4">
            <div className="bg-[#09090b]/80 backdrop-blur-xl border border-white/10 p-1 rounded-2xl flex gap-1 pointer-events-auto shadow-[0_8px_32px_rgba(0,0,0,0.8)] max-w-sm w-full">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-xl transition-all duration-300 relative group overflow-hidden`}
                        >
                            {/* Active Indicator Background */}
                            {isActive && (
                                <div className="absolute inset-0 bg-white/5 animate-pulse-subtle" />
                            )}

                            {/* Icon Container */}
                            <div className={`relative z-10 p-1 flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                                <Icon
                                    className={`w-5 h-5 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />

                                {isActive && (
                                    <div className="absolute -inset-2 rounded-full blur-[8px] border-2 border-[#0055FF]/40 pointer-events-none" />
                                )}
                            </div>

                            {/* Label */}
                            <span className={`text-[9px] font-mono mt-1 font-bold tracking-tighter transition-colors duration-300 relative z-10 ${isActive ? 'text-[#0055FF]' : 'text-gray-600 group-hover:text-gray-400'}`}>
                                {tab.label}
                            </span>

                            {/* Underline for active */}
                            {isActive && (
                                <div
                                    className="absolute bottom-0 left-1/4 right-1/4 h-[2px] rounded-full shadow-[0_0_8px_#0055FF]"
                                    style={{ backgroundColor: NEON_CYAN }}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
