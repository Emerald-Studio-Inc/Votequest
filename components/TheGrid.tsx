'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
    Shield, Zap, Target, MessageCircle, Info, Activity, Globe, Cpu,
    ShieldAlert, Loader2, LayoutDashboard, Terminal, Users,
    FileText, Settings, Bell, ChevronRight, BarChart3, Radar
} from 'lucide-react';
import CyberButton from './CyberButton';
import CyberCard from './CyberCard';
import ArenaView from './ArenaView';
import OperativeDossier from './OperativeDossier';

// Dynamic import for DiscourseMesh to avoid SSR issues with React-Three-Fiber
const DiscourseMesh = dynamic<any>(() => import('./DiscourseMesh'), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
            <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
        </div>
    )
});

export default function TheGrid({ onNavigate, userData }: { onNavigate: (screen: string, data?: any) => void, userData?: any }) {
    const [activeNode, setActiveNode] = useState<any>(null);
    const [showArena, setShowArena] = useState(false);
    const [showDossier, setShowDossier] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [feed, setFeed] = useState<any[]>([]);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [consensusPulse, setConsensusPulse] = useState(false);

    useEffect(() => {
        const fetchFeed = async () => {
            setIsLoading(true);

            // Create a controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

            try {
                const res = await fetch('/api/community?filter=hot', { signal: controller.signal });
                const data = await res.json();

                if (data.feed && data.feed.length > 0) {
                    setFeed(data.feed);
                    setOrganizations(data.organizations || []);
                } else {
                    // DEMO DATA: Provide a vibrant initial experience if DB is empty
                    setOrganizations([
                        { id: 'tech-hub', name: 'TECH_SYNAPSE', sector: 'TECH' },
                        { id: 'econ-hub', name: 'TREASURY_RESERVE', sector: 'ECON' },
                        { id: 'gov-hub', name: 'GLOBAL_ADVISORY', sector: 'GOV' }
                    ]);
                    setFeed([
                        { id: 'd1', title: 'SYSTEM_AUTONOMY_INITIATIVE', type: 'debate', status: 'live', organization_id: 'tech-hub', participants: 420 },
                        { id: 'd2', title: 'LIQUIDITY_PROTOCOL_SHIFT', type: 'debate', status: 'stable', organization_id: 'econ-hub', participants: 1337 },
                        { id: 't1', title: 'SECTOR_ALIGNMENT_PROTOCOL', type: 'discussion', organization_id: 'gov-hub', replies: 88 }
                    ]);
                }
            } catch (error) {
                console.error('Failed to fetch community feed:', error);
                // Show empty state on error, not mock data
                setFeed([]);
            } finally {
                clearTimeout(timeoutId);
                setIsLoading(false);
            }
        };
        fetchFeed();
    }, []);

    // Calculate Faction Stats from Feed
    const factionStats = useMemo(() => {
        let totalPro = 0;
        let totalCon = 0;
        feed.forEach(d => {
            if (d.type === 'debate') {
                totalPro += d.pro_count || 0;
                totalCon += d.con_count || 0;
            }
        });
        const total = totalPro + totalCon || 1;
        return {
            proPercent: Math.round((totalPro / total) * 100),
            conPercent: Math.round((totalCon / total) * 100)
        };
    }, [feed]);

    const handleNodeSelection = (node: any) => {
        setActiveNode(node);
        setShowArena(true);
        setConsensusPulse(true);
        setTimeout(() => setConsensusPulse(false), 1000);
    };

    return (
        <div className="flex h-screen w-full bg-[#0a0a0a] text-white font-mono overflow-hidden select-none relative">
            {/* 1. Left Sidebar: Navigation Core - Hidden on mobile */}
            <div className="hidden lg:flex w-[280px] h-full bg-gradient-to-b from-[#001f1f]/20 to-[#0a0a0a] border-r border-white/5 relative z-50 flex-col">
                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-500/50" />

                {/* Logo */}
                <div className="px-8 py-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-sm bg-cyan-500 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,255,0.4)]">
                            <Shield className="w-5 h-5 text-black" />
                        </div>
                        <h1 className="text-xl font-bold tracking-[0.2em] text-white">VOTEQUEST</h1>
                    </div>
                </div>

                {/* Nav Links */}
                <div className="flex-1 px-4 space-y-2">
                    <NavItem icon={<LayoutDashboard className="w-4 h-4" />} label="HUD Overview" onClick={() => onNavigate('overview')} />
                    <NavItem icon={<Terminal className="w-4 h-4" />} label="Architect Console" onClick={() => alert('SYSTEM WARNING\n\nCONSOLE OFFLINE // PENDING PHASE 4 UPLINK')} />
                    <NavItem icon={<Globe className="w-4 h-4" />} label="THE_GRID" active />
                    <NavItem icon={<Users className="w-4 h-4" />} label="Factions & Orgs" onClick={() => onNavigate('organization')} />
                    <NavItem icon={<MessageCircle className="w-4 h-4" />} label="Personal Signals" onClick={() => setShowDossier(!showDossier)} active={showDossier} />
                    <NavItem icon={<Settings className="w-4 h-4" />} label="Settings" onClick={() => onNavigate('settings')} />
                </div>

                {/* User Panel Bottom */}
                <div className="p-6 border-t border-white/5 space-y-4">
                    <div className="bg-cyan-500/5 border border-cyan-500/10 p-4 rounded-sm relative overflow-hidden group">
                        <div className="text-[10px] text-gray-500 mb-1">VQC BALANCE</div>
                        <div className="text-xl font-bold text-cyan-400 group-hover:scale-110 transition-transform origin-left">2,450.00</div>
                        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 group-hover:opacity-20 transition-opacity">
                            <Cpu className="w-16 h-16" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase">CORE_OPERATIVE</span>
                        </div>
                        <Bell className="w-4 h-4 text-gray-500 hover:text-white cursor-pointer" />
                    </div>
                </div>
            </div>

            {/* 2. Main Body Content */}
            <div className="flex-1 flex flex-col relative">

                {/* Tactical Header */}
                <div className="h-auto min-h-[80px] lg:h-[100px] border-b border-white/5 bg-black/40 backdrop-blur-xl z-40 px-4 lg:px-10 py-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <h2 className="text-xl lg:text-2xl font-bold tracking-tighter text-white flex items-center gap-4">
                            THE_GRID <span className="hidden sm:inline text-xs text-cyan-500/50 border border-cyan-500/20 px-2 py-0.5 tracking-[0.3em]">STRATEGIC_DISCOURSE_NETWORK</span>
                        </h2>
                        <div className="flex gap-6 mt-1">
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <Activity className="w-3 h-3 text-cyan-500" /> 1,204 OPERATIVES_ACTIVE
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <Target className="w-3 h-3 text-magenta-500" /> 12_CRITICAL_DEBATES
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full lg:w-auto gap-4 lg:gap-10">
                        {/* Global Consensus Radar */}
                        <div className="flex items-center gap-3 lg:gap-6">
                            <div className="flex flex-col items-end">
                                <span className="text-[8px] lg:text-[9px] text-gray-500 uppercase tracking-[.25em]">Alignment</span>
                                <div className="text-xs lg:text-sm font-bold text-cyan-400 font-mono tracking-tighter">72.4%_STABLE</div>
                            </div>
                            <div className="relative w-12 h-12 lg:w-16 lg:h-16 group">
                                <svg className="w-full h-full -rotate-90 overflow-visible" viewBox="0 0 100 100">
                                    {/* Grid Lines */}
                                    <circle cx="50" cy="50" r="45" className="stroke-white/5 fill-none" strokeWidth="0.5" />
                                    <circle cx="50" cy="50" r="30" className="stroke-white/5 fill-none" strokeWidth="0.5" />
                                    <circle cx="50" cy="50" r="15" className="stroke-white/5 fill-none" strokeWidth="0.5" />

                                    {/* Radar Path */}
                                    <polygon
                                        points="50,15 85,45 75,75 50,85 25,75 15,45"
                                        className="fill-cyan-500/20 stroke-cyan-500 stroke-[1.5] animate-pulse"
                                    />

                                    {/* Rotating Scan Line */}
                                    <line x1="50" y1="50" x2="50" y2="5" className="stroke-cyan-400 opacity-50 stroke-[1]" transform-origin="50 50">
                                        <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="4s" repeatCount="indefinite" />
                                    </line>
                                </svg>
                            </div>
                        </div>

                        {/* Quick Filters - Hidden on small mobile, scrollable on tablet */}
                        <div className="hidden sm:flex truncate lg:overflow-visible gap-1 p-1 rounded-sm bg-white/[0.03] border border-white/5 items-center">
                            <FilterBtn label="ALL" active />
                            <FilterBtn label="CONFLICT" />
                            <FilterBtn label="CONSENSUS" />
                        </div>
                    </div>
                </div>

                {/* 3. Central Visualization Grid */}
                <div className="flex-1 relative">
                    <div className="w-full h-full relative border border-white/5">
                        {isLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
                                <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
                            </div>
                        ) : (
                            <DiscourseMesh
                                feed={feed}
                                organizations={organizations}
                                onSelectNode={handleNodeSelection}
                            />
                        )}

                        {/* Legend / Overlay */}
                        <div className="absolute top-8 left-8 flex flex-col gap-4 z-20">
                            <div className="bg-black/60 p-4 border border-white/5 backdrop-blur-md">
                                <div className="text-[10px] text-gray-500 uppercase mb-3">Neural Cluster Legend</div>
                                <div className="flex flex-col gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(0,255,255,0.5)]"></div>
                                        CONSENSUS_STABLE
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-magenta-500 shadow-[0_0_8px_rgba(255,0,255,0.5)]"></div>
                                        CONFLICT_RADICAL
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Bottom Metric Cards Row */}
                <div className="h-[200px] lg:h-[220px] bg-black/60 border-t border-white/5 backdrop-blur-xl z-40 flex px-4 lg:px-8 py-4 lg:py-6 gap-4 lg:gap-6 overflow-x-auto scrollbar-hide pb-24 lg:pb-6">
                    <MetricCard
                        title="ACTIVE BOUNTIES"
                        desc="Resolution incentives"
                        icon={<Zap className="w-4 h-4 text-yellow-500" />}
                        content={
                            <div className="space-y-3 mt-4">
                                {feed.slice(0, 2).map((item, i) => (
                                    <div key={i} className="flex justify-between items-center text-[11px] p-2 bg-white/5 border border-white/5">
                                        <span className="truncate w-32">{item.title}</span>
                                        <span className="text-cyan-400 font-bold">500 VQC</span>
                                    </div>
                                ))}
                            </div>
                        }
                        btnText="DEPLOY_SIGNALS"
                    />
                    <MetricCard
                        title="FACTIONAL INFLUENCE"
                        desc="Sector control momentum"
                        icon={<Users className="w-4 h-4 text-cyan-500" />}
                        content={
                            <div className="space-y-3 mt-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] text-gray-500 uppercase"><span>The Core (Pro)</span><span>{factionStats.proPercent}%</span></div>
                                    <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden"><div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${factionStats.proPercent}%` }} /></div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[9px] text-gray-500 uppercase"><span>Shadow Sector (Con)</span><span>{factionStats.conPercent}%</span></div>
                                    <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden"><div className="h-full bg-magenta-500 transition-all duration-1000" style={{ width: `${factionStats.conPercent}%` }} /></div>
                                </div>
                            </div>
                        }
                        btnText="VIEW_FULL_MAP"
                    />
                    <MetricCard
                        title="RECENT CONSENSUS"
                        desc="Stabilized policies"
                        icon={<Shield className="w-4 h-4 text-green-500" />}
                        content={
                            <div className="space-y-2 mt-4">
                                {feed.filter(d => d.status === 'stable').length > 0 ? (
                                    feed.filter(d => d.status === 'stable').slice(0, 2).map((d, i) => (
                                        <div key={i} className="text-[10px] font-mono text-gray-500 pl-3 border-l-2 border-cyan-500/40 truncate">
                                            <span className="text-cyan-400">STABILIZED</span> {d.title}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-[9px] text-gray-600 italic py-2">No recently stabilized mandates.</div>
                                )}
                            </div>
                        }
                        btnText="REVIEW_OUTCOMES"
                    />
                    <MetricCard
                        title="HIGH-STAKES ARENAS"
                        desc="Conflict resolution required"
                        icon={<ShieldAlert className="w-4 h-4 text-magenta-500" />}
                        content={
                            <div className="space-y-2 mt-4">
                                {feed.filter(d => d.type === 'debate' && d.status !== 'stable').sort((a, b) => (b.participants || 0) - (a.participants || 0)).slice(0, 2).map((d, i) => (
                                    <div key={i} className="text-[10px] font-mono text-gray-500 pl-3 border-l-2 border-magenta-500/40 truncate">
                                        <span className="text-magenta-400">CRITICAL</span> {d.title}
                                    </div>
                                ))}
                            </div>
                        }
                        btnText="ENTER_ARENA"
                    />
                </div>
            </div>

            {/* Arena View Overlay */}
            {showArena && activeNode && (
                <ArenaView
                    debate={activeNode}
                    onClose={() => setShowArena(false)}
                    onNavigate={onNavigate}
                />
            )}

            {/* Global Effects Context */}
            {consensusPulse && (
                <div className="fixed inset-0 z-[100] pointer-events-none bg-cyan-500/10 animate-pulse-once border-[10px] border-cyan-500/20" />
            )}

            {/* Operative Dossier Overlay */}
            {showDossier && userData && (
                <OperativeDossier
                    userData={userData}
                    onClose={() => setShowDossier(false)}
                />
            )}

            <style jsx global>{`
                @keyframes pulse-once { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
                .animate-pulse-once { animation: pulse-once 1s ease-out; }
            `}</style>
        </div>
    );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
    return (
        <div onClick={onClick} className={`
            flex items-center gap-4 px-4 py-3 rounded-sm cursor-pointer transition-all border
            ${active
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.1)]'
                : 'border-transparent text-gray-500 hover:text-white hover:bg-white/5'}
        `}>
            {icon}
            <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
        </div>
    );
}

