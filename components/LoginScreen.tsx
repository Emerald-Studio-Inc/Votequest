import React, { useState } from 'react';
import { Mail, ArrowRight, Loader2, CheckCircle, Sparkles } from 'lucide-react';
import { signInWithMagicLink } from '@/lib/supabase-auth';
import VoteCaptcha from './VoteCaptcha';

interface LoginScreenProps {
    loading?: boolean;
}

const LoginScreen = ({ loading: externalLoading }: LoginScreenProps = {}) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const [captchaToken, setCaptchaToken] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !captchaToken) return;

        setLoading(true);
        setError('');

        const { error: authError } = await signInWithMagicLink(email);

        if (authError) {
            setError(authError.message);
            setLoading(false);
            setCaptchaToken(''); // Reset captcha on error
        } else {
            setSent(true);
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black px-4">
                <div className="max-w-md w-full space-y-8 text-center animate-fade-in">
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

                    <button
                        onClick={() => { setSent(false); setEmail(''); }}
                        className="text-mono-60 hover:text-white text-sm transition-colors"
                    >
                        Use a different email
                    </button>
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
