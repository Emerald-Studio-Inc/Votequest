"use client"

import React, { useState, useEffect } from 'react';
import { Check, Copy, Smartphone, Shield } from 'lucide-react';

interface Props {
    onClose: () => void;
    passphrase: string;
}

export default function AdminSetup2FA({ onClose, passphrase }: Props) {
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [testCode, setTestCode] = useState('');
    const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle');
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        fetchSetup();
    }, []);

    const fetchSetup = async () => {
        try {
            const response = await fetch('/api/admin/setup-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passphrase })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate 2FA setup');
            }

            setQrCode(data.qrCode);
            setSecret(data.secret);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTestCode = async () => {
        if (testCode.length !== 6) return;

        try {
            const response = await fetch('/api/admin/verify-2fa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: testCode })
            });

            const data = await response.json();

            if (data.valid) {
                setTestResult('success');
                setTimeout(() => {
                    onClose(); // Close after successful test
                }, 2000);
            } else {
                setTestResult('error');
                setTimeout(() => setTestResult('idle'), 2000);
            }
        } catch (err) {
            setTestResult('error');
            setTimeout(() => setTestResult('idle'), 2000);
        }
    };

    const copySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
            <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Setup 2FA Authentication</h2>
                        <p className="text-sm text-mono-60">Secure admin access with time-based codes</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="loading-spinner w-12 h-12"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-400">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Step 1: Download App */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold shrink-0">1</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                                        <Smartphone className="w-5 h-5" />
                                        Download Authenticator App
                                    </h3>
                                    <p className="text-sm text-mono-70 mb-3">
                                        Install one of these apps on your phone:
                                    </p>
                                    <ul className="text-sm text-mono-60 space-y-1">
                                        <li>• Google Authenticator (iOS/Android)</li>
                                        <li>• Microsoft Authenticator (iOS/Android)</li>
                                        <li>• Authy (iOS/Android)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Scan QR Code */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold shrink-0">2</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-3">Scan QR Code</h3>
                                    <p className="text-sm text-mono-70 mb-4">
                                        Open your authenticator app and scan this QR code:
                                    </p>

                                    {/* QR Code */}
                                    <div className="bg-white p-6 rounded-2xl inline-block">
                                        <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
                                    </div>

                                    {/* Manual Entry */}
                                    <div className="mt-4 p-4 bg-black/30 rounded-xl border border-white/10">
                                        <p className="text-xs text-mono-60 mb-2">Can't scan? Enter manually:</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-sm font-mono text-white bg-black/50 px-3 py-2 rounded-lg break-all">
                                                {secret}
                                            </code>
                                            <button
                                                onClick={copySecret}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                title="Copy secret"
                                            >
                                                {copied ? (
                                                    <Check className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-mono-60" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Test Code */}
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold shrink-0">3</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-3">Test Verification</h3>
                                    <p className="text-sm text-mono-70 mb-4">
                                        Enter the 6-digit code from your authenticator app:
                                    </p>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            value={testCode}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/\D/g, '');
                                                setTestCode(value);
                                                if (value.length === 6) {
                                                    handleTestCode();
                                                }
                                            }}
                                            className={`flex-1 px-4 py-3 rounded-xl bg-black/50 border text-white text-center text-2xl font-mono tracking-widest transition-colors ${testResult === 'success' ? 'border-green-500/50 bg-green-500/10' :
                                                    testResult === 'error' ? 'border-red-500/50 bg-red-500/10' :
                                                        'border-white/10 focus:border-white/30'
                                                }`}
                                            placeholder="000000"
                                            autoFocus
                                        />
                                        {testResult === 'success' && (
                                            <Check className="w-6 h-6 text-green-400" />
                                        )}
                                    </div>

                                    {testResult === 'success' && (
                                        <p className="text-sm text-green-400 mt-3 flex items-center gap-2">
                                            <Check className="w-4 h-4" />
                                            Success! 2FA is configured. Closing...
                                        </p>
                                    )}
                                    {testResult === 'error' && (
                                        <p className="text-sm text-red-400 mt-3">
                                            Invalid code. Try again with the current code.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
                            <p className="text-sm text-yellow-200 font-semibold mb-2">⚠️ Important</p>
                            <ul className="text-sm text-yellow-200/80 space-y-1">
                                <li>• <strong>Save the secret key</strong> somewhere safe as backup</li>
                                <li>• <strong>Share this QR code</strong> with team members who need admin access</li>
                                <li>• Codes refresh <strong>every 30 seconds</strong></li>
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-mono-60 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
