'use client';

import React, { useState } from 'react';
import { X, Zap, TrendingUp, Sparkles } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface CoinsPurchaseModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (coins: number) => void;
}

interface CoinPackage {
    id: string;
    name: string;
    coins: number;
    price: number;
    currency: string;
    bonus?: number;
    popular?: boolean;
    icon?: React.ReactNode;
}

const COIN_PACKAGES: CoinPackage[] = [
    {
        id: 'trial',
        name: 'Trial',
        coins: 50,
        price: 500,
        currency: 'NGN',
        icon: <Sparkles className="w-5 h-5" />
    },
    {
        id: 'starter',
        name: 'Starter',
        coins: 200,
        price: 1500,
        currency: 'NGN',
        icon: <Zap className="w-5 h-5" />
    },
    {
        id: 'popular',
        name: 'Popular',
        coins: 500,
        price: 4000,
        currency: 'NGN',
        bonus: 50,
        popular: true,
        icon: <TrendingUp className="w-5 h-5" />
    },
    {
        id: 'power',
        name: 'Power',
        coins: 1500,
        price: 10000,
        currency: 'NGN',
        bonus: 300,
        icon: <Zap className="w-5 h-5" />
    }
];

const CoinsPurchaseModal: React.FC<CoinsPurchaseModalProps> = (props) => {
    const { userId, isOpen, onClose, onSuccess } = props;
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handlePurchase = async () => {
        if (!selectedPackage) {
            setError('Please select a package');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/flutterwave/purchase-coins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    packageType: selectedPackage
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create payment');
            }

            // Redirect to Flutterwave payment link
            if (data.paymentLink) {
                window.location.href = data.paymentLink;
            }
        } catch (err: any) {
            console.error('Purchase error:', err);
            setError(err.message || 'Failed to process payment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-br from-black/90 to-black/80 border border-white/10 p-5 md:p-8 max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    disabled={loading}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold mb-2">Get VoteQuest Coins</h2>
                <p className="text-mono-60 mb-8">Purchase coins to unlock premium features</p>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Payment successful! Coins added to your account.</span>
                    </div>
                )}

                {/* Coin Packages */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-8">
                    {COIN_PACKAGES.map((pkg) => (
                        <button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg.id)}
                            disabled={loading || success}
                            className={`
                                relative p-4 rounded-xl border transition-all duration-200
                                ${selectedPackage === pkg.id
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-white/10 hover:border-white/20 bg-white/5'
                                }
                                ${pkg.popular ? 'ring-2 ring-yellow-500/30' : ''}
                                disabled:opacity-50
                            `}
                        >
                            {/* Popular Badge */}
                            {pkg.popular && (
                                <div className="absolute -top-3 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                                    BEST VALUE
                                </div>
                            )}

                            {/* Icon */}
                            <div className="flex items-center justify-center mb-3">
                                <div className={`${pkg.popular ? 'text-yellow-400' : 'text-white/60'}`}>
                                    {pkg.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <p className="font-semibold mb-1">{pkg.name}</p>
                            <p className="text-2xl font-bold mb-1">{pkg.coins}</p>
                            {pkg.bonus && (
                                <p className="text-xs text-green-400 mb-2">+{pkg.bonus} bonus</p>
                            )}
                            <p className="text-sm text-mono-70">₦{pkg.price.toLocaleString()}</p>
                        </button>
                    ))}
                </div>

                {/* Purchase Button */}
                {!success && (
                    <button
                        onClick={handlePurchase}
                        disabled={loading || !selectedPackage}
                        className={`
                            w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2
                            ${loading || !selectedPackage
                                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }
                        `}
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner size="small" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                <span>
                                    Purchase Coins
                                    {selectedPackage && ` - ₦${(COIN_PACKAGES.find(p => p.id === selectedPackage)?.price || 0).toLocaleString()}`}
                                </span>
                            </>
                        )}
                    </button>
                )}

                {/* Info Text */}
                <p className="text-xs text-mono-60 text-center mt-6">
                    Secure Flutterwave payment. Coins added immediately after successful payment.
                </p>
            </div>
        </div>
    );
};

export default CoinsPurchaseModal;
