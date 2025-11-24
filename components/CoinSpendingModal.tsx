'use client';

import { useState } from 'react';
import { Zap, Pin, X, Loader2 } from 'lucide-react';

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
            setError('You must vote first before boosting');
            return;
        }

        if (!optionId) {
            setError('Invalid option');
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
                setError(data.error || 'Failed to boost vote');
                setLoading(false);
                return;
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    const handleHighlight = async () => {
        if (!isCreator) {
            setError('Only the proposal creator can highlight');
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
                setError(data.error || 'Failed to highlight proposal');
                setLoading(false);
                return;
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError('Network error. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="glass-heavy rounded-2xl p-6 max-w-md w-full mx-4 animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Spend Coins</h2>
                        <p className="text-sm text-zinc-400 mt-1">
                            You have <span className="text-yellow-500 font-semibold">{userCoins} VQC</span>
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-lg transition-all"
                        disabled={loading}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-slide-up">
                        {error}
                    </div>
                )}

                {/* Options */}
                <div className="space-y-3">
                    {/* Boost Option */}
                    {hasVoted && (
                        <button
                            onClick={handleBoost}
                            disabled={userCoins < 500 || loading}
                            className="w-full glass-medium rounded-xl p-4 hover:glass-heavy transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-all">
                                    <Zap className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-white">Boost Vote (2x)</h3>
                                    <p className="text-sm text-zinc-400">Your vote counts double</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-yellow-500">500 VQC</span>
                                    {userCoins < 500 && (
                                        <p className="text-xs text-red-400">Not enough</p>
                                    )}
                                </div>
                            </div>
                        </button>
                    )}

                    {/* Highlight Option */}
                    {isCreator && (
                        <button
                            onClick={handleHighlight}
                            disabled={userCoins < 200 || loading}
                            className="w-full glass-medium rounded-xl p-4 hover:glass-heavy transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-all">
                                    <Pin className="w-6 h-6 text-blue-500" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-white">Highlight Proposal</h3>
                                    <p className="text-sm text-zinc-400">Pin to top for 24 hours</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-bold text-blue-500">200 VQC</span>
                                    {userCoins < 200 && (
                                        <p className="text-xs text-red-400">Not enough</p>
                                    )}
                                </div>
                            </div>
                        </button>
                    )}

                    {/* No options available */}
                    {!hasVoted && !isCreator && (
                        <div className="text-center py-8 text-zinc-500">
                            <p>No spending options available</p>
                            <p className="text-sm mt-2">Vote to enable boosting</p>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-zinc-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                    </div>
                )}

                {/* Cancel Button */}
                <button
                    onClick={onClose}
                    disabled={loading}
                    className="mt-6 w-full btn btn-secondary"
                >
                    Cancel
                </button>
            </div>
        </div >
    );
}
