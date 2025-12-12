'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader, Home, RefreshCw } from 'lucide-react';

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'error';

interface VerificationResult {
    success: boolean;
    status?: string;
    coins?: number;
    plan?: string;
    tier?: number;
    bonusCoins?: number;
    message?: string;
}

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<PaymentStatus>('verifying');
    const [result, setResult] = useState<VerificationResult | null>(null);

    const type = searchParams.get('type'); // 'subscription' or 'coins'
    const tx_ref = searchParams.get('tx_ref');
    const transaction_id = searchParams.get('transaction_id');

    useEffect(() => {
        if (!tx_ref || !type) {
            setStatus('error');
            return;
        }

        verifyPayment();
    }, [tx_ref, type]);

    const verifyPayment = async () => {
        setStatus('verifying');

        try {
            const endpoint = type === 'subscription'
                ? '/api/flutterwave/verify-subscription'
                : '/api/flutterwave/verify-coins';

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tx_ref, transaction_id })
            });

            const data: VerificationResult = await response.json();
            setResult(data);

            if (data.success) {
                setStatus('success');
            } else {
                setStatus('failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                {/* Status Card */}
                <div className="card-gold p-8 text-center gold-glow">
                    {status === 'verifying' && (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <Loader className="w-10 h-10 text-yellow-500 animate-spin" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2">Verifying Payment</h1>
                            <p className="text-mono-60">Please wait while we confirm your payment...</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center animate-scale-bounce">
                                <CheckCircle className="w-10 h-10 text-green-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-green-400 mb-2">Payment Successful!</h1>

                            {type === 'coins' && result?.coins && (
                                <div className="my-6 p-4 bg-white/5 rounded-xl">
                                    <p className="text-mono-60 text-sm mb-1">Coins Added</p>
                                    <p className="text-3xl font-bold text-yellow-500">{result.coins} VQC</p>
                                </div>
                            )}

                            {type === 'subscription' && result?.plan && (
                                <div className="my-6 p-4 bg-white/5 rounded-xl">
                                    <p className="text-mono-60 text-sm mb-1">Plan Activated</p>
                                    <p className="text-2xl font-bold text-purple-400 capitalize">{result.plan}</p>
                                    {result.bonusCoins && (
                                        <p className="text-sm text-yellow-500 mt-2">+{result.bonusCoins} Bonus Coins!</p>
                                    )}
                                </div>
                            )}

                            <p className="text-mono-60 mb-6">
                                Thank you for your purchase. Your account has been updated.
                            </p>
                        </>
                    )}

                    {(status === 'failed' || status === 'error') && (
                        <>
                            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center">
                                <XCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-red-400 mb-2">
                                {status === 'failed' ? 'Payment Not Confirmed' : 'Verification Error'}
                            </h1>
                            <p className="text-mono-60 mb-6">
                                {result?.message || 'We could not verify your payment. If you were charged, please contact support.'}
                            </p>
                            <button
                                onClick={verifyPayment}
                                className="btn btn-secondary mb-4"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                        </>
                    )}

                    {/* Actions */}
                    {status !== 'verifying' && (
                        <div className="flex flex-col gap-3 mt-6">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="btn-gold w-full"
                            >
                                <Home className="w-4 h-4" />
                                Go to Dashboard
                            </button>

                            {type === 'subscription' && (
                                <button
                                    onClick={() => router.push('/dashboard?tab=organizations')}
                                    className="btn btn-ghost w-full"
                                >
                                    View Organization
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Transaction Reference */}
                {tx_ref && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-mono-40">
                            Reference: <span className="font-mono">{tx_ref}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
