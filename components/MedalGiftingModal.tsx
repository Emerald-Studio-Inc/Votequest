'use client';

import React, { useState, useEffect } from 'react';
import { X, Coins, Gift, Sparkles, Crown, Brain, Flame } from 'lucide-react';
import CyberButton from './CyberButton';

interface Medal {
    id: string;
    name: string;
    description: string;
    icon: string;
    price_vqc: number;
    tier: string;
}

interface MedalGiftingModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    userBalance: number;
    recipientId?: string;
    recipientName?: string;
    debateId?: string;
    onSuccess?: (newBalance: number) => void;
}

export default function MedalGiftingModal({
    isOpen,
    onClose,
    userId,
    userBalance,
    recipientId,
    recipientName,
    debateId,
    onSuccess
}: MedalGiftingModalProps) {
    const [medals, setMedals] = useState<Medal[]>([]);
    const [selectedMedal, setSelectedMedal] = useState<Medal | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [mode, setMode] = useState<'store' | 'gift'>('store');

    useEffect(() => {
        if (isOpen) {
            fetchMedals();
            setMode(recipientId ? 'gift' : 'store');
        }
    }, [isOpen, recipientId]);

    const fetchMedals = async () => {
        try {
            const res = await fetch('/api/medals?action=store');
            const data = await res.json();
            if (data.medals) setMedals(data.medals);
        } catch (e) {
            console.error('Failed to fetch medals:', e);
        }
    };

    const handlePurchase = async () => {
        if (!selectedMedal) return;
        setLoading(true);

        try {
            const res = await fetch('/api/medals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    medalId: selectedMedal.id,
                    action: 'purchase'
                })
            });

            const data = await res.json();
            if (data.success) {
                alert(`Purchased ${selectedMedal.name}! New balance: ${data.newBalance} VQC`);
                onSuccess?.(data.newBalance);
                onClose();
            } else {
                alert(data.error || 'Purchase failed');
            }
        } catch (e) {
            console.error('Purchase failed:', e);
        }
        setLoading(false);
    };

    const handleGift = async () => {
        if (!selectedMedal || !recipientId || !debateId) return;
        setLoading(true);

        try {
            const res = await fetch('/api/medals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    medalId: selectedMedal.id,
                    action: 'gift',
                    recipientId,
                    debateId,
                    message
                })
            });

            const data = await res.json();
            if (data.success) {
                alert(`Gift sent! ${recipientName} received +${data.recipientReward} VQC`);
                onClose();
            } else {
                alert(data.error || 'Gift failed');
            }
        } catch (e) {
            console.error('Gift failed:', e);
        }
        setLoading(false);
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'platinum': return 'bg-purple-500/20 border-purple-500/50 text-purple-400';
            case 'gold': return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
            case 'silver': return 'bg-gray-300/20 border-gray-300/50 text-gray-300';
            default: return 'bg-amber-700/20 border-amber-700/50 text-amber-600';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-[300] flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-cyan-500/30 w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Gift className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-lg font-bold text-white uppercase tracking-widest">
                            {mode === 'gift' ? 'SEND_MEDAL' : 'MEDAL_STORE'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Balance */}
                <div className="px-4 py-3 bg-cyan-500/5 border-b border-cyan-500/10 flex items-center justify-between">
                    <span className="text-xs text-gray-400 uppercase">Your Balance</span>
                    <span className="text-cyan-400 font-bold flex items-center gap-1">
                        <Coins className="w-4 h-4" />
                        {userBalance.toLocaleString()} VQC
                    </span>
                </div>

                {/* Recipient (Gift Mode) */}
                {mode === 'gift' && recipientName && (
                    <div className="px-4 py-3 bg-magenta-500/5 border-b border-magenta-500/10">
                        <span className="text-xs text-gray-400 uppercase">Sending to:</span>
                        <span className="text-magenta-400 font-bold ml-2">{recipientName}</span>
                    </div>
                )}

                {/* Medal Grid */}
                <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
                    {medals.map((medal) => (
                        <button
                            key={medal.id}
                            onClick={() => setSelectedMedal(medal)}
                            disabled={medal.price_vqc > userBalance && mode === 'store'}
                            className={`p-4 border rounded transition-all text-left ${selectedMedal?.id === medal.id
                                    ? 'border-cyan-500 bg-cyan-500/10'
                                    : 'border-white/10 bg-white/5 hover:border-white/30'
                                } ${medal.price_vqc > userBalance && mode === 'store' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="text-3xl mb-2">{medal.icon}</div>
                            <div className="text-white font-bold text-sm">{medal.name}</div>
                            <div className="text-gray-500 text-xs mb-2">{medal.description}</div>
                            <div className="flex items-center justify-between">
                                <span className={`text-[10px] px-2 py-0.5 border rounded uppercase ${getTierColor(medal.tier)}`}>
                                    {medal.tier}
                                </span>
                                <span className="text-cyan-400 text-sm font-bold">{medal.price_vqc} VQC</span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Gift Message (Gift Mode) */}
                {mode === 'gift' && selectedMedal && (
                    <div className="px-4 py-3 border-t border-white/10">
                        <input
                            type="text"
                            placeholder="Add a message (optional)"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500/50"
                            maxLength={100}
                        />
                    </div>
                )}

                {/* Action Button */}
                <div className="p-4 border-t border-cyan-500/20">
                    <CyberButton
                        onClick={mode === 'gift' ? handleGift : handlePurchase}
                        disabled={!selectedMedal || loading}
                        className="w-full"
                    >
                        {loading ? 'PROCESSING...' : (
                            mode === 'gift'
                                ? `SEND ${selectedMedal?.name || 'MEDAL'}`
                                : `BUY FOR ${selectedMedal?.price_vqc || 0} VQC`
                        )}
                    </CyberButton>
                </div>
            </div>
        </div>
    );
}
