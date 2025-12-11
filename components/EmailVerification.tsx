import { useState } from 'react';
import { Mail, Check, Loader, User } from 'lucide-react';

interface EmailVerificationProps {
    roomId: string;
    verificationTier: 'tier1' | 'tier2' | 'tier3';
    onVerified: (email: string, code: string, identifier?: string) => void;
}

export default function EmailVerification({
    roomId,
    verificationTier,
    onVerified
}: EmailVerificationProps) {
    const [step, setStep] = useState<'email' | 'code' | 'id' | 'upload'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // ...

    const handleSendCode = async () => {
        if (!email) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/rooms/${roomId}/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send code');
            }

            // Show test code in development
            if (data.testCode) {
                console.log('🔐 TEST CODE:', data.testCode);
            }

            setStep('code');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyID = async () => {
        if (!identifier) return;

        setLoading(true);
        setError('');

        try {
            // Verify ID against eligibility list
            const response = await fetch(`/api/rooms/${roomId}/verify-id`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, identifier })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'ID verification failed');
            }

            // Complete verification
            onVerified(email, code, identifier);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!code) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/rooms/${roomId}/verify-code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Invalid code');
            }

            // Tier 2 requires ID verification
            if (verificationTier === 'tier2') {
                setStep('id');
            } else if (verificationTier === 'tier3') {
                setStep('upload');
            } else {
                // Tier 1 complete
                onVerified(email, code);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // ...

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('email', email);
        formData.append('govId', file);

        try {
            const response = await fetch(`/api/rooms/${roomId}/upload-verification`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            // Verification submitted but pending
            // For now, let's just allow them to vote (in a real app, we'd wait for admin approval)
            // Or maybe display a 'Pending Approval' screen?
            // The plan said "vote", implying immediate vote or queue.
            // The API returns success.
            // Let's assume for this MVP, uploading is enough to Proceed, OR we tell them "Under Review".
            // But `page.tsx` expects `onVerified` to start voting.
            // If I call `onVerified`, they can vote.
            // Let's call `onVerified` so they can vote (optimistic) or tell them their vote is provisional?
            // For simplicity/MVP: User uploads ID -> Proceeds to vote. Admin can review later.

            onVerified(email, code, 'pending-review');

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="card-gold p-8 gold-glow">
                {/* Email Step */}
                {step === 'email' && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 gold-glow">
                                <Mail className="w-8 h-8 gold-text" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Enter Your Email</h3>
                            <p className="text-sm text-mono-60">
                                We'll send you a verification code
                            </p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSendCode()}
                                placeholder="your@email.com"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30"
                                autoFocus
                            />

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleSendCode}
                                disabled={!email || loading}
                                className="btn-gold w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Code'
                                )}
                            </button>
                        </div>
                    </>
                )}

                {/* Code Verification Step */}
                {step === 'code' && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 gold-glow">
                                <Check className="w-8 h-8 gold-text" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Enter Verification Code</h3>
                            <p className="text-sm text-mono-60">
                                Code sent to {email}
                            </p>
                            <button
                                onClick={() => setStep('email')}
                                className="text-sm text-mono-50 hover:text-white underline mt-2"
                            >
                                Change email
                            </button>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                onKeyPress={(e) => e.key === 'Enter' && handleVerifyCode()}
                                placeholder="000000"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-center text-2xl tracking-widest focus:outline-none focus:border-white/30"
                                maxLength={6}
                                autoFocus
                            />

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleVerifyCode}
                                disabled={code.length !== 6 || loading}
                                className="btn-gold w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify Code'
                                )}
                            </button>
                        </div>
                    </>
                )}

                {/* ID Verification Step (Tier 2) */}
                {step === 'id' && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 gold-glow">
                                <User className="w-8 h-8 gold-text" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Verify Your ID</h3>
                            <p className="text-sm text-mono-60">
                                Enter your student or employee ID
                            </p>
                        </div>

                        <div className="space-y-4">
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleVerifyID()}
                                placeholder="Student/Employee ID"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30"
                                autoFocus
                            />

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleVerifyID}
                                disabled={!identifier || loading}
                                className="btn-gold w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Verifying ID...
                                    </>
                                ) : (
                                    'Verify ID'
                                )}
                            </button>
                        </div>
                    </>
                )}

                {/* Upload Verification Step (Tier 3) */}
                {step === 'upload' && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 gold-glow">
                                <User className="w-8 h-8 gold-text" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Upload Government ID</h3>
                            <p className="text-sm text-mono-60">
                                Please upload a clear photo of your ID for manual verification.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="border border-dashed border-white/20 rounded-xl p-8 text-center bg-white/5 hover:bg-white/10 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="hidden"
                                    id="gov-id-upload"
                                />
                                <label htmlFor="gov-id-upload" className="cursor-pointer block">
                                    {file ? (
                                        <div className="flex items-center justify-center gap-2 text-green-400">
                                            <Check className="w-5 h-5" />
                                            <span className="font-medium truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                                                <User className="w-6 h-6 text-mono-50" />
                                            </div>
                                            <p className="text-sm font-medium text-white mb-1">Click to upload ID</p>
                                            <p className="text-xs text-mono-60">JPG, PNG up to 5MB</p>
                                        </>
                                    )}
                                </label>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={handleUpload}
                                disabled={!file || loading}
                                className="btn-gold w-full"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    'Submit Verification'
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
