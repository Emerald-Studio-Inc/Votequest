'use client';

import React, { useState } from 'react';
import { X, Zap, Users, Clock, Shield, Check, Sparkles, Vote, QrCode } from 'lucide-react';

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
    name: 'Extra Voters',
    description: 'Add 10 more voter slots to this room',
    cost: 1,
    icon: Users,
  },
  {
    id: 'extended_window',
    name: 'Extend Voting',
    description: 'Extend voting window by 7 days',
    cost: 1,
    icon: Clock,
  },
  {
    id: 'qr_code',
    name: 'QR Code',
    description: 'Generate shareable QR code for easy access',
    cost: 1,
    icon: QrCode,
  },
  {
    id: 'audit_trail',
    name: 'Audit Trail',
    description: 'Enable detailed audit logging for transparency',
    cost: 3,
    icon: Shield,
  },
  {
    id: 'anonymous_voting',
    name: 'Anonymous Voting',
    description: 'Enable fully anonymous voting mode',
    cost: 2,
    icon: Vote,
  },
  {
    id: 'custom_branding',
    name: 'Custom Branding',
    description: 'Add your organization logo and colors',
    cost: 1,
    icon: Sparkles,
  },
];

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
      setError(`Not enough coins. You need ${feature.cost} VQC but have ${userCoins}.`);
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

  const selectedFeatureData = ROOM_FEATURES.find(f => f.id === selectedFeature);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-black/90 border border-white/10 rounded-3xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-black/90 backdrop-blur-xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Boost Room</h2>
              <p className="text-sm text-mono-60">Spend coins to enhance your room</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Balance */}
        <div className="px-6 py-4 bg-white/5 border-b border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-mono-60">Your Balance</span>
            <span className="text-xl font-bold text-yellow-400">{userCoins.toLocaleString()} VQC</span>
          </div>
        </div>

        {/* Success State */}
        {success ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mb-4 animate-scale-bounce">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Feature Activated!</h3>
            <p className="text-mono-60">Your room has been upgraded</p>
          </div>
        ) : (
          <>
            {/* Feature Options */}
            <div className="p-6 space-y-3">
              {ROOM_FEATURES.map((feature) => {
                const Icon = feature.icon;
                const canAfford = userCoins >= feature.cost;
                const isSelected = selectedFeature === feature.id;

                return (
                  <button
                    key={feature.id}
                    onClick={() => canAfford && setSelectedFeature(feature.id)}
                    disabled={!canAfford}
                    className={`w-full p-4 rounded-xl text-left transition-all flex items-start gap-4 ${isSelected
                        ? 'bg-purple-500/20 border-2 border-purple-500'
                        : canAfford
                          ? 'bg-white/5 border-2 border-white/10 hover:border-white/20'
                          : 'bg-white/5 border-2 border-white/5 opacity-50 cursor-not-allowed'
                      }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-purple-500' : 'bg-white/10'
                      }`}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-mono-60'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold">{feature.name}</h4>
                        <span className={`text-sm font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                          {feature.cost} VQC
                        </span>
                      </div>
                      <p className="text-sm text-mono-60">{feature.description}</p>
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
                onClick={handlePurchase}
                disabled={!selectedFeature || loading}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner w-5 h-5" />
                    Processing...
                  </>
                ) : selectedFeatureData ? (
                  <>
                    <Zap className="w-5 h-5" />
                    Purchase for {selectedFeatureData.cost} VQC
                  </>
                ) : (
                  'Select a feature'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
