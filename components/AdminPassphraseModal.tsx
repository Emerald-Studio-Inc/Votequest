"use client"

import React, { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (passphrase: string, code: string) => void;
}

export default function AdminPassphraseModal({ open, onClose, onSubmit }: Props) {
  const [passphrase, setPassphrase] = useState('');
  const [code, setCode] = useState('');
  const [codeValid, setCodeValid] = useState<boolean | null>(null);

  if (!open) return null;

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!passphrase || code.length !== 6) return;

    onSubmit(passphrase, code);
    setPassphrase('');
    setCode('');
    setCodeValid(null);
  };

  const handleCodeChange = (value: string) => {
    const digits = value.replace(/\D/g, '');
    setCode(digits);
    setCodeValid(null); // Reset validation on change

    // Auto-submit when 6 digits entered
    if (digits.length === 6 && passphrase) {
      setTimeout(() => {
        onSubmit(passphrase, digits);
        setPassphrase('');
        setCode('');
      }, 100);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <form onSubmit={submit} className="bg-gradient-to-br from-zinc-900 to-black backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm border border-white/10 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-2">Admin Access</h3>
        <p className="text-sm text-mono-60 mb-6">Enter passphrase and 2FA code to continue.</p>

        {/* Passphrase */}
        <label className="block text-sm text-mono-70 mb-2">Passphrase</label>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white mb-4 focus:border-white/30 focus:outline-none transition-colors"
          autoFocus
          placeholder="Enter admin passphrase"
        />

        {/* 2FA Code */}
        <label className="block text-sm text-mono-70 mb-2">2FA Code</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          className={`w-full px-4 py-2.5 rounded-xl bg-white/5 border text-white text-center text-xl font-mono tracking-widest mb-2 focus:outline-none transition-colors ${codeValid === true ? 'border-green-500/50 bg-green-500/10' :
              codeValid === false ? 'border-red-500/50 bg-red-500/10' :
                'border-white/10 focus:border-white/30'
            }`}
          placeholder="000000"
        />
        <p className="text-xs text-mono-60 mb-4">Enter the 6-digit code from your authenticator app</p>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-mono-60 hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!passphrase || code.length !== 6}
            className="btn btn-primary px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          >
            Unlock
          </button>
        </div>
      </form>
    </div>
  );
}
