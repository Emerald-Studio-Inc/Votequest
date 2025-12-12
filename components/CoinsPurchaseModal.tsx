'use client';

import React, { useState } from 'react';
import { X, Coins, Zap, Gift, Sparkles, ExternalLink } from 'lucide-react';

interface CoinsPurchaseModalProps {
  userId: string;
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COIN_PACKAGES = [
  { id: 'starter', coins: 100, price: 500, label: 'Starter', popular: false },
  { id: 'popular', coins: 500, price: 2000, label: 'Popular', popular: true, bonus: 50 },
  { id: 'pro', coins: 1000, price: 3500, label: 'Pro', popular: false, bonus: 150 },
  { id: 'ultimate', coins: 5000, price: 15000, label: 'Ultimate', popular: false, bonus: 1000 },
];

export default function CoinsPurchaseModal({ userId, email, isOpen, onClose, onSuccess }: CoinsPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!selectedPackage) return;

    const pkg = COIN_PACKAGES.find(p => p.id === selectedPackage);
    if (!pkg) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/flutterwave/purchase-coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          packageId: pkg.id,
          amount: pkg.price,
          coins: pkg.coins + (pkg.bonus || 0)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      // Redirect to Flutterwave payment page
      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error('No payment link received');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-black/90 border border-white/10 rounded-3xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Coins className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Buy VQC Coins</h2>
              <p className="text-sm text-mono-60">Power up your voting experience</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Package Grid */}
        <div className="p-6 grid grid-cols-2 gap-4">
          {COIN_PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`relative p-4 rounded-2xl border-2 transition-all text-left ${selectedPackage === pkg.id
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
            >
              {pkg.popular && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 text-xs font-bold text-black">
                  BEST VALUE
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-mono-60">{pkg.label}</span>
              </div>

              <div className="text-2xl font-bold mb-1">
                {pkg.coins.toLocaleString()}
                {pkg.bonus && (
                  <span className="text-sm text-green-400 ml-1">+{pkg.bonus}</span>
                )}
              </div>

              <div className="text-mono-60 text-sm">
                ₦{pkg.price.toLocaleString()}
              </div>
            </button>
          ))}
        </div>

        {/* Features */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-6 text-sm text-mono-60">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>Instant delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-green-400" />
              <span>Bonus coins included</span>
            </div>
          </div>
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
            onClick={handlePurchase}
            disabled={!selectedPackage || loading}
            className="w-full py-4 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="loading-spinner w-5 h-5 border-black/30 border-t-black" />
                Processing...
              </>
            ) : (
              <>
                <ExternalLink className="w-5 h-5" />
                Continue to Payment
              </>
            )}
          </button>

          <p className="text-center text-xs text-mono-50 mt-3">
            Secure payment powered by Flutterwave
          </p>
        </div>
      </div>
    </div>
  );
}
