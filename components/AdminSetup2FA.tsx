"use client"

import React, { useState, useEffect } from 'react';
import { Check, Copy, Smartphone, Shield, X, AlertTriangle } from 'lucide-react';
import CyberCard from './CyberCard';
import CyberButton from './CyberButton';
import LoadingSpinner from './LoadingSpinner';

// Neon constants
const NEON_GREEN = '#39FF14';  // Cyber Green
const NEON_MAGENTA = '#FF003C';
const NEON_CYAN = '#00F0FF';

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-fade-in">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-50" />

            <div className="w-full max-w-2xl relative z-10">
                <CyberCard title="SECURITY_PROTOCOL_INIT" className="shadow-[0_0_50px_-15px_#39FF14] border-t border-t-[#39FF14]">
                    <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                        {/* Header */}
                        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                            <div className="w-16 h-16 relative flex items-center justify-center border-2 border-[#39FF14] bg-[#39FF14]/5 group">
                                <div className="absolute inset-0 bg-[#39FF14]/10 animate-pulse"></div>
                                <Shield className="w-8 h-8 text-[#39FF14] relative z-10" />
                                {/* Tech corners */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#39FF14]" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#39FF14]" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white uppercase tracking-wider glitch-text" data-text="2FA_ACTIVATION">2FA_ACTIVATION</h2>
                                <p className="text-xs text-[#39FF14] font-mono mt-1">
                                    {'>'} SECURE_ADMIN_CHANNEL_SETUP
                                </p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <LoadingSpinner size="large" />
                            </div>
                        ) : error ? (
                            <div className="bg-red-900/10 border border-red-500/50 p-6 flex gap-4 items-start">
                                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                                <div>
                                    <h3 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-1">CRITICAL_ERROR</h3>
                                    <p className="text-red-400 text-sm font-mono">{error}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Step 1: Download App */}
                                <div className="bg-white/5 border border-white/10 p-5 relative group hover:bg-white/10 transition-colors">
                                    <div className="absolute top-0 left-0 bg-white/10 text-[10px] font-bold px-2 py-1 text-gray-500 font-mono">STEP_01</div>
                                    <div className="flex items-start gap-4 mt-4">
                                        <Smartphone className="w-6 h-6 text-gray-400 mt-1" />
                                        <div>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">AUTHENTICATOR_APP</h3>
                                            <p className="text-xs text-gray-500 font-mono mb-2">
                                                INSTALL_COMPATIBLE_SOFTWARE:
                                            </p>
                                            <div className="flex flex-wrap gap-2 text-[10px] font-mono text-gray-400">
                                                <span className="px-2 py-1 bg-black border border-white/10">GOOGLE_AUTH</span>
                                                <span className="px-2 py-1 bg-black border border-white/10">MICROSOFT_AUTH</span>
                                                <span className="px-2 py-1 bg-black border border-white/10">AUTHY</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 2: Scan QR Code */}
                                <div className="bg-white/5 border border-white/10 p-5 relative group hover:bg-white/10 transition-colors">
                                    <div className="absolute top-0 left-0 bg-white/10 text-[10px] font-bold px-2 py-1 text-gray-500 font-mono">STEP_02</div>
                                    <div className="flex flex-col md:flex-row gap-6 mt-4">
                                        <div className="bg-white p-4 inline-block self-start md:self-center">
                                            <img src={qrCode} alt="2FA QR Code" className="w-32 h-32 md:w-40 md:h-40 image-rendering-pixelated" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-2">SCAN_MATRIX_CODE</h3>
                                            <p className="text-xs text-gray-500 font-mono mb-4">
                                                If scanning fails, manual entry override is available:
                                            </p>

                                            <div className="p-3 bg-black border border-dashed border-gray-700 hover:border-white/30 transition-colors">
                                                <p className="text-[9px] text-gray-500 uppercase mb-2">SECRET_KEY_OVERRIDE</p>
                                                <div className="flex items-center gap-2">
                                                    <code className="flex-1 text-xs font-mono text-[#39FF14] break-all">
                                                        {secret}
                                                    </code>
                                                    <button
                                                        onClick={copySecret}
                                                        className="p-2 hover:bg-white/10 transition-colors"
                                                        title="COPY_KEY"
                                                    >
                                                        {copied ? (
                                                            <Check className="w-4 h-4 text-green-400" />
                                                        ) : (
                                                            <Copy className="w-4 h-4 text-gray-500" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Step 3: Test Code */}
                                <div className="bg-white/5 border border-white/10 p-5 relative">
                                    <div className="absolute top-0 left-0 bg-white/10 text-[10px] font-bold px-2 py-1 text-gray-500 font-mono">STEP_03</div>
                                    <div className="mt-4">
                                        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-3">VERIFY_LINKAGE</h3>
                                        <div className="flex items-center gap-4">
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
                                                className={`
                                                    flex-1 px-4 py-3 bg-black border-2 text-white text-center text-xl font-mono tracking-[0.5em] transition-all
                                                    focus:outline-none focus:border-[#39FF14] focus:shadow-[0_0_20px_rgba(57,255,20,0.3)]
                                                    ${testResult === 'success' ? 'border-[#39FF14] text-[#39FF14]' :
                                                        testResult === 'error' ? 'border-red-500 text-red-500' : 'border-gray-800'}
                                                `}
                                                placeholder="000000"
                                                autoFocus
                                            />
                                            {testResult === 'success' && <Check className="w-6 h-6 text-[#39FF14] animate-bounce" />}
                                            {testResult === 'error' && <X className="w-6 h-6 text-red-500 animate-pulse" />}
                                        </div>
                                        {testResult === 'success' && (
                                            <p className="text-xs text-[#39FF14] mt-2 font-mono uppercase blink">
                                                {'>'} LINKAGE_ESTABLISHED. CLOSING_PORTAL...
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Important Notes */}
                                <div className="border border-yellow-500/20 bg-yellow-500/5 p-4 flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                                    <div>
                                        <p className="text-xs text-yellow-500 font-bold uppercase tracking-widest mb-1">WARNING: SECURITY_IMPLICATION</p>
                                        <ul className="text-[10px] text-yellow-200/70 font-mono space-y-1 list-disc list-inside">
                                            <li>BACKUP_SECRET_KEY_OFFLINE</li>
                                            <li>SHARE_ONLY_WITH_AUTHORIZED_PERSONNEL</li>
                                            <li>TOKENS_ROTATE_EVERY_30_SECONDS</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end pt-4 border-t border-white/5">
                                    <CyberButton
                                        onClick={onClose}
                                        className="min-w-[120px]"
                                    >
                                        ABORT_SETUP
                                    </CyberButton>
                                </div>
                            </div>
                        )}
                    </div>
                </CyberCard>
            </div>
        </div>
    );
}
