import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { signInWithMagicLink } from '@/lib/supabase-auth';

interface LoginScreenProps {
    loading?: boolean;
}

const LoginScreen = ({ loading: externalLoading }: LoginScreenProps = {}) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [lastSentAt, setLastSentAt] = useState<number | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');

        const { error: authError } = await signInWithMagicLink(email);

        if (authError) {
            setError(authError.message);
            setLoading(false);
        } else {
            setSent(true);
            setLastSentAt(Date.now());
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black px-4">
                <div className="max-w-md w-full space-y-8 text-center animate-fade-in" role="status" aria-live="polite">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
                        <Mail className="w-10 h-10 text-white" />
                    </div>

                    <div>
                        <h2 className="text-4xl font-bold text-white mb-4">Check your email</h2>
                        <p className="text-lg text-mono-60 mb-2">
                            We sent a magic link to
                        </p>
                        <p className="text-white font-medium text-lg mb-4">{email}</p>
                        <p className="text-sm text-mono-50">
                            Click the link to sign in. You can close this window.
                        </p>
                    </div>

                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => { setSent(false); setEmail(''); }}
                            className="text-mono-60 hover:text-white text-sm transition-colors"
                            aria-label="Use a different email"
                        >
                            Use a different email
                        </button>

                        <a href={`mailto:${email}`} className="text-sm text-mono-60 hover:text-white underline">Open email app</a>

                        {/* Resend cooldown */}
                        <div>
                            {lastSentAt && Date.now() - lastSentAt < 30000 ? (
                                <button disabled className="text-sm text-mono-50">Resend ({Math.ceil((30000 - (Date.now() - lastSentAt))/1000)}s)</button>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    className="text-sm text-white underline"
                                >
                                    Resend link
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-md w-full space-y-8 relative z-10">
                {/* Logo */}
                <div className="text-center animate-slide-down">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
                        <div className="relative w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto">
                            <Sparkles className="w-10 h-10 text-black" strokeWidth={2.5} />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-2">VoteQuest</h1>
                    <p className="text-mono-60">Proof-of-work democratic participation</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="space-y-6 animate-slide-up">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-mono-70 mb-2">
                            Email address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mono-50" />
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-mono-50 focus:outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all"
                                required
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 animate-shake">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !email}
                        className="w-full btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Sending magic link...
                            </>
                        ) : (
                            <>
                                Continue with email
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                {/* Info */}
                <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="flex items-center justify-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-mono-60">No password needed</span>
                    </div>
                    <p className="text-mono-50 text-sm">
                        We'll send you a secure link to sign in.
                        <br />
                        Every action earns cryptographic proof-of-work receipts.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