function FilterBtn({ label, active = false }: { label: string, active?: boolean }) {
    return (
        <button className={`
            px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-all rounded-sm
            ${active ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,255,255,0.4)]' : 'text-gray-500 hover:text-white'}
        `}>
            {label}
        </button>
    );
}

function MetricCard({ title, desc, content, btnText, icon }: { title: string, desc: string, content: React.ReactNode, btnText: string, icon?: React.ReactNode }) {
    return (
        <div className="min-w-[280px] h-full bg-white/[0.02] border border-white/5 p-5 relative group overflow-hidden flex flex-col">
            <div className="flex items-center gap-3 mb-1">
                {icon}
                <h4 className="text-[12px] font-bold text-white uppercase tracking-widest">{title}</h4>
            </div>
            <p className="text-[9px] text-gray-500 uppercase tracking-tighter italic">{desc}</p>

            <div className="flex-1">
                {content}
            </div>

            <button className="w-full h-8 mt-4 border border-cyan-500/30 bg-cyan-500/5 text-[9px] font-bold text-cyan-400 uppercase tracking-widest hover:bg-cyan-500 hover:text-black transition-all">
                {btnText}
            </button>

            {/* Holographic Decoration */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 right-0 w-px h-full bg-cyan-500/20 scale-y-0 group-hover:scale-y-100 transition-transform origin-top duration-500" />
        </div>
    );
}
