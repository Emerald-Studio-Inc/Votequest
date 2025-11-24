'use client';

import { useAccount, useBalance } from 'wagmi';
import { polygonAmoy } from 'viem/chains';
import Link from 'next/link';

export default function ContextualHints() {
    const { address, isConnected, chain } = useAccount();
    const { data: balance } = useBalance({
        address: address,
        chainId: chain?.id,
    });

    // Don't show hints if not connected
    if (!isConnected || !address) return null;

    const hasLowBalance = balance && Number(balance.formatted) < 0.01;
    const isWrongNetwork = chain?.id !== polygonAmoy.id;

    // Don't show anything if everything is fine
    if (!hasLowBalance && !isWrongNetwork) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-slide-up">
            {/* Wrong Network Hint */}
            {isWrongNetwork && (
                <div className="bg-gradient-to-r from-accent-warning/20 to-accent-error/20 border border-accent-warning/50 rounded-lg p-4 mb-3 backdrop-blur-xl shadow-xl">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">Wrong Network</h4>
                            <p className="text-sm text-zinc-300 mb-2">
                                You're on {chain?.name || 'an unsupported network'}. Switch to Polygon Amoy to use VoteQuest.
                            </p>
                            <p className="text-xs text-zinc-400">
                                Open your wallet and switch networks, or click "Connect Wallet" again.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Low Balance Hint */}
            {hasLowBalance && !isWrongNetwork && (
                <div className="bg-gradient-to-r from-accent-blue/20 to-accent-violet/20 border border-accent-blue/50 rounded-lg p-4 backdrop-blur-xl shadow-xl">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">💰</span>
                        <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">Need Testnet MATIC?</h4>
                            <p className="text-sm text-zinc-300 mb-2">
                                You have {balance?.formatted ? Number(balance.formatted).toFixed(4) : '0'} MATIC.
                                You'll need some for gas fees to vote and create proposals.
                            </p>
                            <div className="flex gap-2 mt-2">
                                <a
                                    href="https://faucet.polygon.technology/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-accent-blue hover:bg-accent-blue/80 text-white px-3 py-1.5 rounded transition-colors"
                                >
                                    Get Free MATIC →
                                </a>
                                <Link
                                    href="/help"
                                    className="text-xs bg-zinc-700 hover:bg-zinc-600 text-white px-3 py-1.5 rounded transition-colors"
                                >
                                    Learn More
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
