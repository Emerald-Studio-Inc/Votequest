'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Zap, TrendingUp, Sparkles } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface CoinsPurchaseModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (coins: number) => void;
}

interface CoinPackage {
    id: string;
    name: string;
    coins: number;
    price: number;
    bonus?: number;
    popular?: boolean;
    icon?: React.ReactNode;
}

const COIN_PACKAGES: CoinPackage[] = [
    {
        id: 'trial',
        name: 'Trial',
        coins: 50,
        price: 0.99,
        icon: <Sparkles className="w-5 h-5" />
    },
    {
        id: 'starter',
        name: 'Starter',
        coins: 200,
        price: 2.99,
        icon: <Zap className="w-5 h-5" />
    },
    {
        id: 'popular',
        name: 'Popular',
        coins: 500,
        price: 6.99,
        bonus: 50,
        popular: true,
        icon: <TrendingUp className="w-5 h-5" />
    },
    {
        id: 'power',
        name: 'Power',
        coins: 1500,
        price: 14.99,
        bonus: 300,
        icon: <Zap className="w-5 h-5" />
    }
];

const CoinsPurchaseModal: React.FC<CoinsPurchaseModalProps> = ({
    userId,
    isOpen,
    onClose,
    onSuccess
}) => {
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [stripe, setStripe] = useState<any>(null);
    const [elements, setElements] = useState<any>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // Initialize Stripe Elements
    useEffect(() => {
        if (!isOpen) return;

        const initStripe = async () => {
            const stripeModule = (await import('@stripe/stripe-js')).default;
            const stripePk = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

            if (!stripePk) {
                console.error('Stripe public key not configured');
                setError('Payment system not configured');
                return;
            }

            const stripeInstance = await stripeModule.loadStripe(stripePk);
            if (stripeInstance) {
                setStripe(stripeInstance);
                const elementsInstance = stripeInstance.elements();
                setElements(elementsInstance);

                // Mount card element
                if (cardRef.current) {
                    const cardElement = elementsInstance.create('card', {
                        style: {
                            base: {
                                color: '#f3f4f6',
                                fontFamily: '"Inter", system-ui, sans-serif',
                                fontSize: '14px',
                                '::placeholder': {
                                    color: '#9ca3af',
                                },
                            },
                            invalid: {
                                color: '#ef4444',
                            },
                        },
                    });
                    cardElement.mount(cardRef.current);
                }
            }
        };

        initStripe();
    }, [isOpen]);

    const handlePurchase = async () => {
        if (!selectedPackage) {
            setError('Please select a package');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Step 1: Create payment intent
            const response = await fetch('/api/stripe/purchase-coins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    packageType: selectedPackage
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create payment');
            }

            const { clientSecret, vqc } = data;

            // Step 2: Confirm payment with Stripe
            if (!stripe || !elements) {
                throw new Error('Stripe not initialized');
            }

            if (!cardRef.current) {
                throw new Error('Card element not mounted');
            }

            const cardElement = elements.getElement('card');
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {}
                }
            });

            if (result.error) {
                throw new Error(result.error.message || 'Payment failed');
            }

            if (result.paymentIntent.status === 'succeeded') {
                setSuccess(true);
                onSuccess?.(vqc);

                // Close after 2 seconds
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                }, 2000);
            }
        } catch (err: any) {
            console.error('Purchase error:', err);
            setError(err.message || 'Failed to process payment');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-gradient-to-br from-black/90 to-black/80 border border-white/10 p-8 max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    disabled={loading}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold mb-2">Get VoteQuest Coins</h2>
                <p className="text-mono-60 mb-8">Purchase coins to unlock premium features</p>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>Payment successful! Coins added to your account.</span>
                    </div>
                )}

                {/* Coin Packages */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    {COIN_PACKAGES.map((pkg) => (
                        <button
                            key={pkg.id}
                            onClick={() => setSelectedPackage(pkg.id)}
                            disabled={loading || success}
                            className={`
                                relative p-4 rounded-xl border transition-all duration-200
                                ${selectedPackage === pkg.id
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-white/10 hover:border-white/20 bg-white/5'
                                }
                                ${pkg.popular ? 'ring-2 ring-yellow-500/30' : ''}
                                disabled:opacity-50
                            `}
                        >
                            {/* Popular Badge */}
                            {pkg.popular && (
                                <div className="absolute -top-3 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                                    BEST VALUE
                                </div>
                            )}

                            {/* Icon */}
                            <div className="flex items-center justify-center mb-3">
                                <div className={`${pkg.popular ? 'text-yellow-400' : 'text-white/60'}`}>
                                    {pkg.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <p className="font-semibold mb-1">{pkg.name}</p>
                            <p className="text-2xl font-bold mb-1">{pkg.coins}</p>
                            {pkg.bonus && (
                                <p className="text-xs text-green-400 mb-2">+{pkg.bonus} bonus</p>
                            )}
                            <p className="text-sm text-mono-70">${pkg.price}</p>
                        </button>
                    ))}
                </div>

                {/* Card Element */}
                {!success && (
                    <>
                        <div className="mb-6 p-4 rounded-lg border border-white/10 bg-white/5">
                            <label className="block text-sm font-medium mb-3">Card Details</label>
                            <div
                                ref={cardRef}
                                className="StripeElement"
                                style={{
                                    minHeight: '40px'
                                }}
                            />
                        </div>

                        {/* Purchase Button */}
                        <button
                            onClick={handlePurchase}
                            disabled={loading || !selectedPackage}
                            className={`
                                w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2
                                ${loading || !selectedPackage
                                    ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }
                            `}
                        >
                            {loading ? (
                                <>
                                    <LoadingSpinner size="small" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Zap className="w-4 h-4" />
                                    <span>
                                        Purchase Coins
                                        {selectedPackage && ` - $${(COIN_PACKAGES.find(p => p.id === selectedPackage)?.price || 0).toFixed(2)}`}
                                    </span>
                                </>
                            )}
                        </button>
                    </>
                )}

                {/* Info Text */}
                <p className="text-xs text-mono-60 text-center mt-6">
                    Your payment is secure and encrypted. Coins will be added immediately after successful payment.
                </p>
            </div>
        </div>
    );
};

export default CoinsPurchaseModal;
