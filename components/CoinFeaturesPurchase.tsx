'use client';

import React, { useState } from 'react';
import { X, Zap, Crown, BarChart3, Lock, Palette, Calendar, QrCode } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface CoinFeaturesPurchaseProps {
    roomId: string;
    userCoins: number;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (feature: string) => void;
}

interface CoinFeature {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: React.ReactNode;
    category: 'addon' | 'feature' | 'service';
    duration?: string;
}

const COIN_FEATURES: CoinFeature[] = [
    // Room Add-ons
    {
        id: 'extra_voters',
        name: 'Extra Voters',
        description: 'Add 10 more voters beyond your tier limit',
        cost: 1,
        category: 'addon',
        icon: <Crown className="w-5 h-5" />
    },
    {
        id: 'extend_room',
        name: 'Extend Room',
        description: 'Keep room open for 30 more days',
        cost: 5,
        category: 'addon',
        icon: <Calendar className="w-5 h-5" />,
        duration: '30 days'
    },
    {
        id: 'audit_trail',
        name: 'Audit Trail',
        description: 'Track voting history & timestamps',
        cost: 3,
        category: 'addon',
        icon: <BarChart3 className="w-5 h-5" />
    },

    // Feature Upgrades
    {
        id: 'ranked_choice_voting',
        name: 'Ranked Choice Voting',
        description: 'Let voters rank options by preference',
        cost: 2,
        category: 'feature',
        icon: <Lock className="w-5 h-5" />
    },
    {
        id: 'anonymous_voting',
        name: 'Anonymous Voting',
        description: 'Hide voter identities in results',
        cost: 2,
        category: 'feature',
        icon: <Lock className="w-5 h-5" />
    },
    {
        id: 'weighted_voting',
        name: 'Weighted Voting',
        description: 'Assign different vote weights to voters',
        cost: 2,
        category: 'feature',
        icon: <Crown className="w-5 h-5" />
    },
    {
        id: 'custom_branding',
        name: 'Custom Branding',
        description: 'Add custom colors & logos to room',
        cost: 1,
        category: 'feature',
        icon: <Palette className="w-5 h-5" />
    },

    // Quick Services
    {
        id: 'qr_code',
        name: 'QR Code',
        description: 'Generate QR code for voters to join',
        cost: 1,
        category: 'service',
        icon: <QrCode className="w-5 h-5" />
    },
    {
        id: 'instant_tabulation',
        name: 'Instant Tabulation',
        description: 'Get results immediately without waiting',
        cost: 2,
        category: 'service',
        icon: <Zap className="w-5 h-5" />
    },
    {
        id: 'extended_window',
        name: 'Extended Window',
        description: 'Keep voting open for 7 more days',
        cost: 1,
        category: 'service',
        icon: <Calendar className="w-5 h-5" />
    }
];

const CoinFeaturesPurchase: React.FC<CoinFeaturesPurchaseProps> = ({
    roomId,
    userCoins,
    isOpen,
    onClose,
    onSuccess
}) => {
    const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [activeCategory, setActiveCategory] = useState<'addon' | 'feature' | 'service'>('addon');

    const handlePurchase = async () => {
        if (!selectedFeature) {
            setError('Please select a feature');
            return;
        }

        const feature = COIN_FEATURES.find(f => f.id === selectedFeature);
        if (!feature) return;

        if (userCoins < feature.cost) {
            setError(`You need ${feature.cost} coins. You have ${userCoins}.`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/rooms/${roomId}/purchase-feature`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    featureType: selectedFeature,
                    cost: feature.cost
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to purchase feature');
            }

            setSuccess(true);
            onSuccess?.(selectedFeature);

            // Close after 2 seconds
            setTimeout(() => {
                onClose();
                setSuccess(false);
                setSelectedFeature(null);
            }, 2000);
        } catch (err: any) {
            console.error('Purchase error:', err);
            setError(err.message || 'Failed to process purchase');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredFeatures = COIN_FEATURES.filter(f => f.category === activeCategory);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-br from-black/90 to-black/80 border border-white/10 p-5 md:p-8 max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    disabled={loading}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold mb-2">Boost Your Room</h2>
                <p className="text-mono-60 mb-6">Purchase features with VQC coins</p>

                {/* Coin Balance */}
                <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-400" />
                        <span className="text-mono-80">
                            You have <span className="font-bold text-blue-400">{userCoins} VQC coins</span>
                        </span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                        <Zap className="w-4 h-4" />
                        <span>Feature purchased successfully!</span>
                    </div>
                )}

                {/* Category Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['addon', 'feature', 'service'] as const).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${activeCategory === cat
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white/5 text-mono-80 hover:bg-white/10'
                                }`}
                        >
                            {cat === 'addon' && 'Add-ons'}
                            {cat === 'feature' && 'Features'}
                            {cat === 'service' && 'Services'}
                        </button>
                    ))}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {filteredFeatures.map((feature) => (
                        <button
                            key={feature.id}
                            onClick={() => setSelectedFeature(feature.id)}
                            disabled={loading || success}
                            className={`
                                relative p-4 rounded-xl border transition-all duration-200 text-left
                                ${selectedFeature === feature.id
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-white/10 hover:border-white/20 bg-white/5'
                                }
                                ${userCoins < feature.cost ? 'opacity-50' : ''}
                                disabled:opacity-50
                            `}
                        >
                            {/* Icon */}
                            <div className="text-blue-400 mb-2">
                                {feature.icon}
                            </div>

                            {/* Content */}
                            <h4 className="font-semibold text-white mb-1">{feature.name}</h4>
                            <p className="text-xs text-mono-60 mb-3">{feature.description}</p>

                            {/* Cost */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-mono-70">
                                    {feature.duration && <span className="text-xs text-mono-60 block">{feature.duration}</span>}
                                </span>
                                <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                                    <Zap className="w-4 h-4 text-yellow-400" />
                                    <span className="text-sm font-semibold text-yellow-400">{feature.cost}</span>
                                </div>
                            </div>

                            {userCoins < feature.cost && (
                                <p className="text-xs text-red-400 mt-2">Not enough coins</p>
                            )}
                        </button>
                    ))}
                </div>

                {/* Purchase Button */}
                <button
                    onClick={handlePurchase}
                    disabled={loading || !selectedFeature || success}
                    className={`
                        w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2
                        ${loading || !selectedFeature || success
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
                                Purchase Feature
                                {selectedFeature && ` - ${COIN_FEATURES.find(f => f.id === selectedFeature)?.cost} coins`}
                            </span>
                        </>
                    )}
                </button>

                {/* Info Text */}
                <p className="text-xs text-mono-60 text-center mt-6">
                    Features are applied immediately to your room.
                </p>
            </div>
        </div>
    );
};

export default CoinFeaturesPurchase;
