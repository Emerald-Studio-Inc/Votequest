'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Zap, Target, Activity, MessageCircle, X, Info, ChevronRight, AlertCircle, Cpu, Loader2, Radio, Gift, ExternalLink } from 'lucide-react';
import CyberButton from './CyberButton';
import CyberCard from './CyberCard';
import EntranceExam from './EntranceExam';
import DebateConsole from './DebateConsole';
import MedalGiftingModal from './MedalGiftingModal';
import { getArchitectResponse } from '@/lib/architect-lore';
import { supabase } from '@/lib/supabase-auth';

interface Signal {
    id: string;
    author: string;
    author_id?: string;
    level: number;
    content: string;
    side: 'pro' | 'con';
    amplification: number;
    aiTag?: { label: string; value: string; color: string };
    created_at: string;
}

interface ArenaViewProps {
    debate: any;
    onClose: () => void;
    onNavigate: (screen: string, data?: any) => void;
}

export default function ArenaView({ debate, onClose, onNavigate }: ArenaViewProps) {
    const [signals, setSignals] = useState<Signal[]>([]);
    const [isExamPassed, setIsExamPassed] = useState(false);
    const [showExam, setShowExam] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [debateDetails, setDebateDetails] = useState<any>(debate);
    const [architectBriefing, setArchitectBriefing] = useState<string[]>([]);
    const [user, setUser] = useState<any>(null);
    const [showConsole, setShowConsole] = useState(false);
    const [showMedalModal, setShowMedalModal] = useState(false);
    const [giftRecipient, setGiftRecipient] = useState<{ id: string; name: string } | null>(null);
    const [userBalance, setUserBalance] = useState(0);

    const NEON_CYAN = '#00ffff';
    const NEON_MAGENTA = '#ff00ff';

    // Fetch live data on mount
    useEffect(() => {
        const loadArenaData = async () => {
            setIsLoading(true);
            try {
                // Get Current User
                const { data: { user: currentUser } } = await supabase.auth.getUser();
                setUser(currentUser);

                if (currentUser) {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('coins')
                        .eq('id', currentUser.id)
                        .single();
                    if (userData) setUserBalance(userData.coins || 0);
                }

                // Fetch Debate Details & Arguments
                const res = await fetch(`/api/debates/${debate.id}`);
                const data = await res.json();

                if (data.debate) setDebateDetails(data.debate);

                const proSignals = (data.proArguments || []).map((c: any) => ({
                    id: c.id,
                    author: c.user?.username || 'Anonymous',
                    author_id: c.user_id,
                    level: c.user?.global_rank || 1,
                    content: c.content,
                    side: 'pro',
                    amplification: c.upvotes * 10 || 10,
                    aiTag: determineAiTag(c),
                    created_at: c.created_at
                }));

                const conSignals = (data.conArguments || []).map((c: any) => ({
                    id: c.id,
                    author: c.user?.username || 'Anonymous',
                    author_id: c.user_id,
                    level: c.user?.global_rank || 1,
                    content: c.content,
                    side: 'con',
                    amplification: c.upvotes * 10 || 10,
                    aiTag: determineAiTag(c),
                    created_at: c.created_at
                }));

                setSignals([...proSignals, ...conSignals]);

                // Get Architect Briefing
                const briefing = await getBriefingText(data.debate, currentUser);
                setArchitectBriefing(briefing);

            } catch (error) {
                console.error('Failed to load arena data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadArenaData();
    }, [debate.id]);

    const determineAiTag = (comment: any) => {
        if (comment.upvotes > 50) return { label: 'STRATEGIC_VALUE', value: 'CRITICAL', color: '#00ffff' };
        if (comment.content.length > 200) return { label: 'LOGICAL_CONSISTENCY', value: 'HIGH', color: '#00ff00' };
        if (comment.downvotes > comment.upvotes) return { label: 'FALLACY_DETECTED', value: 'CONTRADICTION', color: '#ff00ff' };
        return undefined;
    };

    const getBriefingText = async (debateData: any, userObj: any) => {
        const architectResponse = await getArchitectResponse({
            type: 'debate_entry',
            userState: { level: userObj?.user_metadata?.global_rank || 1, coins: 0 },
            context: 'arena'
        });

        const momentum = debateData?.pro_count > debateData?.con_count ? 'CONSENSUS_BEYOND_THRESHOLD' : 'HIGH_FRICTION_LOAD';
        const rules = debateData?.rules || [
            { title: 'SIGNAL_PURITY', description: 'Zero tolerance for low-effort noise.' },
            { title: 'VQC_STAKE', description: 'Rules violations deduct 25 VQC.' }
        ];

        return [
            architectResponse,
            `TACTICAL_MOMENTUM: ${momentum}`,
            `SIGNAL_THROUGHPUT: ${debateData?.pro_count + debateData?.con_count}_ACTIVE`,
            `INTEGRITY_INDEX: ${isExamPassed ? 'VERIFIED' : 'PENDING'}`,
            ...rules.map((r: any) => `PROTOCOL: ${r.title}`)
        ];
    };

    const handleAddSignal = async (side: 'pro' | 'con') => {
        if (!user) return;
        const content = prompt(`Enter your ${side.toUpperCase()} signal...`);
        if (!content) return;

        try {
            const res = await fetch(`/api/debates/${debate.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    content,
                    side
                })
            });

            if (res.ok) {
                // Refresh data
                const refreshRes = await fetch(`/api/debates/${debate.id}`);
                const refreshData = await refreshRes.json();
                if (refreshData.debate) setDebateDetails(refreshData.debate);
                // Simple refresh for signals too
                const combined = [...(refreshData.proArguments || []), ...(refreshData.conArguments || [])];
                setSignals(combined.map(c => ({
                    id: c.id,
                    author: c.user?.username || 'Anonymous',
                    level: c.user?.global_rank || 1,
                    content: c.content,
                    side: c.side,
                    amplification: c.upvotes * 10 || 10,
                    aiTag: determineAiTag(c),
                    created_at: c.created_at
                })));
            }
        } catch (error) {
            console.error('Failed to transmit signal:', error);
        }
    };

    const proPercentage = debateDetails?.pro_count + debateDetails?.con_count > 0
        ? Math.round((debateDetails.pro_count / (debateDetails.pro_count + debateDetails.con_count)) * 100)
        : 50;

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-[10000] bg-[#0a0a0a] flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-500" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[10000] bg-[#0a0a0a]/98 backdrop-blur-3xl flex flex-col overflow-hidden animate-fade-in font-mono">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.03)_0%,transparent_70%)] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none opacity-20" />

            {/* Header: Tactical Briefing */}
            <div className="relative z-50 px-4 md:px-8 py-4 md:py-6 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6 max-w-[70%]">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] md:text-[10px] font-bold text-cyan-400 tracking-[0.2em] md:tracking-[0.3em] uppercase truncate">ARENA // {debateDetails?.id?.substring(0, 8)}</span>
                            <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_8px_#00ffff]" />
                        </div>
                        <h2 className="text-xl md:text-3xl font-bold tracking-tighter text-white uppercase truncate">{debateDetails?.title}</h2>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-10">
                    {/* Console Button */}
                    <CyberButton
                        onClick={() => setShowConsole(true)}
                        className="!py-2 !px-3 !text-[9px] hidden md:flex items-center gap-2"
                    >
                        <Radio className="w-4 h-4" /> CONSOLE
                    </CyberButton>

                    {/* Gift Medal Button */}
                    <CyberButton
                        onClick={() => {
                            setGiftRecipient(null);
                            setShowMedalModal(true);
                        }}
                        className="!py-2 !px-3 !text-[9px] hidden md:flex items-center gap-2 !border-magenta-500/30 hover:!bg-magenta-500/20"
                    >
                        <Gift className="w-4 h-4" /> MEDALS
                    </CyberButton>

                    {/* Share/Invite Button */}
                    <CyberButton
                        onClick={() => {
                            const shareUrl = `${window.location.origin}?debate=${debate.id}`;
                            navigator.clipboard.writeText(shareUrl);
                            alert('Arena Link Copied to Clipboard!');
                        }}
                        className="!py-2 !px-3 !text-[9px] hidden md:flex items-center gap-2 !border-cyan-500/30 hover:!bg-cyan-500/20"
                    >
                        <ExternalLink className="w-4 h-4" /> INVITE
                    </CyberButton>

                    <div className="hidden lg:flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Sector Alignment</span>
                        <div className="flex items-center gap-1 mt-1">
                            <div className="w-48 h-1.5 bg-white/5 relative overflow-hidden rounded-full">
                                <div className="absolute inset-0 bg-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.5)]" style={{ width: `${proPercentage}%` }} />
                                <div className="absolute inset-0 bg-magenta-500 opacity-20" style={{ width: '100%' }} />
                            </div>
                            <span className="text-xs text-cyan-400 font-bold ml-3">{proPercentage}%</span>
                        </div>
                    </div>
                    <CyberButton onClick={onClose} className="!w-9 !h-9 md:!w-10 md:!h-10 !p-0 flex items-center justify-center !border-white/10 hover:!border-cyan-500/50">
                        <X className="w-5 h-5" />
                    </CyberButton>
                </div>
            </div>

            {/* Main Arena Content */}
            <div className="flex-1 relative flex flex-col md:flex-row overflow-hidden">

                {/* Architect Briefing Panel Overlay - Collapsible on mobile */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-5xl px-4 hidden sm:block">
                    <div className="bg-[#0e0e0e]/90 border border-cyan-500/10 p-5 backdrop-blur-xl relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                        </div>
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-500/30" />

                        <h4 className="text-[10px] font-bold text-cyan-400 uppercase tracking-[.25em] mb-3 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> ARCHITECT_SYNTHETIC_BRIEFING
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-1.5 text-[11px] text-gray-400 font-mono">
                            {architectBriefing.map((line, i) => (
                                <div key={i} className="flex items-start gap-2 border-b border-white/[0.02] pb-1">
                                    <ChevronRight className="w-3 h-3 mt-0.5 text-cyan-500/50" />
                                    <span className="truncate">{line}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Left Side: PRO Signals */}
                <div className="flex-1 border-r border-white/5 flex flex-col pt-4 md:pt-28 h-1/2 md:h-auto overflow-hidden">
                    <div className="px-6 md:px-10 py-3 md:py-5 border-b border-cyan-500/10 bg-cyan-500/[0.02] flex justify-between items-center">
                        <h3 className="text-[10px] md:text-[11px] font-bold text-cyan-400 uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2 md:gap-3">
                            <Shield className="w-3.5 h-3.5 md:w-4 md:h-4" /> ALIGNMENT
                        </h3>
                        <span className="text-[8px] text-cyan-900/50 font-mono tracking-widest hidden sm:inline">UPLINK_LIVE</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 custom-scrollbar">
                        {signals.filter(s => s.side === 'pro').length > 0 ? (
                            signals.filter(s => s.side === 'pro').map(signal => (
                                <SignalCard
                                    key={signal.id}
                                    signal={signal}
                                    themeColor={NEON_CYAN}
                                    onGift={(id: string, name: string) => {
                                        setGiftRecipient({ id, name });
                                        setShowMedalModal(true);
                                    }}
                                />
                            ))
                        ) : (
                            <div className="text-[10px] text-gray-700 text-center py-10 uppercase tracking-widest">No signals broadcasted</div>
                        )}
                    </div>
                </div>

                {/* Right Side: CON Signals */}
                <div className="flex-1 flex flex-col pt-0 md:pt-28 h-1/2 md:h-auto overflow-hidden border-t border-white/5 md:border-t-0">
                    <div className="px-6 md:px-10 py-3 md:py-5 border-b border-magenta-500/10 bg-magenta-500/[0.02] flex justify-between items-center">
                        <h3 className="text-[10px] md:text-[11px] font-bold text-magenta-400 uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center gap-2 md:gap-3">
                            <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4" /> FRICTION
                        </h3>
                        <span className="text-[8px] text-magenta-900/50 font-mono tracking-widest hidden sm:inline">DECODED_WAVES</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 custom-scrollbar">
                        {signals.filter(s => s.side === 'con').length > 0 ? (
                            signals.filter(s => s.side === 'con').map(signal => (
                                <SignalCard
                                    key={signal.id}
                                    signal={signal}
                                    themeColor={NEON_MAGENTA}
                                    onGift={(id: string, name: string) => {
                                        setGiftRecipient({ id, name });
                                        setShowMedalModal(true);
                                    }}
                                />
                            ))
                        ) : (
                            <div className="text-[10px] text-gray-700 text-center py-10 uppercase tracking-widest">No interference detected</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer: User Action Core */}
            <div className="relative z-50 border-t border-white/5 bg-black/60 backdrop-blur-xl p-4 md:p-8 flex flex-col sm:row items-center justify-between gap-4">
                <div className="flex gap-10 items-center w-full sm:w-auto">
                    <div className="flex flex-col">
                        <span className="text-[8px] md:text-[9px] text-gray-600 uppercase tracking-widest mb-1">Authenticated Operative</span>
                        <div className="text-xs md:text-sm font-bold text-white tracking-[.2em] uppercase flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_#00ffff]" />
                            {user?.username || 'GUEST_OPERATIVE'}
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 md:gap-4 w-full sm:w-auto">
                    {isExamPassed ? (
                        <>
                            <CyberButton className="flex-1 sm:flex-none !bg-cyan-500/10 !border-cyan-500/30 text-cyan-400 !px-2 md:!px-4 h-10 md:h-11 !text-[9px] md:!text-xs" onClick={() => handleAddSignal('pro')}>
                                <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" /> BROADCAST
                            </CyberButton>
                            <CyberButton className="flex-1 sm:flex-none !bg-magenta-500/10 !border-magenta-500/30 text-magenta-400 !px-2 md:!px-4 h-10 md:h-11 !text-[9px] md:!text-xs" onClick={() => handleAddSignal('con')}>
                                <AlertCircle className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1 md:mr-2" /> TRIGGER
                            </CyberButton>
                        </>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-8 bg-white/5 px-4 md:px-6 py-2 border border-white/5 w-full">
                            <p className="text-[8px] md:text-[10px] text-gray-500 font-mono uppercase tracking-[0.1em] md:tracking-[0.2em] text-center">Verification Protocol Required</p>
                            <CyberButton onClick={() => setShowExam(true)} className="h-9 w-full sm:w-auto !text-[9px]">
                                <Target className="w-4 h-4 mr-2" /> INITIALIZE
                            </CyberButton>
                        </div>
                    )}
                </div>
            </div>

            {showExam && (
                <EntranceExam
                    onPass={() => {
                        setIsExamPassed(true);
                        setShowExam(false);
                    }}
                    onFail={() => {
                        setShowExam(false);
                    }}
                    onCancel={() => setShowExam(false)}
                />
            )}

            {showConsole && (
                <DebateConsole
                    debateId={debate.id}
                    userId={user?.id}
                    isParticipant={isExamPassed}
                    onClose={() => setShowConsole(false)}
                />
            )}

            {showMedalModal && (
                <MedalGiftingModal
                    isOpen={showMedalModal}
                    onClose={() => setShowMedalModal(false)}
                    userId={user?.id}
                    userBalance={userBalance}
                    recipientId={giftRecipient?.id}
                    recipientName={giftRecipient?.name}
                    debateId={debate.id}
                    onSuccess={(newBalance) => setUserBalance(newBalance)}
                />
            )}
        </div>
    );
}

function SignalCard({ signal, themeColor, onGift }: { signal: Signal; themeColor: string; onGift?: (userId: string, username: string) => void }) {
    return (
        <div
            className="p-6 bg-white/[0.01] border border-white/5 relative group transition-all duration-300 hover:bg-white/[0.03] hover:border-white/10"
            style={{ borderLeft: `2px solid ${themeColor}60` }}
        >
            <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black border border-white/10 flex items-center justify-center text-[11px] font-bold text-gray-500">
                        OP_{signal.author.substring(0, 3).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-[12px] text-white font-bold leading-none tracking-tight">{signal.author}</div>
                        <div className="text-[8px] text-gray-600 uppercase tracking-[.3em] mt-1.5 flex items-center gap-1">
                            <Activity className="w-2.5 h-2.5" /> LVL_{signal.level}_AUTHENTICATED
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {signal.aiTag && (
                        <div className="px-2.5 py-0.5 border text-[8px] font-bold tracking-[.25em] transition-all"
                            style={{ color: signal.aiTag.color, borderColor: `${signal.aiTag.color}30`, backgroundColor: `${signal.aiTag.color}05` }}>
                            {signal.aiTag.label}: {signal.aiTag.value}
                        </div>
                    )}
                    {signal.author_id && (
                        <button
                            onClick={() => onGift?.(signal.author_id!, signal.author)}
                            className="p-1.5 bg-magenta-500/10 border border-magenta-500/30 text-magenta-400 hover:bg-magenta-500 hover:text-white transition-all rounded-sm group/gift"
                            title="Gift Medal"
                        >
                            <Gift className="w-3.5 h-3.5 group-hover/gift:scale-110" />
                        </button>
                    )}
                </div>
            </div>

            <p className="text-[13px] text-gray-400 font-mono leading-relaxed mb-8 border-l border-white/5 pl-4">
                {signal.content}
            </p>

            <div className="flex items-center justify-between pt-5 border-t border-white/[0.03]">
                <div className="flex items-center gap-6">
                    <button className="text-cyan-400/70 hover:text-cyan-400 text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all">
                        <Zap className="w-3 h-3" /> AMPLIFY
                    </button>
                    <button className="text-gray-600 hover:text-gray-400 text-[9px] font-bold uppercase tracking-widest transition-all">
                        DIVERGE
                    </button>
                </div>
                <div className="text-[9px] font-mono text-gray-700 tracking-tighter">
                    THROUGHPUT: {signal.amplification}_Hz // T_STAMP: {new Date(signal.created_at).toLocaleTimeString()}
                </div>
            </div>

            <div className="absolute bottom-0 left-0 h-[1px] bg-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" style={{ backgroundColor: themeColor }} />
        </div>
    );
}
