'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Vote, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';
import EmailVerification from '@/components/EmailVerification';
import VotingInterface from '@/components/VotingInterface';
import VoteSuccessScreen from '@/components/VoteSuccessScreen';

type VotingState = 'loading' | 'intro' | 'verify-email' | 'voting' | 'success' | 'error';

export default function VoteRoomPage() {
    const params = useParams();
    const roomId = params?.roomId as string;

    const [state, setState] = useState<VotingState>('loading');
    const [room, setRoom] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [verifiedEmail, setVerifiedEmail] = useState<string>('');
    const [votedOptions, setVotedOptions] = useState<string[]>([]);

    useEffect(() => {
        if (roomId) {
            loadRoom();
        }
    }, [roomId]);

    const loadRoom = async () => {
        try {
            setState('loading');
            const response = await fetch(`/api/rooms?roomId=${roomId}`);

            if (!response.ok) {
                throw new Error('Room not found');
            }

            const data = await response.json();
            setRoom(data.room);

            if (data.room.status !== 'active') {
                setError('This voting room is not currently active');
                setState('error');
            } else {
                setState('intro');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load room');
            setState('error');
        }
    };

    const handleEmailVerified = (email: string, code: string) => {
        setVerifiedEmail(email);
        setState('voting');
    };

    const handleVoteSubmit = async (optionIds: string[]) => {
        try {
            const response = await fetch(`/api/rooms/${roomId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: verifiedEmail,
                    optionIds
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit vote');
            }

            setVotedOptions(optionIds);
            setState('success');
        } catch (err: any) {
            alert(err.message);
            throw err;
        }
    };

    // Loading state
    if (state === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="loading-spinner w-12 h-12 mx-auto mb-4 gold-glow" />
                    <p className="text-mono-60">Loading voting room...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (state === 'error' || !room) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black px-6">
                <div className="text-center max-w-md">
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-heading mb-2">Room Unavailable</h1>
                    <p className="text-mono-60 mb-6">{error || 'This room could not be found'}</p>
                </div>
            </div>
        );
    }

    // Success state
    if (state === 'success') {
        return <VoteSuccessScreen room={room} votedOptions={votedOptions} />;
    }

    // Main voting flow
    return (
        <div className="min-h-screen bg-black">
            {/* Gold flowing border at top */}
            <div className="absolute top-0 left-0 right-0 h-1 gold-border-animated"></div>

            <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
                {/* Header - Show on intro and verification */}
                {(state === 'intro' || state === 'verify-email') && (
                    <>
                        {/* Institutional Badge */}
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center gold-glow">
                                <Vote className="w-6 h-6 text-white" />
                            </div>
                            <div className="badge badge-primary gold-border-animated">
                                <Shield className="w-3 h-3" />
                                Institutional Voting
                            </div>
                        </div>

                        {/* Room Title */}
                        <h1 className="text-display text-center mb-4 gold-text">
                            {room.title}
                        </h1>

                        {room.description && (
                            <p className="text-body-large text-center text-mono-70 max-w-2xl mx-auto mb-8">
                                {room.description}
                            </p>
                        )}

                        {/* Verification Tier Info */}
                        <div className="card-gold p-6 mb-8 gold-glow">
                            <div className="flex items-center gap-4">
                                <Shield className="w-8 h-8 gold-text" />
                                <div>
                                    <p className="font-medium mb-1">
                                        {room.verification_tier === 'tier1' && 'Email Verification Required'}
                                        {room.verification_tier === 'tier2' && 'Email + ID Verification Required'}
                                        {room.verification_tier === 'tier3' && 'Email + Government ID Required'}
                                    </p>
                                    <p className="text-sm text-mono-60">
                                        {room.verification_tier === 'tier1' && 'Verify your email address to vote'}
                                        {room.verification_tier === 'tier2' && 'Verify your email and student/employee ID'}
                                        {room.verification_tier === 'tier3' && 'Upload government ID for verification'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="divider-gold mb-8"></div>
                        <h2 className="text-heading mb-6 text-center">Vote on:</h2>
                        <div className="space-y-4">
                            {room.room_options?.map((option: any, index: number) => (
                                <div
                                    key={option.id}
                                    className="card p-6 gold-border transition-all hover:gold-glow"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                            <span className="font-bold gold-text">{index + 1}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-lg mb-1">{option.title}</h3>
                                            {option.description && (
                                                <p className="text-sm text-mono-60">{option.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
        </div>

                {/* Footer */}
                <div className="border-t border-white/5 py-8">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <p className="text-sm text-mono-50">
                            Powered by <span className="gold-text font-bold">VoteQuest</span> Institutional Voting
                        </p>
                    </div>
                </div>
            </div>
    );
}
