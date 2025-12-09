'use client';

import React, { useEffect, useState } from 'react';
import { CreditCard, AlertCircle, Check, Settings } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface SubscriptionStatusProps {
    organizationId: string;
    userId: string;
    onManageBilling?: () => void;
    onUpgrade?: () => void;
}

interface SubscriptionData {
    tier: number;
    status: 'active' | 'past_due' | 'incomplete' | 'canceled';
    currentPeriodEnd?: string;
    tierName: string;
    voterLimit: number;
}

const TIER_INFO = {
    1: { name: 'Starter', voterLimit: 50, color: 'blue' },
    2: { name: 'Professional', voterLimit: 250, color: 'purple' },
    3: { name: 'Enterprise', voterLimit: 1000, color: 'gold' }
};

const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
    organizationId,
    userId,
    onManageBilling,
    onUpgrade
}) => {
    const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSubscription();
    }, [organizationId]);

    const loadSubscription = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/organizations/${organizationId}/subscription`, {
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': userId
                }
            });

            if (!response.ok) {
                // If not found, assume free tier
                setSubscription({
                    tier: 1,
                    status: 'active',
                    tierName: 'Starter',
                    voterLimit: 50
                });
                return;
            }

            const data = await response.json();
            const tierInfo = TIER_INFO[data.tier as keyof typeof TIER_INFO];

            setSubscription({
                tier: data.tier,
                status: data.status,
                currentPeriodEnd: data.current_period_end,
                tierName: tierInfo.name,
                voterLimit: tierInfo.voterLimit
            });
        } catch (err: any) {
            console.error('Error loading subscription:', err);
            setError('Failed to load subscription');
        } finally {
            setLoading(false);
        }
    };

    const handleManageBilling = async () => {
        try {
            const response = await fetch('/api/stripe/portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    organizationId,
                    userId
                })
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            console.error('Error accessing billing portal:', err);
            onManageBilling?.();
        }
    };

    if (loading) {
        return (
            <div className="w-full rounded-xl border border-white/10 bg-white/5 p-6 flex items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (!subscription) return null;

    const statusColor = {
        active: 'text-green-400 bg-green-500/10',
        past_due: 'text-yellow-400 bg-yellow-500/10',
        incomplete: 'text-orange-400 bg-orange-500/10',
        canceled: 'text-red-400 bg-red-500/10'
    }[subscription.status];

    const periodEndDate = subscription.currentPeriodEnd
        ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
        : null;

    return (
        <div className="w-full rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold mb-1">Subscription Status</h3>
                    <p className="text-sm text-mono-60">Manage your organization plan</p>
                </div>
                <CreditCard className="w-5 h-5 text-mono-70" />
            </div>

            {/* Status Alert */}
            {subscription.status !== 'active' && (
                <div className={`mb-6 p-4 rounded-lg border border-white/10 flex items-start gap-3 ${statusColor}`}>
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium capitalize mb-1">{subscription.status}</p>
                        <p className="text-sm">
                            {subscription.status === 'past_due' && 'Your payment is overdue. Please update your billing information.'}
                            {subscription.status === 'incomplete' && 'Your subscription setup is incomplete. Please complete the payment.'}
                            {subscription.status === 'canceled' && 'Your subscription has been canceled. You are using the free tier.'}
                        </p>
                    </div>
                </div>
            )}

            {/* Subscription Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Current Tier */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs uppercase text-mono-60 font-bold mb-2">Current Tier</p>
                    <p className="text-2xl font-bold mb-1">{subscription.tierName}</p>
                    {subscription.tier < 3 && (
                        <p className="text-xs text-blue-400">Tier {subscription.tier} of 3</p>
                    )}
                </div>

                {/* Voter Limit */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-xs uppercase text-mono-60 font-bold mb-2">Voter Limit</p>
                    <p className="text-2xl font-bold mb-1">{subscription.voterLimit}</p>
                    <p className="text-xs text-mono-70">per room</p>
                </div>

                {/* Renewal Date */}
                {periodEndDate && (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                        <p className="text-xs uppercase text-mono-60 font-bold mb-2">Renewal Date</p>
                        <p className="text-2xl font-bold mb-1">{periodEndDate}</p>
                        <p className="text-xs text-mono-70">auto-renews monthly</p>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                {subscription.tier < 3 && (
                    <button
                        onClick={onUpgrade}
                        className="flex-1 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Check className="w-4 h-4" />
                        Upgrade Tier
                    </button>
                )}

                <button
                    onClick={handleManageBilling}
                    className="flex-1 py-2 px-4 rounded-lg border border-white/20 text-mono-80 hover:bg-white/5 font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <Settings className="w-4 h-4" />
                    Manage Billing
                </button>
            </div>

            {/* Feature Breakdown */}
            {subscription.tier < 3 && (
                <div className="mt-6 p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <p className="text-xs uppercase text-blue-400 font-bold mb-3">Upgrade Benefits</p>
                    <ul className="text-sm text-mono-70 space-y-2">
                        {subscription.tier === 1 && (
                            <>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-400">→</span>
                                    Professional: 250 voters/room (vs 50)
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-blue-400">→</span>
                                    Enterprise: 1000 voters/room (vs 50)
                                </li>
                            </>
                        )}
                        {subscription.tier === 2 && (
                            <li className="flex items-center gap-2">
                                <span className="text-blue-400">→</span>
                                Enterprise: 1000 voters/room (vs 250) + Advanced features
                            </li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SubscriptionStatus;
