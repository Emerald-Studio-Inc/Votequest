'use client';

import React, { useState } from 'react';
import { Check, Zap, Users } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface FlutterwaveSubscriptionPickerProps {
    organizationId: string;
    userId: string;
    onBack: () => void;
    onSuccess: (tier: number) => void;
}

interface SubscriptionTier {
    tier: number;
    name: string;
    price: number;
    currency: string;
    voters: number;
    features: string[];
    popular?: boolean;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
    {
        tier: 1,
        name: 'Starter',
        price: 9500,
        currency: 'NGN',
        voters: 50,
        features: [
            '50 voter limit',
            'Basic room management',
            'Email support'
        ]
    },
    {
        tier: 2,
        name: 'Professional',
        price: 24500,
        currency: 'NGN',
        voters: 250,
        features: [
            '250 voter limit',
            'Advanced analytics',
            'Priority support',
            'Custom branding'
        ],
        popular: true
    },
    {
        tier: 3,
        name: 'Enterprise',
        price: 49500,
        currency: 'NGN',
        voters: 1000,
        features: [
            '1000 voter limit',
            'Custom integrations',
            '24/7 dedicated support',
            'Advanced security'
        ]
    }
];

const FlutterwaveSubscriptionPicker: React.FC<FlutterwaveSubscriptionPickerProps> = ({
    organizationId,
    userId,
    onBack,
    onSuccess
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTier, setSelectedTier] = useState<number | null>(null);

    const handleSubscribe = async (tier: number) => {
        setLoading(true);
        setError(null);
        setSelectedTier(tier);

        try {
            const response = await fetch('/api/flutterwave/create-subscription', {
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

            // Redirect to Flutterwave payment link
            if (data.paymentLink) {
                window.location.href = data.paymentLink;
            }
        } catch (err: any) {
            console.error('Subscription error:', err);
            setError(err.message || 'Failed to process subscription');
            setLoading(false);
            setSelectedTier(null);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 border-b border-white/5 bg-black/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-8 py-6">
                    <button
                        onClick={onBack}
                        className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2"
                        disabled={loading}
                    >
                        ← Back
                    </button>
                    <h1 className="text-3xl font-bold">Choose Your Plan</h1>
                    <p className="text-mono-60 mt-2">Scale your voting platform with VoteQuest</p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-6xl mx-auto px-8 mt-6">
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                </div>
            )}

            {/* Pricing Cards */}
            <div className="max-w-6xl mx-auto px-8 py-12">
                <div className="grid md:grid-cols-3 gap-8">
                    {SUBSCRIPTION_TIERS.map((tier) => (
                        <div
                            key={tier.tier}
                            className={`
                                relative rounded-2xl border transition-all duration-300
                                ${tier.popular
                                    ? 'border-blue-500 bg-gradient-to-br from-blue-500/10 to-black ring-2 ring-blue-500/50 md:scale-105'
                                    : 'border-white/10 bg-white/5 hover:border-white/20'
                                }
                            `}
                        >
                            {/* Popular Badge */}
                            {tier.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                                    MOST POPULAR
                                </div>
                            )}

                            <div className="p-8">
                                {/* Tier Name */}
                                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="text-4xl font-bold">
                                        ₦{(tier.price / 100).toLocaleString()}
                                    </div>
                                    <p className="text-mono-60 text-sm mt-1">/month (NGN)</p>
                                </div>

                                {/* Voter Limit */}
                                <div className="mb-8 p-4 rounded-lg bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 text-blue-400 font-semibold">
                                        <Users className="w-5 h-5" />
                                        {tier.voters} voters
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="mb-8 space-y-3">
                                    {tier.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-mono-80">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Subscribe Button */}
                                <button
                                    onClick={() => handleSubscribe(tier.tier)}
                                    disabled={loading}
                                    className={`
                                        w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2
                                        ${loading && selectedTier === tier.tier
                                            ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                            : tier.popular
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
                                            : 'border border-white/20 hover:border-white/40 text-white'
                                        }
                                    `}
                                >
                                    {loading && selectedTier === tier.tier ? (
                                        <>
                                            <LoadingSpinner size="small" />
                                            <span>Processing...</span>
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

                {/* Info Section */}
                <div className="mt-16 p-8 rounded-xl bg-white/5 border border-white/10">
                    <h3 className="text-lg font-bold mb-4">Payment Information</h3>
                    <ul className="space-y-2 text-mono-80">
                        <li>✓ Secure Flutterwave payment processing</li>
                        <li>✓ All payments in Nigerian Naira (₦)</li>
                        <li>✓ Automatic monthly billing</li>
                        <li>✓ Cancel anytime from your settings</li>
                        <li>✓ Invoices sent to your email</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default FlutterwaveSubscriptionPicker;
