import { useState } from 'react';
import { User, Mail, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { createUserProfile, checkUsernameAvailable } from '@/lib/supabase-auth';
import CyberButton from './CyberButton';

interface RegistrationScreenProps {
    authUser: any; // Supabase auth user
    onComplete: () => void;
}

export default function RegistrationScreen({ authUser, onComplete }: RegistrationScreenProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form data
    const [username, setUsername] = useState('');
    const [ageVerified, setAgeVerified] = useState(false);
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [location, setLocation] = useState('');

    const handleUsernameCheck = async () => {
        if (username.length < 3) {
            setError('Username must be at least 3 characters');
            return;
        }

        setLoading(true);
        const available = await checkUsernameAvailable(username);

        if (!available) {
            setError('Username already taken');
            setLoading(false);
        } else {
            setError('');
            setStep(2);
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        setLoading(true);

        const profile = await createUserProfile(
            authUser.id,
            authUser.email,
            username,
            ageVerified
        );

        if (profile) {
            // Update optional fields if provided
            if (fullName || bio || location) {
                const { updateUserProfile } = await import('@/lib/supabase-auth');
                await updateUserProfile(profile.id, { full_name: fullName, bio, location });
            }
            onComplete();
        } else {
            setError('Failed to create profile');
            setLoading(false);
        }
    };

    // Step 1: Username + Age Verification
    if (step === 1) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black px-4">
                <div className="max-w-md w-full space-y-6 animate-slide-up">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Create your profile</h2>
                        <p className="text-mono-60">Choose a unique username</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-mono-70 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-mono-50" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                    placeholder="yourname"
                                    className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-mono-50 focus:outline-none focus:border-white/30 transition-colors"
                                    maxLength={20}
                                    autoFocus
                                />
                            </div>
                            <p className="text-xs text-mono-50 mt-2">Lowercase letters, numbers, and underscores only</p>
                        </div>

                        <label className="flex items-start gap-3 p-4 rounded-xl border border-white/10 hover:border-white/20 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                checked={ageVerified}
                                onChange={(e) => setAgeVerified(e.target.checked)}
                                className="mt-1"
                            />
                            <span className="text-sm text-mono-70">
                                I confirm that I am 18 years or older
                            </span>
                        </label>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                                <p className="text-red-400 text-sm">{error}</p>
                            </div>
                        )}

                        <CyberButton
                            onClick={handleUsernameCheck}
                            disabled={!username || !ageVerified || loading}
                            className="w-full justify-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2 inline-block" /> : <>CONTINUE</>}
                        </CyberButton>
                    </div>
                </div>
            </div>
        );
    }

    // Step 2: Optional Profile Details
    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="max-w-md w-full space-y-6 animate-slide-up">
                <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h2 className="text-3xl font-bold text-white mb-2">@{username}</h2>
                    <p className="text-mono-60">Add some details (optional)</p>
                </div>

                <div className="space-y-4">
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full name (optional)"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-mono-50 focus:outline-none focus:border-white/30"
                    />

                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Bio (optional)"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-mono-50 focus:outline-none focus:border-white/30 resize-none"
                        rows={3}
                        maxLength={500}
                    />

                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Location (optional)"
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-mono-50 focus:outline-none focus:border-white/30"
                    />

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3">
                        <CyberButton
                            onClick={() => handleComplete()}
                            className="flex-1 justify-center opacity-60"
                            disabled={loading}
                        >
                            SKIP
                        </CyberButton>
                        <CyberButton
                            onClick={handleComplete}
                            disabled={loading}
                            className="flex-1 justify-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2 inline-block" /> : <>COMPLETE</>}
                        </CyberButton>
                    </div>
                </div>
            </div>
        </div>
    );
}
