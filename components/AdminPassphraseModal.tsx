"use client"

import React, { useState } from 'react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form onSubmit={handleSubmit} className="bg-white/6 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-2">
          {step === 'passphrase' ? 'Admin Access' : 'Two-Factor Authentication'}
        </h3>

        <p className="text-sm text-mono-60 mb-4">
          {step === 'passphrase' ? 'Enter the admin passphrase to continue.' : 'Enter the code from your authenticator app.'}
        </p>

        {step === 'passphrase' ? (
          <div className="mb-4">
            <label className="block text-sm text-mono-70 mb-2">Passphrase</label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="block text-sm text-mono-70 mb-2">2FA Code</label>
            <div className="flex justify-center">
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-3 py-2 text-center text-2xl tracking-widest rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
                autoFocus
                placeholder="000 000"
              />
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-400 mb-4 bg-red-500/10 p-2 rounded-lg text-center">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-mono-60 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || (step === 'passphrase' ? !passphrase : code.length !== 6)}
            className="btn btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : (step === 'passphrase' ? 'Next' : 'Unlock')}
          </button>
        </div>
      </form>
    </div>
  );
}
