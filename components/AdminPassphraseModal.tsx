"use client"

import React, { useState } from 'react';
import CyberCard from './CyberCard';
import ArcadeButton from './ArcadeButton';
import { Lock, Shield, X } from 'lucide-react';

// Neon colors
const NEON_MAGENTA = '#FF003C';
const NEON_CYAN = '#00F0FF';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (passphrase: string) => void;
}

export default function AdminPassphraseModal({ open, onClose, onSuccess }: Props) {
  const [step, setStep] = useState<'passphrase' | '2fa'>('passphrase');
  const [passphrase, setPassphrase] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 'passphrase') {
        const res = await fetch('/api/admin/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passphrase }),
        });
        const json = await res.json();

        if (json?.ok) {
          setStep('2fa');
        } else {
          setError(json?.error || 'Invalid passphrase');
        }
      } else {
        // Verify 2FA
        const res = await fetch('/api/admin/verify-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        });
        const json = await res.json();

        if (json?.valid) {
          onSuccess(passphrase);
        } else {
          setError('Invalid 2FA code');
        }
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-fade-in">
      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[url('/scanlines.png')] opacity-10"></div>

      <div className="relative z-10 w-full max-w-md p-4">
        <CyberCard title={step === 'passphrase' ? 'ADMIN_ACCESS_PROTOCOL' : 'SECURITY_VERIFICATION'} className="shadow-[0_0_50px_-12px_#FF003C]" cornerStyle="tech">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-2 flex items-center justify-center bg-black/50 overflow-hidden relative group"
                style={{ borderColor: NEON_MAGENTA }}>
                <div className="absolute inset-0 bg-red-500/10 animate-pulse"></div>
                {step === 'passphrase' ? (
                  <Lock className="w-8 h-8 relative z-10" style={{ color: NEON_MAGENTA }} />
                ) : (
                  <Shield className="w-8 h-8 relative z-10" style={{ color: NEON_MAGENTA }} />
                )}

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l" style={{ borderColor: NEON_MAGENTA }} />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r" style={{ borderColor: NEON_MAGENTA }} />
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-sm font-mono uppercase tracking-widest mb-1" style={{ color: NEON_MAGENTA }}>
                {'>'} RESTRICTED_AREA
              </p>
              <p className="text-xs text-gray-400 font-mono">
                {step === 'passphrase' ? 'ENTER_SECURITY_CREDENTIALS' : 'AWAITING_2FA_TOKEN'}
              </p>
            </div>

            {step === 'passphrase' ? (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Passphrase</label>
                <div className="relative group">
                  <input
                    type="password"
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    className="w-full bg-black/50 border px-4 py-3 text-white font-mono focus:outline-none transition-all placeholder:text-gray-700"
                    style={{
                      borderColor: `${NEON_MAGENTA}50`,
                      boxShadow: `0 0 10px ${NEON_MAGENTA}20`
                    }}
                    autoFocus
                    placeholder="Enter passphrase..."
                  />
                  {/* Focus effect handled via CSS or state, but here simple inline style for border is enough */}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">2FA Code</label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-black/50 border px-4 py-3 text-center text-2xl tracking-[0.5em] text-white font-mono focus:outline-none transition-all placeholder:text-gray-700"
                    style={{
                      borderColor: `${NEON_MAGENTA}50`,
                      boxShadow: `0 0 10px ${NEON_MAGENTA}20`,
                      color: NEON_MAGENTA
                    }}
                    autoFocus
                    placeholder="000000"
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 border bg-red-900/10 text-red-400 text-xs font-mono uppercase"
                style={{ borderColor: `${NEON_MAGENTA}50` }}>
                <X className="w-4 h-4" />
                <span>{'>'} ERROR: {error}</span>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <ArcadeButton
                type="button"
                onClick={onClose}
                variant="magenta"
                className="flex-1 opacity-50 hover:opacity-100"
              >
                ABORT
              </ArcadeButton>
              <ArcadeButton
                type="submit"
                disabled={loading || (step === 'passphrase' ? !passphrase : code.length !== 6)}
                variant="magenta"
                className="flex-[2]"
                glow
              >
                {loading ? 'VERIFYING...' : (step === 'passphrase' ? 'AUTHENTICATE' : 'UNLOCK_SYSTEM')}
              </ArcadeButton>
            </div>
          </form>
        </CyberCard>
      </div>
    </div>
  );
}
