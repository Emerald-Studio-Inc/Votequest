import React, { useState } from 'react';
import { Mail, Loader2, CheckCircle, Sparkles, Cpu, Vote } from 'lucide-react';
import { signInWithMagicLink } from '@/lib/supabase-auth';
import CyberButton from './CyberButton';

interface LoginScreenProps {
    loading?: boolean;
}

const NEON_CYAN = '#00F0FF';
const NEON_MAGENTA = '#FF003C';

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
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-void)] px-4 relative overflow-hidden">
                {/* Cyber Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

                <div className="max-w-md w-full text-center animate-fade-in relative z-10" role="status" aria-live="polite">
                    <div
                        className="w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8 animate-pulse"
                        style={{ border: `1px solid ${NEON_CYAN}`, backgroundColor: `${NEON_CYAN}10`, boxShadow: `0 0 20px ${NEON_CYAN}30` }}
                    >
                        <Mail className="w-10 h-10" style={{ color: NEON_CYAN }} />
                    </div>

                    <div className="p-8 border border-gray-800 bg-[#121215]/90 backdrop-blur-xl relative overflow-hidden">
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2" style={{ borderColor: NEON_CYAN }} />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2" style={{ borderColor: NEON_CYAN }} />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2" style={{ borderColor: NEON_CYAN }} />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2" style={{ borderColor: NEON_CYAN }} />

                        <h2 className="text-3xl font-bold text-white mb-4 uppercase tracking-wider glitch-text" data-text="CHECK EMAIL">Check Email</h2>
                        <p className="text-sm font-mono text-gray-400 mb-2">
                            MAGIC_LINK_SENT_TO
                        </p>
                        <p className="text-white font-bold text-lg mb-6 font-mono" style={{ color: NEON_CYAN }}>{email} <CheckCircle className="inline w-4 h-4 ml-2" /></p>

                        <p className="text-xs text-gray-500 font-mono mb-8 border-t border-gray-800 pt-4">
                            {'>'} ACCESS_PENDING... <br />
                            {'>'} AWAITING_CLIENT_VERIFICATION
                        </p>

                        <div className="space-y-4">
                            <a
                                href={`mailto:${email}`}
                                className="block w-full py-3 text-sm font-bold uppercase tracking-wider border transition-all hover:bg-white/5"
                                style={{ borderColor: NEON_CYAN, color: NEON_CYAN }}
                            >
                                OPEN EMAIL CLIENT
                            </a>

                            <CyberButton
                                onClick={() => { setSent(false); setEmail(''); }}
                                className="w-full mt-4"
                            >
                                [ USE_DIFFERENT_EMAIL ]
                            </CyberButton>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-void)] flex items-center justify-center px-4 relative overflow-hidden font-mono">
            {/* Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Background Orbs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px] animate-pulse" style={{ backgroundColor: `${NEON_CYAN}10` }} />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] animate-pulse" style={{ backgroundColor: `${NEON_MAGENTA}05`, animationDelay: '2s' }} />
            </div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo */}
                <div className="text-center animate-slide-down mb-12">
                    <div className="relative inline-block mb-6">
                        <div
                            className="w-20 h-20 flex items-center justify-center mx-auto relative group"
                            style={{ border: `1px solid ${NEON_CYAN}`, backgroundColor: `${NEON_CYAN}05` }}
                        >
                            <div className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity duration-300" style={{ boxShadow: `0 0 30px ${NEON_CYAN}40` }} />
                            <Vote className="w-10 h-10 relative z-10" style={{ color: NEON_CYAN }} strokeWidth={1.5} />

                            {/* Decorative corners */}
                            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l" style={{ borderColor: NEON_CYAN }} />
                            <div className="absolute -top-1 -right-1 w-2 h-2 border-t border-r" style={{ borderColor: NEON_CYAN }} />
                            <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b border-l" style={{ borderColor: NEON_CYAN }} />
                            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r" style={{ borderColor: NEON_CYAN }} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2 uppercase tracking-widest glitch-text" data-text="VoteQuest">VoteQuest</h1>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
                        <Cpu className="w-3 h-3" />
                        <span>System.Online</span>
                    </div>
                </div>

                {/* Login Form Container */}
                <div className="p-8 bg-[#121215]/90 backdrop-blur-xl border border-gray-800 relative group animate-slide-up">
                    {/* Glowing border effect on hover */}
                    <div className="absolute inset-0 border border-transparent group-hover:border-white/10 transition-colors duration-500 pointer-events-none" />

                    {/* Tech corners */}
                    <div className="absolute top-0 left-0 w-2 h-2 bg-white/20" />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-white/20" />
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/20" />
                    <div className="absolute bottom-0 right-0 w-2 h-2 bg-white/20" />

                    <form onSubmit={handleLogin} className="space-y-8">
                        <div>
                            <label htmlFor="email" className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
                                // Enter Identity Protocol
                            </label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300" style={{ color: email ? NEON_CYAN : '#6B7280' }} />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="OPERATOR@DOMAIN.COM"
                                    className="w-full pl-12 pr-4 py-4 bg-[#18181b] border transition-all duration-300 font-mono text-sm placeholder-gray-700 focus:outline-none"
                                    style={{
                                        color: NEON_CYAN,
                                        borderColor: email ? NEON_CYAN : '#374151',
                                        boxShadow: email ? `0 0 15px ${NEON_CYAN}20` : 'none'
                                    }}
                                    required
                                    disabled={loading}
                                    autoFocus
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border border-red-500/50 p-4 animate-shake">
                                <p className="text-red-400 text-xs font-mono uppercase">! ERROR: {error}</p>
                            </div>
                        )}

                        <CyberButton
                            type="submit"
                            disabled={loading || externalLoading}
                            className="w-full"
                        >
                            {loading || externalLoading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    AUTHENTICATING...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    INITIATE_SESSION <Sparkles className="w-4 h-4" />
                                </span>
                            )}
                        </CyberButton>

                        {/* Footer Info */}
                        <div className="mt-8 pt-6 border-t border-gray-900 text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-mono">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                <span>NO_PASSWORD_REQUIRED</span>
                            </div>
                            <p className="text-[10px] text-gray-600 font-mono uppercase">
                                SECURE_CHANNEL_ENCRYPTED [SHA-256]
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;
