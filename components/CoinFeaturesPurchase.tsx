'use client';

import React, { useState } from 'react';
import { X, Zap, Users, Clock, Shield, Check, Sparkles, Vote, QrCode } from 'lucide-react';
import CyberCard from './CyberCard';
import CyberButton from './CyberButton';

interface CoinFeaturesPurchaseProps {
  roomId: string;
  userCoins: number;
  userId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// These match the API's FEATURE_COSTS
const ROOM_FEATURES = [
  {
    id: 'extra_voters',
    name: 'EXTRA_VOTERS',
    description: 'ADD_10_VOTER_SLOTS',
    cost: 1,
    icon: Users,
  },
  {
    id: 'extended_window',
    name: 'EXTEND_VOTING',
    description: 'EXTEND_WINDOW_7_DAYS',
    cost: 1,
    icon: Clock,
  },
  {
    id: 'qr_code',
    name: 'QR_ACCESS',
    description: 'GENERATE_SECURE_QR_CODE',
    cost: 1,
    icon: QrCode,
  },
  {
    id: 'audit_trail',
    name: 'AUDIT_LOGS',
    description: 'ENABLE_TRANSPARENCY_LOGS',
    cost: 3,
    icon: Shield,
  },
  {
    id: 'anonymous_voting',
    name: 'STEALTH_MODE',
    description: 'ENABLE_ANONYMOUS_VOTING',
    cost: 2,
    icon: Vote,
  },
  {
    id: 'custom_branding',
    name: 'CUSTOM_SKIN',
    description: 'APPLY_ORG_BRANDING',
    cost: 1,
    icon: Sparkles,
  },
];

const NEON_CYAN = '#0055FF';
const NEON_MAGENTA = '#EF4444'; // Standard Red
const NEON_LIME = '#3B82F6'; // Blue Highlight

export default function CoinFeaturesPurchase({
  roomId,
  userCoins,
  userId,
  isOpen,
  onClose,
  onSuccess
}: CoinFeaturesPurchaseProps) {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!selectedFeature) return;

    const feature = ROOM_FEATURES.find(f => f.id === selectedFeature);
    if (!feature) return;

    if (userCoins < feature.cost) {
      setError(`INSUFFICIENT_FUNDS: NEED_${feature.cost}_VQC`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/rooms/${roomId}/purchase-feature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId || ''
        },
        body: JSON.stringify({
          featureType: feature.id,
          cost: feature.cost
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purchase failed');
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess(false);
        setSelectedFeature(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // No selectedFeatureData needed if unused

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md font-mono overflow-y-auto custom-scrollbar">
      {/* Cyber Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(${NEON_CYAN}10 1px, transparent 1px), linear-gradient(90deg, ${NEON_CYAN}10 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <CyberCard
        className="w-full max-w-md relative z-10"
        title="SYSTEM_UPGRADE"
        cornerStyle="tech"
      >
        <div className="flex flex-col h-full max-h-[85vh]">
          {/* Header */}
          <div className="p-6 border-b pb-4 flex items-center justify-between" style={{ borderColor: `${NEON_CYAN}30` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border flex items-center justify-center bg-black" style={{ borderColor: NEON_CYAN }}>
                <Zap className="w-5 h-5" style={{ color: NEON_CYAN }} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white uppercase tracking-wider glitch-text" data-text="BOOST_CHAMBER">BOOST_CHAMBER</h2>
                <p className="text-[10px] text-gray-500 uppercase">ENHANCE_FUNCTIONALITY</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center hover:bg-white/10 transition-colors border border-transparent hover:border-red-500/50"
            >
              <X className="w-5 h-5 text-gray-400 hover:text-red-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {/* Balance */}
            <div className="mb-6 px-4 py-3 border bg-black/40 flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
              <span className="text-xs text-gray-400 uppercase">AVAILABLE_CREDITS</span>
              <span className="text-lg font-bold font-mono" style={{ color: NEON_LIME }}>{userCoins.toLocaleString()} VQC</span>
            </div>

            {/* Success State */}
            {success ? (
              <div className="p-12 flex flex-col items-center justify-center animate-scale-in">
                <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center mb-4 animate-bounce"
                  style={{ borderColor: NEON_LIME, backgroundColor: `${NEON_LIME}20` }}>
                  <Check className="w-8 h-8" style={{ color: NEON_LIME }} />
                </div>
                <h3 className="text-xl font-bold mb-2 uppercase text-white tracking-widest">UPGRADE_INSTALLED</h3>
                <p className="text-xs text-gray-400 font-mono uppercase">Wait for system reboot...</p>
              </div>
            ) : (
              <>
                {/* Feature Options */}
                <div className="space-y-3">
                  {ROOM_FEATURES.map((feature) => {
                    const Icon = feature.icon;
                    const canAfford = userCoins >= feature.cost;
                    const isSelected = selectedFeature === feature.id;

                    return (
                      <button
                        key={feature.id}
                        onClick={() => canAfford && setSelectedFeature(feature.id)}
                        disabled={!canAfford}
                        className="w-full p-4 border transition-all text-left flex items-start gap-4 group relative overflow-hidden"
                        style={{
                          borderColor: isSelected ? NEON_CYAN : canAfford ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                          backgroundColor: isSelected ? `${NEON_CYAN}10` : 'transparent',
                          opacity: canAfford ? 1 : 0.5,
                          cursor: canAfford ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {isSelected && <div className="absolute inset-0 bg-cyan-400/5 animate-pulse pointer-events-none" />}

                        <div className="w-10 h-10 border flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: isSelected ? NEON_CYAN : 'rgba(255,255,255,0.1)',
                            color: isSelected ? NEON_CYAN : 'gray'
                          }}>
                          <Icon className="w-5 h-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-sm text-white uppercase tracking-wide" style={{ color: isSelected ? NEON_CYAN : 'white' }}>{feature.name}</h4>
                            <span className="text-xs font-bold font-mono" style={{ color: canAfford ? NEON_LIME : NEON_MAGENTA }}>
                              {feature.cost} VQC
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-mono uppercase">{feature.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-4 p-3 border bg-red-900/10 text-red-400 text-xs font-mono uppercase flex items-center gap-2"
                    style={{ borderColor: NEON_MAGENTA }}>
                    <X className="w-4 h-4" />
                    {'>'} ERROR: {error}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer - Only show if not success */}
          {!success && (
            <div className="p-6 border-b mt-auto" style={{ borderColor: `${NEON_CYAN}30` }}>
              <CyberButton
                onClick={handlePurchase}
                disabled={loading || !selectedFeature}
                className="w-full"
              >
                {loading ? 'INITIALIZING...' : 'INSTALL_UPGRADE'}
              </CyberButton>
            </div>
          )}
        </div>
      </CyberCard>
    </div>
  );
}
