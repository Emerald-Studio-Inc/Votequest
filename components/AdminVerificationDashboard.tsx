import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, Mail, FileText } from 'lucide-react';

interface VerificationDashboardProps {
    roomId?: string;
}

export default function AdminVerificationDashboard({ roomId }: VerificationDashboardProps) {
    const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        loadPendingVerifications();
    }, [roomId]);

    const loadPendingVerifications = async () => {
        try {
            setLoading(true);
            const url = roomId
                ? `/api/admin/pending-verifications?roomId=${roomId}`
                : '/api/admin/pending-verifications';

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setPendingVerifications(data.verifications || []);
            }
        } catch (error) {
            console.error('Error loading verifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerification = async (verificationId: string, approved: boolean) => {
        try {
            setProcessing(verificationId);

            const response = await fetch(`/api/admin/verify-voter/${verificationId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ approved })
            });

            if (response.ok) {
                // Refresh list
                await loadPendingVerifications();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="loading-spinner w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (pendingVerifications.length === 0) {
        return (
            <div className="bg-[#121215]/90 border border-blue-500/30 p-12 text-center shadow-[0_0_20px_rgba(0,85,255,0.2)] rounded-2xl">
                <CheckCircle className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-white">All Caught Up!</h3>
                <p className="text-mono-60">
                    No pending verifications to review
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-blue-500">Pending Verifications</h2>
                            <p className="text-sm text-mono-60">{pendingVerifications.length} awaiting review</p>
                        </div>
                    </div>
                    <p className="text-sm text-mono-60">{pendingVerifications.length} awaiting review</p>
                </div>
            </div>

            {pendingVerifications.map((verification: any) => (
                <div key={verification.id} className="bg-white/5 border border-blue-500/30 rounded-xl p-6 shadow-lg">
                    <div className="grid grid-cols-2 gap-6">
                        {/* Voter Info */}
                        <div className="space-y-4">
                            <div>
                                <div className="flex items-center gap-2 text-sm text-mono-50 mb-1">
                                    <Mail className="w-4 h-4" />
                                    Email
                                </div>
                                <p className="font-medium">{verification.email}</p>
                            </div>

                            {verification.identifier && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm text-mono-50 mb-1">
                                        <User className="w-4 h-4" />
                                        ID Number
                                    </div>
                                    <p className="font-medium">{verification.identifier}</p>
                                </div>
                            )}

                            <div>
                                <div className="flex items-center gap-2 text-sm text-mono-50 mb-1">
                                    <Clock className="w-4 h-4" />
                                    Submitted
                                </div>
                                <p className="font-medium">
                                    {new Date(verification.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <div className="flex items-center gap-2 text-sm text-mono-50 mb-1">
                                    <FileText className="w-4 h-4" />
                                    Room
                                </div>
                                <p className="font-medium">{verification.room_title}</p>
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="space-y-4">
                            {verification.gov_id_url && (
                                <div>
                                    <p className="text-sm text-mono-50 mb-2">Government ID:</p>
                                    <img
                                        src={`/uploads/${verification.gov_id_url.split('/').pop()}`}
                                        alt="Government ID"
                                        className="w-full rounded-lg border border-white/10"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.nextElementSibling!.classList.remove('hidden');
                                        }}
                                    />
                                    <div className="hidden bg-white/5 rounded-lg p-4 text-center text-sm text-mono-60">
                                        📄 Document preview unavailable
                                    </div>
                                </div>
                            )}

                            {verification.photo_url && (
                                <div>
                                    <p className="text-sm text-mono-50 mb-2">Selfie Photo:</p>
                                    <img
                                        src={`/uploads/${verification.photo_url.split('/').pop()}`}
                                        alt="Selfie"
                                        className="w-full rounded-lg border border-white/10"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
                        <button
                            onClick={() => handleVerification(verification.id, true)}
                            disabled={processing === verification.id}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex-1 flex items-center justify-center gap-2"
                        >
                            {processing === verification.id ? (
                                <>
                                    <div className="loading-spinner w-4 h-4" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Approve
                                </>
                            )}
                        </button>

                        <button
                            onClick={() => handleVerification(verification.id, false)}
                            disabled={processing === verification.id}
                            className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                        >
                            <XCircle className="w-4 h-4" />
                            Reject
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
