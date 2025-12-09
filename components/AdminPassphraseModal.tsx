"use client"

import React, { useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPassphraseModal({ open, onClose, onSuccess }: Props) {
  const [passphrase, setPassphrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase }),
      });
      const json = await res.json();
      if (res.ok && json?.ok) {
        onSuccess();
      } else {
        setError(json?.error || 'Invalid passphrase');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form onSubmit={submit} className="bg-white/6 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-white mb-2">Admin Access</h3>
        <p className="text-sm text-mono-60 mb-4">Enter the admin passphrase to continue.</p>

        <label className="block text-sm text-mono-70 mb-2">Passphrase</label>
        <input
          type="password"
          value={passphrase}
          onChange={(e) => setPassphrase(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white mb-3"
          autoFocus
        />

        {error && <p className="text-sm text-red-400 mb-2">{error}</p>}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded-xl text-mono-60 hover:text-white">Cancel</button>
          <button type="submit" disabled={loading || !passphrase} className="btn btn-primary px-4 py-2 disabled:opacity-60">
            {loading ? 'Checking...' : 'Unlock'}
          </button>
        </div>
      </form>
    </div>
  );
}
