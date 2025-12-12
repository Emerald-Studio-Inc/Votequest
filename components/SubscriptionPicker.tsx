'use client';

import React, { useState } from 'react';
import { X, Check, Crown, Zap, Building2, Shield, ExternalLink } from 'lucide-react';

interface SubscriptionPickerProps {
  organizationId: string;
  currentTier: 'free' | 'basic' | 'pro' | 'enterprise';
  userId: string;
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 5000,
    priceLabel: '₦5,000/mo',
    description: 'For small organizations',
    roomLimit: 10,
    voterLimit: 100,
    features: ['Email verification', 'Basic analytics', '10 voting rooms', '100 voters per room'],
    icon: Zap,
    color: 'from-blue-500 to-blue-600',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 15000,
    priceLabel: '₦15,000/mo',
    description: 'For growing organizations',
    roomLimit: 50,
    voterLimit: 500,
    features: ['ID verification', 'Advanced analytics', '50 voting rooms', '500 voters per room', 'Custom branding', 'Priority support'],
    icon: Crown,
    color: 'from-purple-500 to-pink-600',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 50000,
    priceLabel: '₦50,000/mo',
    description: 'For large institutions',
    roomLimit: 999,
    voterLimit: 10000,
    features: ['Biometric KYC', 'Full analytics', 'Unlimited rooms', '10,000+ voters', 'API access', 'Dedicated support', 'SLA guarantee'],
    icon: Building2,
    color: 'from-yellow-500 to-orange-600',
    popular: false
  }
];

export default function SubscriptionPicker({
  organizationId,
  currentTier,
  userId,
  email,
  isOpen,
  onClose,
  onSuccess
}: SubscriptionPickerProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!selectedPlan) return;

    const plan = PLANS.find(p => p.id === selectedPlan);
    if (!plan) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/flutterwave/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          planId: plan.id,
          amount: plan.price,
          userId,
          email
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Subscription failed');
      }

      // Redirect to Flutterwave payment
      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        // If no redirect, assume immediate success for demo
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanData = PLANS.find(p => p.id === selectedPlan);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-black/95 border border-white/10 rounded-3xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/95 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Upgrade Your Plan</h2>
              <p className="text-sm text-mono-60">Choose a plan that fits your needs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const isCurrentPlan = plan.id === currentTier;
            const isSelected = selectedPlan === plan.id;
            const isDowngrade = PLANS.findIndex(p => p.id === plan.id) < PLANS.findIndex(p => p.id === currentTier);

            return (
              <button
                key={plan.id}
                onClick={() => !isCurrentPlan && !isDowngrade && setSelectedPlan(plan.id)}
                disabled={isCurrentPlan || isDowngrade}
                className={`relative p-6 rounded-2xl text-left transition-all ${isSelected
                  ? `bg-gradient-to-br ${plan.color} bg-opacity-20 border-2 border-white/40`
                  : isCurrentPlan
                    ? 'bg-white/10 border-2 border-white/20 opacity-60'
                    : isDowngrade
                      ? 'bg-white/5 border-2 border-white/5 opacity-40 cursor-not-allowed'
                      : 'bg-white/5 border-2 border-white/10 hover:border-white/20 cursor-pointer'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-xs font-bold text-white">
                    MOST POPULAR
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    Current
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-mono-60 mb-4">{plan.description}</p>

                <p className="text-2xl font-bold mb-4">{plan.priceLabel}</p>

                <div className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-mono-80">{feature}</span>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Action */}
        <div className="p-6 border-t border-white/10">
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || loading}
            className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="loading-spinner w-5 h-5" />
                Processing...
              </>
            ) : selectedPlanData ? (
              <>
                <ExternalLink className="w-5 h-5" />
                Subscribe to {selectedPlanData.name} - {selectedPlanData.priceLabel}
              </>
            ) : (
              'Select a plan to continue'
            )}
          </button>

          <p className="text-center text-xs text-mono-50 mt-3">
            Secure payment powered by Flutterwave • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
