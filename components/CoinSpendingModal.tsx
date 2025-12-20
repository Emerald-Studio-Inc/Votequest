'use client';

import { useState } from 'react';
import { Zap, Pin, X, Loader2, DollarSign } from 'lucide-react';
import CyberCard from './CyberCard';
import CyberButton from './CyberButton';

interface Props {
    userCoins: number;
    userId: string;
    proposalId: string;
    optionId?: string;
    isCreator: boolean;
    hasVoted: boolean;
    onSuccess: () => void;
    onClose: () => void;
}

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

export default function CoinSpendingModal({
    userCoins,
    userId,
    proposalId,
    optionId,
    isCreator,
    hasVoted,
    onSuccess,
    onClose
}: Props) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleBoost = async () => {
        if (!hasVoted) {
            setError('PROTOCOL_ERROR: CAST_VOTE_FIRST');
            return;
        }

        if (!optionId) {
            setError('PROTOCOL_ERROR: INVALID_VECTOR');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/coins/boost', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, proposalId, optionId })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'BOOST_FAILED');
                setLoading(false);
                return;
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError('NETWORK_FAILURE');
            setLoading(false);
        }
    };

    const handleHighlight = async () => {
        if (!isCreator) {
            setError('ACCESS_DENIED: CREATOR_ONLY');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/coins/highlight', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, proposalId })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'HIGHLIGHT_FAILED');
                setLoading(false);
                return;
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError('NETWORK_FAILURE');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-mono">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

            <CyberCard
                className="w-full max-w-md relative z-10"
                title="TRANSACTION_MODULE"
                cornerStyle="tech"
            >
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 border-b pb-4" style={{ borderColor: `${NEON_CYAN}30` }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 border flex items-center justify-center bg-black" style={{ borderColor: NEON_CYAN }}>
                                <DollarSign className="w-5 h-5" style={{ color: NEON_CYAN }} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white uppercase tracking-wider glitch-text" data-text="SPEND_COINS">SPEND_COINS</h2>
                                <p className="text-[10px] text-gray-500 uppercase">
                                    BALANCE: <span style={{ color: NEON_LIME }}>{userCoins} VQC</span>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors border border-transparent hover:border-red-500/50"
                        >
                            <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 border bg-red-900/10 text-red-400 text-xs font-mono uppercase flex items-center gap-2"
                            style={{ borderColor: NEON_MAGENTA }}>
                            <X className="w-4 h-4" />
                            {'>'} ERROR: {error}
                        </div>
                    )}

                    {/* Options */}
                    <div className="space-y-4">
                        {/* Boost Option */}
                        {hasVoted && (
                            <button
                                onClick={handleBoost}
                                disabled={userCoins < 500 || loading}
                                className="w-full p-4 border transition-all text-left flex items-start gap-4 group relative overflow-hidden hover:bg-white/5"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    opacity: (userCoins < 500 || loading) ? 0.5 : 1,
                                    cursor: (userCoins < 500 || loading) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div className="w-10 h-10 border flex items-center justify-center flex-shrink-0"
                                    style={{ borderColor: 'rgba(255,255,0,0.5)', color: 'yellow' }}>
                                    <Zap className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white uppercase text-sm mb-1">BOOST_VOTE_POWER (2x)</h3>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase">DOUBLE_IMPACT_MULTIPLIER</p>
                                </div>

                                <div className="text-right">
                                    <span className="text-sm font-bold font-mono" style={{ color: 'yellow' }}>500 VQC</span>
                                    {userCoins < 500 && (
                                        <p className="text-[9px] uppercase" style={{ color: NEON_MAGENTA }}>INSUFFICIENT</p>
                                    )}
                                </div>
                            </button>
                        )}

                        {/* Highlight Option */}
                        {isCreator && (
                            <button
                                onClick={handleHighlight}
                                disabled={userCoins < 200 || loading}
                                className="w-full p-4 border transition-all text-left flex items-start gap-4 group relative overflow-hidden hover:bg-white/5"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    opacity: (userCoins < 200 || loading) ? 0.5 : 1,
                                    cursor: (userCoins < 200 || loading) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <div className="absolute inset-0 bg-blue-400/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div className="w-10 h-10 border flex items-center justify-center flex-shrink-0"
                                    style={{ borderColor: NEON_CYAN, color: NEON_CYAN }}>
                                    <Pin className="w-5 h-5" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white uppercase text-sm mb-1">HIGHLIGHT_PROPOSAL</h3>
                                    <p className="text-[10px] text-gray-500 font-mono uppercase">PIN_TO_TOP_24H</p>
                                </div>

                                <div className="text-right">
                                    <span className="text-sm font-bold font-mono" style={{ color: NEON_CYAN }}>200 VQC</span>
                                    {userCoins < 200 && (
                                        <p className="text-[9px] uppercase" style={{ color: NEON_MAGENTA }}>INSUFFICIENT</p>
                                    )}
                                </div>
                            </button>
                        )}

                        {/* No options available */}
                        {!hasVoted && !isCreator && (
                            <div className="p-6 text-center border bg-white/5" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                                <p className="text-sm font-mono text-gray-400 uppercase">NO_ACTIONS_AVAILABLE</p>
                                <p className="text-[10px] text-gray-600 mt-2 uppercase">VOTE_TO_UNLOCK_BOOSTING</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-4 border-t flex justify-end" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                        <CyberButton
                            onClick={onClose}
                            disabled={loading}
                        >
                            CANCEL
                        </CyberButton>
                    </div>
                </div>
            </CyberCard>
        </div >
    );
}
