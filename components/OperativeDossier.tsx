'use client';

import React from 'react';
import { Shield, Coins, Award, Target, Activity, Zap, FileText } from 'lucide-react';
import CyberCard from './CyberCard';

interface OperativeDossierProps {
    userData: {
        level: number;
        coins: number;
        xp: number;
        nextLevelXP: number;
        globalRank: number;
        email: string | null;
        userId: string | null;
    };
    onClose?: () => void;
}

export default function OperativeDossier({ userData, onClose }: OperativeDossierProps) {
    const rankName = getRankName(userData.level);
    const progress = Math.min(100, Math.round((userData.xp / userData.nextLevelXP) * 100));

    return (
        <div className="absolute top-20 right-6 w-80 z-40 animate-slide-left">
            <CyberCard className="border-cyan-500/30 bg-black/90 backdrop-blur-xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 border-b border-cyan-500/20 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-cyan-900/20 border border-cyan-500 rounded-full flex items-center justify-center relative">
                            <Shield className="w-6 h-6 text-cyan-400" />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-black border border-cyan-500 rounded-full flex items-center justify-center text-[10px] text-cyan-400 font-bold">
                                {userData.level}
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-cyan-500 uppercase tracking-widest">OPERATIVE_ID</div>
                            <div className="text-white font-bold font-mono truncate w-32">{userData.email?.split('@')[0] || 'UNKNOWN'}</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-gray-500 uppercase">CLEARANCE</div>
                        <div className="text-cyan-400 font-bold text-xs">{rankName}</div>
                    </div>
                </div>

                {/* VQC Balance */}
                <div className="bg-cyan-950/20 border border-cyan-500/20 p-3 rounded mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs text-cyan-300 uppercase">VQC_BALANCE</span>
                    </div>
                    <div className="text-yellow-400 font-bold font-mono text-lg">{userData.coins.toLocaleString()}</div>
                </div>

                {/* XP Progress */}
                <div className="mb-6 space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-400 uppercase">
                        <span>Progression</span>
                        <span>{userData.xp} / {userData.nextLevelXP} XP</span>
                    </div>
                    <div className="h-1 bg-white/10 w-full rounded-full overflow-hidden">
                        <div
                            className="h-full bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-white/5 p-2 rounded border border-white/5">
                        <div className="text-[9px] text-gray-500 uppercase mb-1">GLOBAL_RANK</div>
                        <div className="flex items-center gap-2 text-white font-bold">
                            <GlobeIcon className="w-3 h-3 text-cyan-500" />
                            #{userData.globalRank || '---'}
                        </div>
                    </div>
                    <div className="bg-white/5 p-2 rounded border border-white/5">
                        <div className="text-[9px] text-gray-500 uppercase mb-1">OPERATIONS</div>
                        <div className="flex items-center gap-2 text-white font-bold">
                            <Activity className="w-3 h-3 text-green-500" />
                            ACTIVE
                        </div>
                    </div>
                </div>

                {/* Intel Cache (Placeholder for "Info File") */}
                <div className="border-t border-white/10 pt-4">
                    <div className="text-[10px] text-gray-500 uppercase mb-2 flex items-center gap-2">
                        <FileText className="w-3 h-3" /> INTEL_CACHE
                    </div>
                    <div className="text-xs text-gray-600 italic">
                        No active intelligence files loaded.
                        <br />
                        <span className="text-cyan-800 text-[10px]">Use the Architect Console to upload data.</span>
                    </div>
                </div>
            </CyberCard>
        </div>
    );
}

function GlobeIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

const getRankName = (level: number) => {
    if (level >= 50) return 'GRAND_ARCHITECT';
    if (level >= 20) return 'MASTER_TACTICIAN';
    if (level >= 10) return 'SECTOR_COMMANDER';
    if (level >= 5) return 'ECHO_OPERATIVE';
    return 'INITIATE';
};
