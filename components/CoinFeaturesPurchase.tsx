'use client';

import React, { useState } from 'react';
import { X, Zap, Star, TrendingUp, Crown, Check } from 'lucide-react';

interface CoinFeaturesPurchaseProps {
  roomId: string;
  userCoins: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ROOM_BOOSTS = [
  {
    id: 'highlight',
    name: 'Room Highlight',
    description: 'Pin this room at the top of listings for 24 hours',
    cost: 50,
    icon: Star,
    duration: '24 hours'
  },
  {
    id: 'priority',
    name: 'Priority Results',
    description: 'Show results faster with priority processing',
    cost: 100,
    icon: TrendingUp,
    duration: '7 days'
  },
  {
    id: 'featured',
    name: 'Featured Room',
    description: 'Get featured on the homepage with premium styling',
    cost: 200,
    icon: Crown,
    duration: '7 days'
  }
];

export default function CoinFeaturesPurchase({
  roomId,
  userCoins,
  isOpen,
  onClose,
  onSuccess
}: CoinFeaturesPurchaseProps) {
  const [selectedBoost, setSelectedBoost] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePurchase = async () => {
    if (!selectedBoost) return;

    const boost = ROOM_BOOSTS.find(b => b.id === selectedBoost);
    if (!boost) return;

    if (userCoins < boost.cost) {
      setError(`Not enough coins. You need ${boost.cost} VQC but have ${userCoins}.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/rooms/${roomId}/purchase-feature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureId: boost.id,
          cost: boost.cost
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
        setSelectedBoost(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedBoostData = ROOM_BOOSTS.find(b => b.id === selectedBoost);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-black/90 border border-white/10 rounded-3xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
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
            <h3 className="text-xl font-bold mb-2">Boost Activated!</h3>
            <p className="text-mono-60">Your room has been upgraded</p>
          </div>
        ) : (
          <>
            {/* Boost Options */}
            <div className="p-6 space-y-3">
              {ROOM_BOOSTS.map((boost) => {
                const Icon = boost.icon;
                const canAfford = userCoins >= boost.cost;
                const isSelected = selectedBoost === boost.id;

                return (
                  <button
                    key={boost.id}
                    onClick={() => canAfford && setSelectedBoost(boost.id)}
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
                        <h4 className="font-bold">{boost.name}</h4>
                        <span className={`text-sm font-bold ${canAfford ? 'text-yellow-400' : 'text-red-400'}`}>
                          {boost.cost} VQC
                        </span>
                      </div>
                      <p className="text-sm text-mono-60">{boost.description}</p>
                      <p className="text-xs text-mono-50 mt-1">Duration: {boost.duration}</p>
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
                disabled={!selectedBoost || loading}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner w-5 h-5" />
                    Processing...
                  </>
                ) : selectedBoostData ? (
                  <>
                    <Zap className="w-5 h-5" />
                    Activate for {selectedBoostData.cost} VQC
                  </>
                ) : (
                  'Select a boost'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
