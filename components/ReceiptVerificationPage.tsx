import { useState, useEffect } from 'react';
import { Search, CheckCircle, Shield, AlertCircle } from 'lucide-react';
import { verifyReceipt } from '@/lib/receipts';
import { supabase } from '@/lib/supabase';

export default function ReceiptVerificationPage() {
    const [receiptHash, setReceiptHash] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleVerify = async () => {
        if (!receiptHash.trim()) return;

        setVerifying(true);
        setResult(null);

        try {
            // Fetch receipt from database
            const { data: receipt } = await supabase
                .from('coin_transactions')
                .select(`
          *,
          users:user_id (
            id,
            username,
            wallet_address,
            email
          )
        `)
                .eq('receipt_hash', receiptHash.trim())
                .single();

            if (!receipt) {
                setResult({ valid: false, error: 'Receipt not found' });
                setVerifying(false);
                return;
            }

            // Verify the receipt
            const isValid = await verifyReceipt(receipt);

            setResult({
                valid: isValid,
                receipt,
                user: receipt.users
            });
        } catch (error) {
            setResult({ valid: false, error: 'Verification failed' });
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Verify Receipt</h1>
                    <p className="text-mono-60">
                        Enter a receipt hash to verify its authenticity and view details
                    </p>
                </div>

                {/* Search */}
                <div className="card-elevated p-8 mb-6">
                    <label className="block text-sm font-medium text-mono-70 mb-3">
                        Receipt Hash (SHA-256)
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={receiptHash}
                            onChange={(e) => setReceiptHash(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:border-white/30 outline-none"
                            placeholder="Enter 64-character SHA-256 hash..."
                        />
                        <button
                            onClick={handleVerify}
                            disabled={verifying || !receiptHash.trim()}
                            className="btn btn-primary flex items-center gap-2 flex-shrink-0"
                        >
                            <Search className="w-4 h-4" />
                            Verify
                        </button>
                    </div>
                </div>

                {/* Result */}
                {verifying && (
                    <div className="card p-8 text-center">
                        <div className="loading-spinner w-12 h-12 mx-auto mb-4" />
                        <p className="text-mono-60">Verifying receipt...</p>
                    </div>
                )}

                {result && !verifying && (
                    <div className={`card-elevated p-8 ${result.valid ? 'border-2 border-green-500/30' : 'border-2 border-red-500/30'}`}>
                        {/* Status */}
                        <div className="flex items-center gap-3 mb-6">
                            {result.valid ? (
                                <>
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Valid Receipt ✓</h2>
                                        <p className="text-sm text-green-400">This receipt is authentic and verified</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-8 h-8 text-red-400" />
                                    <div>
                                        <h2 className="text-xl font-bold text-white">Invalid Receipt ✗</h2>
                                        <p className="text-sm text-red-400">
                                            {result.error || 'This receipt could not be verified'}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Receipt Details */}
                        {result.valid && result.receipt && (
                            <div className="space-y-4 border-t border-white/10 pt-6">
                                <div>
                                    <p className="text-sm text-mono-60 mb-1">User</p>
                                    <p className="font-mono text-white">
                                        {result.user?.username || result.user?.wallet_address || result.user?.email || 'Unknown'}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm text-mono-60 mb-1">Action</p>
                                    <span className="badge">{result.receipt.reason}</span>
                                </div>

                                <div>
                                    <p className="text-sm text-mono-60 mb-1">Amount</p>
                                    <p className="text-2xl font-bold text-yellow-400">+{result.receipt.amount} VQC</p>
                                </div>

                                <div>
                                    <p className="text-sm text-mono-60 mb-1">Date</p>
                                    <p className="text-white">
                                        {new Date(result.receipt.created_at).toLocaleString()}
                                    </p>
                                </div>

                                {result.receipt.action_metadata && (
                                    <div>
                                        <p className="text-sm text-mono-60 mb-2">Metadata</p>
                                        <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                                            <pre className="text-xs text-mono-70 overflow-x-auto">
                                                {JSON.stringify(result.receipt.action_metadata, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm text-mono-60 mb-1">Receipt Hash</p>
                                    <code className="text-xs text-green-400 font-mono break-all">
                                        {result.receipt.receipt_hash}
                                    </code>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Info */}
                <div className="mt-6 text-center text-sm text-mono-60">
                    <p>
                        Every receipt on VoteQuest is cryptographically signed with SHA-256.
                        <br />
                        Verifying a receipt proves the action actually occurred and hasn't been tampered with.
                    </p>
                </div>
            </div>
        </div>
    );
}
