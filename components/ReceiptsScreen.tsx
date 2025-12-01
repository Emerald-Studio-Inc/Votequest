import { Download, CheckCircle, FileText, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getReceiptSummary, exportReceiptsCSV } from '@/lib/receipts';

interface Receipt {
    id: string;
    amount: number;
    reason: string;
    receipt_hash: string;
    action_metadata: any;
    created_at: string;
    verified: boolean;
}

interface ReceiptsScreenProps {
    userId: string;
    onBack: () => void;
}

export default function ReceiptsScreen({ userId, onBack }: ReceiptsScreenProps) {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReceipts();
    }, [userId]);

    const loadReceipts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('coin_transactions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setReceipts(data);
        }
        setLoading(false);
    };

    const handleExportCSV = () => {
        const csv = exportReceiptsCSV(receipts as any);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `votequest-receipts-${new Date().toISOString()}.csv`;
        a.click();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="loading-spinner w-12 h-12" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="sticky top-0 z-10 glass border-b border-white/10">
                <div className="max-w-4xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                            >
                                ←
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Proof-of-Work Receipts</h1>
                                <p className="text-sm text-mono-60">Your cryptographic participation history</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleExportCSV}
                                className="btn btn-secondary flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {receipts.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText className="w-16 h-16 text-mono-40 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No receipts yet</h2>
                        <p className="text-mono-60">Start voting and creating proposals to earn proof-of-work receipts!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="card p-4">
                                <p className="text-sm text-mono-60 mb-1">Total Receipts</p>
                                <p className="text-2xl font-bold text-white">{receipts.length}</p>
                            </div>
                            <div className="card p-4">
                                <p className="text-sm text-mono-60 mb-1">Total Coins Earned</p>
                                <p className="text-2xl font-bold text-white">
                                    {receipts.reduce((sum, r) => sum + r.amount, 0)} VQC
                                </p>
                            </div>
                            <div className="card p-4">
                                <p className="text-sm text-mono-60 mb-1">Verified</p>
                                <p className="text-2xl font-bold text-green-400">
                                    {receipts.filter(r => r.verified).length}
                                </p>
                            </div>
                        </div>

                        {/* Receipt List */}
                        {receipts.map((receipt) => {
                            const summary = getReceiptSummary(receipt as any);

                            return (
                                <div key={receipt.id} className="card p-6 hover:border-white/20 transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle className="w-6 h-6 text-green-400" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-1">{summary}</h3>
                                                <div className="flex items-center gap-4 text-sm text-mono-60">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-4 h-4" />
                                                        {formatDate(receipt.created_at)}
                                                    </span>
                                                    <span className="badge badge-sm badge-success">
                                                        {receipt.verified ? 'Verified' : 'Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-white">+{receipt.amount}</p>
                                            <p className="text-sm text-mono-60">VQC</p>
                                        </div>
                                    </div>

                                    {/* Receipt Hash */}
                                    <div className="bg-black/40 rounded-lg p-4 border border-white/5">
                                        <p className="text-xs text-mono-50 mb-2">Cryptographic Receipt Hash (SHA-256)</p>
                                        <code className="text-xs text-green-400 font-mono break-all">
                                            {receipt.receipt_hash}
                                        </code>
                                    </div>

                                    {/* Metadata */}
                                    {receipt.action_metadata && (
                                        <div className="mt-4 text-sm text-mono-60 space-y-1">
                                            {receipt.action_metadata.proposalTitle && (
                                                <p>📝 Proposal: {receipt.action_metadata.proposalTitle}</p>
                                            )}
                                            {receipt.action_metadata.optionTitle && (
                                                <p>✅ Option: {receipt.action_metadata.optionTitle}</p>
                                            )}
                                            {receipt.action_metadata.title && (
                                                <p>📋 {receipt.action_metadata.title}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
