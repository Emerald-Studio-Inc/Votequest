'use client';

import React from 'react';
import { LayoutDashboard, BarChart3, Settings, Users, LogOut, Building2, Vote, ArrowLeft } from 'lucide-react';

interface OrganizationAdminLayoutProps {
    organizationName: string;
    organizationType: string;
    subscriptionTier: string;
    activeTab: 'overview' | 'analytics' | 'rooms' | 'settings';
    onTabChange: (tab: 'overview' | 'analytics' | 'rooms' | 'settings') => void;
    onBack: () => void;
    children: React.ReactNode;
}

export default function OrganizationAdminLayout({
    organizationName,
    organizationType,
    subscriptionTier,
    activeTab,
    onTabChange,
    onBack,
    children
}: OrganizationAdminLayoutProps) {

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'rooms', label: 'Voting Rooms', icon: Vote },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-black flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl flex flex-col fixed h-full z-20">
                <div className="p-6 border-b border-white/10">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-mono-60 hover:text-white transition-colors mb-4 text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to List
                    </button>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="overflow-hidden">
                            <h2 className="font-bold truncate">{organizationName}</h2>
                            <p className="text-xs text-mono-60 capitalize truncate">{organizationType}</p>
                        </div>
                    </div>

                    <div className="mt-4 px-2 py-1 rounded bg-white/5 border border-white/10 inline-block">
                        <p className="text-xs text-mono-60 uppercase tracking-wider">
                            Plan: <span className={`font-bold ${subscriptionTier === 'enterprise' ? 'text-yellow-500' :
                                    subscriptionTier === 'pro' ? 'text-purple-400' :
                                        'text-white'
                                }`}>{subscriptionTier}</span>
                        </p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onTabChange(item.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-white/10 text-white border border-white/10'
                                        : 'text-mono-60 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-mono-50'}`} />
                                {item.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-xs text-mono-50 mb-1">Organization ID</p>
                        <p className="text-xs font-mono text-mono-80 truncate">Last Synced: Just now</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 min-h-screen">
                <header className="h-16 border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-10 flex items-center justify-between px-8">
                    <h1 className="text-lg font-bold">
                        {menuItems.find(m => m.id === activeTab)?.label}
                    </h1>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-medium text-green-400">System Operational</span>
                        </div>
                    </div>
                </header>

                <div className="p-8 animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
