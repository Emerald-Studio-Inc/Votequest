'use client';

import React, { useState } from 'react';
import { X, Coins, Zap, Gift, Sparkles, ExternalLink, CreditCard } from 'lucide-react';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';

interface CoinsPurchaseModalProps {
  userId: string;
  email: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const COIN_PACKAGES = [
  { id: 'starter', coins: 100, price: 500, label: 'STARTER_PACK', popular: false },
  { id: 'popular', coins: 500, price: 2000, label: 'POPULAR_CHOICE', popular: true, bonus: 50 },
  { id: 'pro', coins: 1000, price: 3500, label: 'PRO_TIER', popular: false, bonus: 150 },
  { id: 'ultimate', coins: 5000, price: 15000, label: 'ULTIMATE_BUNDLE', popular: false, bonus: 1000 },
];

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';
const NEON_LIME = '#39FF14';

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-mono overflow-y-auto custom-scrollbar">
      {/* Cyber Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <CyberCard
        className="w-full max-w-lg relative z-10"
        title="TOKEN_ACQUISITION"
        cornerStyle="tech"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 border-b pb-4" style={{ borderColor: `${NEON_CYAN}30` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border flex items-center justify-center bg-black" style={{ borderColor: NEON_CYAN }}>
                <Coins className="w-5 h-5" style={{ color: NEON_CYAN }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider glitch-text" data-text="ACQUIRE_VQC">ACQUIRE_VQC</h2>
                <p className="text-[10px] text-gray-500 uppercase">SECURE_PAYMENT_GATEWAY</p>
              </div>
            </div>
            <ArcadeButton
              onClick={onClose}
              variant="magenta"
              size="sm"
              className="w-8 h-8 !p-0 flex items-center justify-center opacity-70 hover:opacity-100"
            >
              <X className="w-5 h-5" strokeWidth={2.5} />
            </ArcadeButton>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Package Grid */}
            <div className="grid grid-cols-2 gap-4">
              {COIN_PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className="relative p-4 border transition-all text-left group overflow-hidden"
                  style={{
                    borderColor: selectedPackage === pkg.id ? NEON_CYAN : 'rgba(255,255,255,0.1)',
                    backgroundColor: selectedPackage === pkg.id ? `${NEON_CYAN}05` : 'transparent'
                  }}
                >
                  {/* Active Corner Pulse */}
                  {selectedPackage === pkg.id && (
                    <>
                      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r" style={{ borderColor: NEON_CYAN }}></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l" style={{ borderColor: NEON_CYAN }}></div>
                    </>
                  )}

                  {pkg.popular && (
                    <div className="absolute -top-1 -right-1 px-2 py-0.5 text-[10px] font-bold text-black uppercase" style={{ backgroundColor: NEON_LIME }}>
                      RECOMMENDED
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3" style={{ color: pkg.popular ? NEON_LIME : 'gray' }} />
                    <span className="text-xs font-medium text-gray-400 font-mono uppercase">{pkg.label}</span>
                  </div>

                  <div className="text-xl font-bold mb-1 text-white font-mono">
                    {pkg.coins.toLocaleString()}
                    {pkg.bonus && (
                      <span className="text-[10px] ml-1" style={{ color: NEON_LIME }}>+{pkg.bonus}</span>
                    )}
                  </div>

                  <div className="text-sm font-mono" style={{ color: NEON_CYAN }}>
                    ₦{pkg.price.toLocaleString()}
                  </div>
                </button>
              ))}
            </div>

            {/* Features */}
            <div className="px-2 py-3 border bg-black/40 flex items-center justify-between text-xs font-mono text-gray-400" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-2">
                <Zap className="w-3 h-3" style={{ color: NEON_LIME }} />
                <span>INSTANT_TRANSFER</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="w-3 h-3" style={{ color: NEON_MAGENTA }} />
                <span>BONUS_TOKENS</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 border bg-red-900/10 text-red-400 text-xs font-mono uppercase flex items-center gap-2"
                style={{ borderColor: NEON_MAGENTA }}>
                <X className="w-4 h-4" />
                {'>'} ERROR: {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t font-mono" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <ArcadeButton
              onClick={handlePurchase}
              disabled={!selectedPackage || loading}
              variant="cyan"
              className="w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'black', borderTopColor: 'transparent' }} />
                  PROCESSING_TRANSACTION...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  INITIATE_PAYMENT
                </>
              )}
            </ArcadeButton>

            <p className="text-center text-[10px] text-gray-600 mt-3 uppercase tracking-wider">
              SECURE_LINK_VIA_FLUTTERWAVE
            </p>
          </div>
        </div>
      </CyberCard>
    </div>
  );
}
