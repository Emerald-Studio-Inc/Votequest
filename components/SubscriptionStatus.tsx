'use client';

import React from 'react';
import { Crown, Check, ArrowUp, Clock } from 'lucide-react';

interface SubscriptionStatusProps {
  organizationId: string;
  tier: 'free' | 'basic' | 'pro' | 'enterprise';
  roomLimit: number;
  voterLimit: number;
  roomsUsed?: number;
  expiresAt?: string;
  onUpgrade: () => void;
}

const TIER_COLORS = {
  free: 'from-gray-500 to-gray-600',
  basic: 'from-blue-500 to-blue-600',
  pro: 'from-purple-500 to-pink-600',
  enterprise: 'from-yellow-500 to-orange-600'
};

const TIER_ICONS = {
  free: '🆓',
  basic: '⭐',
  pro: '👑',
  enterprise: '🏆'
};

export default function SubscriptionStatus({
  organizationId,
  tier,
  roomLimit,
  voterLimit,
  roomsUsed = 0,
  expiresAt,
  onUpgrade
}: SubscriptionStatusProps) {
  const tierColor = TIER_COLORS[tier] || TIER_COLORS.free;
  const tierIcon = TIER_ICONS[tier] || TIER_ICONS.free;
  const canUpgrade = tier !== 'enterprise';

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="card-elevated p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tierColor} opacity-10`} />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tierColor} flex items-center justify-center text-2xl`}>
              {tierIcon}
            </div>
            <div>
              <h3 className="text-lg font-bold capitalize">{tier} Plan</h3>
              {expiresAt && tier !== 'free' && (
                <p className="text-sm text-mono-60 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Renews {formatDate(expiresAt)}
                </p>
              )}
            </div>
          </div>

          {canUpgrade && (
            <button
              onClick={onUpgrade}
              className={`btn btn-sm bg-gradient-to-r ${tierColor} text-white border-none flex items-center gap-2`}
            >
              <ArrowUp className="w-4 h-4" />
              Upgrade
            </button>
          )}
        </div>

        {/* Limits */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-mono-60 uppercase mb-1">Voting Rooms</p>
            <p className="text-xl font-bold">
              <span className="text-mono-95">{roomsUsed}</span>
              <span className="text-mono-50"> / {roomLimit}</span>
            </p>
            <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${tierColor} rounded-full transition-all`}
                style={{ width: `${Math.min((roomsUsed / roomLimit) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-mono-60 uppercase mb-1">Voters per Room</p>
            <p className="text-xl font-bold text-mono-95">{voterLimit.toLocaleString()}</p>
            <p className="text-xs text-mono-50 mt-1">Maximum allowed</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-xs text-mono-60 uppercase mb-2">Included Features</p>
          <div className="flex flex-wrap gap-2">
            {tier !== 'free' && (
              <>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                  <Check className="w-3 h-3" /> Email Verification
                </span>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                  <Check className="w-3 h-3" /> Custom Branding
                </span>
              </>
            )}
            {(tier === 'pro' || tier === 'enterprise') && (
              <>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                  <Check className="w-3 h-3" /> ID Verification
                </span>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                  <Check className="w-3 h-3" /> Analytics
                </span>
              </>
            )}
            {tier === 'enterprise' && (
              <>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                  <Check className="w-3 h-3" /> Biometric KYC
                </span>
                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs flex items-center gap-1">
                  <Check className="w-3 h-3" /> API Access
                </span>
              </>
            )}
            {tier === 'free' && (
              <span className="px-2 py-1 rounded-full bg-white/10 text-mono-60 text-xs">
                Basic features only
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
