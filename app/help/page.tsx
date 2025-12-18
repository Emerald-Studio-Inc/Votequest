'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Shield, Wallet, Zap, HelpCircle, AlertTriangle, Globe, Check } from 'lucide-react';

export default function HelpPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-void)] text-white">
            {/* Minimal Background */}
            <div className="absolute inset-0 bg-noise opacity-50 pointer-events-none fixed"></div>

            <div className="container mx-auto px-6 py-12 max-w-4xl relative z-10">
                {/* Header */}
                <div className="mb-12 animate-slide-down">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-6 group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-4xl font-bold mb-4 tracking-tight">Getting Started</h1>
                    <p className="text-xl text-gray-500">Everything you need to participate in decentralized governance</p>
                </div>

                {/* Quick Start */}
                <section className="mb-16 animate-slide-up">
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-white" />
                        Quick Start
                    </h2>
                    <div className="grid gap-4">
                        <div className="glass-medium rounded-xl p-6 border border-white/5 flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold flex-shrink-0">1</div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Install a Web3 Wallet</h3>
                                <p className="text-gray-400 mb-2">Get MetaMask (recommended), Trust Wallet, or Rainbow Wallet.</p>
                                <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer"
                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                    Download MetaMask →
                                </a>
                            </div>
                        </div>

                        <div className="glass-medium rounded-xl p-6 border border-white/5 flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Switch to Polygon Amoy</h3>
                                <p className="text-gray-400">Connect your wallet and approve the network switch when prompted.</p>
                            </div>
                        </div>

                        <div className="glass-medium rounded-xl p-6 border border-white/5 flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                            <div>
                                <h3 className="font-semibold text-lg mb-1">Get Free Testnet MATIC</h3>
                                <p className="text-gray-400 mb-2">You need a small amount of MATIC for gas fees.</p>
                                <div className="flex gap-4">
                                    <a href="https://faucet.polygon.technology/" target="_blank" rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                        Polygon Faucet →
                                    </a>
                                    <a href="https://www.alchemy.com/faucets/polygon-amoy" target="_blank" rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                                        Alchemy Faucet →
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="mb-16 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <HelpCircle className="w-5 h-5 text-white" />
                        FAQ
                    </h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="glass-medium rounded-xl p-6 border border-white/5">
                            <h3 className="font-semibold mb-2">Do I need to share my private key?</h3>
                            <p className="text-sm text-gray-400">
                                <strong className="text-white">No, never!</strong> VoteQuest never asks for your private keys. All transactions are signed securely within your wallet.
                            </p>
                        </div>

                        <div className="glass-medium rounded-xl p-6 border border-white/5">
                            <h3 className="font-semibold mb-2">Is this real money?</h3>
                            <p className="text-sm text-gray-400">
                                No! This app uses <strong>Polygon Amoy testnet</strong>. The tokens have no real-world value and are free from faucets.
                            </p>
                        </div>

                        <div className="glass-medium rounded-xl p-6 border border-white/5">
                            <h3 className="font-semibold mb-2">Cost to vote?</h3>
                            <p className="text-sm text-gray-400">
                                Voting costs a tiny gas fee (0.0001 MATIC). Since it's testnet MATIC, it's essentially free.
                            </p>
                        </div>

                        <div className="glass-medium rounded-xl p-6 border border-white/5">
                            <h3 className="font-semibold mb-2">Mobile support?</h3>
                            <p className="text-sm text-gray-400">
                                Yes! Use the MetaMask mobile app browser or scan the QR code with WalletConnect.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Troubleshooting */}
                <section className="mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-white" />
                        Troubleshooting
                    </h2>

                    <div className="glass-medium rounded-xl p-6 border border-white/5 space-y-6">
                        <div>
                            <h3 className="font-semibold text-white mb-1">❌ "Wrong Network" error</h3>
                            <p className="text-sm text-gray-400">
                                Click "Switch Network" or manually switch to Polygon Amoy in your wallet.
                            </p>
                        </div>
                        <div className="h-px bg-white/5"></div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">❌ "Insufficient funds" error</h3>
                            <p className="text-sm text-gray-400">
                                You need testnet MATIC. Visit a faucet to request free tokens.
                            </p>
                        </div>
                        <div className="h-px bg-white/5"></div>
                        <div>
                            <h3 className="font-semibold text-white mb-1">❌ Transaction failed</h3>
                            <p className="text-sm text-gray-400">
                                Check if the voting deadline has passed or if you already voted.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Network Info */}
                <section className="mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-white" />
                        Network Info
                    </h2>
                    <div className="glass-medium rounded-xl p-6 border border-white/5 grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-300">Polygon Amoy Testnet</h3>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li className="flex justify-between"><span>Chain ID:</span> <span className="text-white font-mono">80002</span></li>
                                <li className="flex justify-between"><span>Currency:</span> <span className="text-white">MATIC</span></li>
                                <li className="flex justify-between"><span>RPC:</span> <span className="text-white truncate max-w-[150px]">rpc-amoy.polygon.technology</span></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-3 text-gray-300">Smart Contract</h3>
                            <ul className="text-sm text-gray-500 space-y-2">
                                <li className="flex justify-between"><span>Name:</span> <span className="text-white">VoteQuest</span></li>
                                <li className="flex justify-between"><span>Status:</span> <span className="text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Verified</span></li>
                                <li className="mt-2">
                                    <div className="text-xs uppercase tracking-wider mb-1">Address</div>
                                    <div className="font-mono text-white bg-white/5 p-2 rounded text-xs break-all">
                                        0x77405d9D0a34D6eb59bC57dd5F434F8902CC5a5d
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <div className="text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
                    <Link href="/"
                        className="btn btn-primary px-8 py-4 text-lg inline-flex items-center gap-2">
                        Start Voting Now
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
