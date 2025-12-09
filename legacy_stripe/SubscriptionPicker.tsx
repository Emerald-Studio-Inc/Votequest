'use client';

import React, { useState } from 'react';
import { Check, Zap, Users } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface SubscriptionPickerProps {
    organizationId: string;
    userId: string;
    currentTier?: number;
    onSuccess?: (tier: number) => void;
    onCancel?: () => void;
}

interface TierOption {
    id: number;
    name: string;
    price: number;
    voters: number;
    features: string[];
    popular?: boolean;
}

const SUBSCRIPTION_TIERS: TierOption[] = [
    {
        id: 1,
        name: 'Starter',
        price: 19,
        voters: 50,
        features: [
            'Up to 50 voters per room',
            'Basic analytics',
            'Email support',
            'Room management'
        ]
    },
    {
        id: 2,
        name: 'Professional',
        price: 49,
        voters: 250,
        features: [
            'Up to 250 voters per room',
            'Advanced analytics',
            'Priority support',
            'Custom branding',
            'Multiple rooms',
            'Voter import (CSV)'
        ],
        popular: true
    },
    {
        id: 3,
        name: 'Enterprise',
        price: 99,
        voters: 1000,
        features: [
            'Up to 1000 voters per room',
            'Full analytics suite',
            'Dedicated support',
            'White-label options',
            'Unlimited rooms',
            'Advanced integrations',
            'API access'
        ]
    }
];

const SubscriptionPicker: React.FC<SubscriptionPickerProps> = ({
    organizationId,
    userId,
    currentTier = 1,
    onSuccess,
    onCancel
}) => {
    const [selectedTier, setSelectedTier] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubscribe = async (tier: number) => {
        if (tier === currentTier) {
            onCancel?.();
            return;
        }

        setLoading(true);
        setError(null);
        setSelectedTier(tier);

        try {
            const response = await fetch('/api/stripe/create-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    organizationId,
                    userId,
                    tier
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create subscription');
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            }

            onSuccess?.(tier);
        } catch (err: any) {
            console.error('Subscription error:', err);
            setError(err.message || 'Failed to process subscription');
            setSelectedTier(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-3">Choose Your Plan</h2>
                <p className="text-mono-60 text-lg">
                    Unlock more voters and premium features for your organization
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {SUBSCRIPTION_TIERS.map((tier) => (
                    <div
                        key={tier.id}
                        className={`
                            relative rounded-xl border transition-all duration-300 overflow-hidden
                            ${tier.popular ? 'md:scale-105 border-white/20' : 'border-white/10'}
                            ${selectedTier === tier.id ? 'ring-2 ring-blue-500' : ''}
                            hover:border-white/20
                        `}
                    >
                        {/* Popular Badge */}
                        {tier.popular && (
                            <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-xs font-bold rounded-bl-lg">
                                MOST POPULAR
                            </div>
                        )}

                        {/* Card Content */}
                        <div className="p-8 h-full flex flex-col bg-black/40 backdrop-blur-sm">
                            {/* Tier Name and Price */}
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold">${tier.price}</span>
                                    <span className="text-mono-60">/month</span>
                                </div>
                            </div>

                            {/* Voter Count */}
                            <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm text-mono-70">Voter Limit</span>
                                </div>
                                <p className="text-2xl font-bold">{tier.voters}</p>
                                <p className="text-xs text-mono-60 mt-1">per room</p>
                            </div>

                            {/* Features List */}
                            <div className="mb-8 flex-grow">
                                <p className="text-xs uppercase text-mono-70 font-bold mb-4">Features</p>
                                <ul className="space-y-3">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3 text-sm">
                                            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-mono-80">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Subscribe Button */}
                            <button
                                onClick={() => handleSubscribe(tier.id)}
                                disabled={loading && selectedTier === tier.id}
                                className={`
                                    w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2
                                    ${currentTier === tier.id
                                        ? 'bg-white/10 text-white cursor-default border border-white/20'
                                        : tier.popular
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                    }
                                    ${loading && selectedTier === tier.id ? 'opacity-70' : ''}
                                `}
                            >
                                {loading && selectedTier === tier.id ? (
                                    <>
                                        <LoadingSpinner size="small" />
                                        <span>Processing...</span>
                                    </>
                                ) : currentTier === tier.id ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Current Plan</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        <span>Subscribe Now</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Cancel Button */}
            {onCancel && (
                <div className="flex justify-center">
                    <button
                        onClick={onCancel}
                        className="px-6 py-2 rounded-lg border border-white/20 text-mono-80 hover:bg-white/5 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPicker;
