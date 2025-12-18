import { useState } from 'react';
import ArcadeButton from './ArcadeButton';
import { Upload, UserPlus, Download, Trash2, Mail, X } from 'lucide-react';

interface VoterManagementPanelProps {
    roomId: string;
    verificationTier: 'tier1' | 'tier2' | 'tier3';
    voters: any[];
    onRefresh: () => void;
}

export default function VoterManagementPanel({
    roomId,
    verificationTier,
    voters,
    onRefresh
}: VoterManagementPanelProps) {
    const [showAddVoter, setShowAddVoter] = useState(false);
    const [newVoterEmail, setNewVoterEmail] = useState('');
    const [newVoterIdentifier, setNewVoterIdentifier] = useState('');
    const [uploading, setUploading] = useState(false);

    const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);

        try {
            const text = await file.text();
            const lines = text.split('\n').filter(line => line.trim());

            // Parse CSV (simple: email,identifier,metadata)
            const votersData = lines.slice(1).map(line => {
                const [email, identifier, name] = line.split(',').map(v => v.trim());
                return { email, identifier, metadata: { name } };
            });

            // Upload to API
            const response = await fetch(`/api/rooms/${roomId}/voters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bulk: true,
                    voters: votersData
                })
            });

            if (response.ok) {
                alert(`Successfully added ${votersData.length} voters!`);
                onRefresh();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        } finally {
            setUploading(false);
            if (event.target) event.target.value = '';
        }
    };

    const handleAddSingleVoter = async () => {
        if (!newVoterEmail.trim()) {
            alert('Please enter an email address');
            return;
        }

        try {
            const response = await fetch(`/api/rooms/${roomId}/voters`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    single: true,
                    identifier: newVoterEmail,
                    identifierType: 'email',
                    studentId: verificationTier !== 'tier1' ? newVoterIdentifier : undefined
                })
            });

            if (response.ok) {
                alert('Voter added successfully!');
                setNewVoterEmail('');
                setNewVoterIdentifier('');
                setShowAddVoter(false);
                onRefresh();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    const handleRemoveVoter = async (voterId: string) => {
        if (!confirm('Remove this voter from the list?')) return;

        try {
            const response = await fetch(`/api/rooms/${roomId}/voters/${voterId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert('Voter removed');
                onRefresh();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    const downloadTemplate = () => {
        const csv = 'email,identifier,name\nstudent@school.edu,STU123,John Doe\n';
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'voter-template.csv';
        a.click();
    };

    const [reviewVoter, setReviewVoter] = useState<any>(null);
    const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);

    const pendingVoters = voters.filter(v => v.verification_status === 'pending');
    const approvedVoters = voters.filter(v => v.verification_status !== 'pending');

    const handleReview = async (voterId: string, status: 'verified' | 'rejected') => {
        try {
            const response = await fetch(`/api/rooms/${roomId}/review-verification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voterId, status })
            });

            if (response.ok) {
                alert(`Voter ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
                setReviewVoter(null);
                onRefresh();
            } else {
                const data = await response.json();
                alert(`Error: ${data.error}`);
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`);
        }
    };

    const getFileUrl = (path: string) => {
        if (!path) return '';
        const filename = path.split(/[/\\]/).pop();
        return `/api/uploads/${filename}`;
    };

    return (
        <div className="space-y-6">
            {/* Pending Reviews (Tier 3) */}
            {verificationTier === 'tier3' && pendingVoters.length > 0 && (
                <div className="bg-blue-900/5 border border-blue-500/30 rounded-xl p-6 shadow-[0_0_20px_rgba(0,85,255,0.2)] mb-8 animate-pulse-slow">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/30">
                                <span className="font-bold">{pendingVoters.length}</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Pending Verifications</h3>
                                <p className="text-sm text-mono-60">Review government IDs</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {pendingVoters.map((voter) => (
                            <div key={voter.id} className="bg-black/40 rounded-lg p-4 flex items-center justify-between border border-white/5">
                                <div>
                                    <p className="font-medium text-white">{voter.email}</p>
                                    <p className="text-xs text-mono-50">Submitted: {new Date(voter.updated_at || voter.created_at).toLocaleDateString()}</p>
                                </div>
                                <button
                                    onClick={() => setReviewVoter(voter)}
                                    className="btn btn-primary btn-sm"
                                >
                                    Review ID
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
                <ArcadeButton
                    onClick={() => setShowAddVoter(true)}
                    variant="blue"
                    className="flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    ADD_VOTER
                </ArcadeButton>

                <label className="cursor-pointer group relative">
                    <div className="px-6 py-2 border-2 flex items-center gap-2 font-mono font-bold transition-all duration-200 active:scale-95"
                        style={{
                            borderColor: '#FF003C',
                            backgroundColor: '#FF003C15',
                            color: '#FF003C'
                        }}>
                        <Upload className="w-4 h-4" />
                        {uploading ? 'UPLOADING...' : 'UPLOAD_CSV'}

                        <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2" style={{ borderColor: '#FF003C' }}></span>
                        <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2" style={{ borderColor: '#FF003C' }}></span>
                    </div>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                </label>

                <ArcadeButton
                    onClick={downloadTemplate}
                    variant="lime"
                    className="flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    TEMPLATE
                </ArcadeButton>
            </div>

            {/* ... (Add Voter Modal - Unchanged) ... */}
            {showAddVoter && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center px-6">
                    <div className="card-elevated p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-heading">Add Voter</h3>
                            <button onClick={() => setShowAddVoter(false)} className="btn btn-ghost btn-sm p-2">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-mono-70 block mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={newVoterEmail}
                                    onChange={(e) => setNewVoterEmail(e.target.value)}
                                    placeholder="voter@example.com"
                                    className="input w-full"
                                    autoFocus
                                />
                            </div>

                            {verificationTier !== 'tier1' && (
                                <div>
                                    <label className="text-sm font-medium text-mono-70 block mb-2">
                                        Student/Employee ID {verificationTier === 'tier2' && '*'}
                                    </label>
                                    <input
                                        type="text"
                                        value={newVoterIdentifier}
                                        onChange={(e) => setNewVoterIdentifier(e.target.value)}
                                        placeholder="STU12345"
                                        className="input w-full"
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddVoter(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSingleVoter}
                                    className="btn btn-primary flex-1"
                                >
                                    Add Voter
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Voter Modal */}
            {reviewVoter && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center px-6">
                    <div className="card-elevated p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-heading">Review Verification</h3>
                            <button onClick={() => setReviewVoter(null)} className="btn btn-ghost btn-sm p-2">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-mono-60">Voter Email</p>
                                    <p className="font-medium">{reviewVoter.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-mono-60">Submitted</p>
                                    <p className="font-medium">{new Date(reviewVoter.updated_at || reviewVoter.created_at).toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="bg-black/50 rounded-xl overflow-hidden border border-white/10">
                                {reviewVoter.gov_id_url ? (
                                    <img
                                        src={getFileUrl(reviewVoter.gov_id_url)}
                                        alt="Government ID"
                                        className="w-full h-auto object-contain max-h-[400px]"
                                    />
                                ) : (
                                    <div className="p-12 text-center text-mono-50">
                                        No ID image found
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-white/10">
                                <button
                                    onClick={() => handleReview(reviewVoter.id, 'rejected')}
                                    className="btn btn-ghost text-red-400 hover:text-red-300 flex-1 hover:bg-red-500/10"
                                >
                                    Reject Request
                                </button>
                                <button
                                    onClick={() => handleReview(reviewVoter.id, 'verified')}
                                    className="btn btn-primary flex-1 bg-blue-600 hover:bg-blue-500 text-white border-blue-500"
                                >
                                    Approve Verification
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Voter List */}
            <div className="card-elevated p-6">
                <h3 className="text-heading mb-4">
                    Eligible Voters ({approvedVoters.length})
                </h3>

                {approvedVoters.length === 0 ? (
                    <div className="text-center py-8">
                        <UserPlus className="w-10 h-10 text-mono-50 mx-auto mb-3" />
                        <p className="text-mono-60">No approved voters yet</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {approvedVoters.map((voter) => (
                            <div
                                key={voter.id}
                                className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-medium text-sm">{voter.identifier || voter.email}</p>
                                    {voter.student_id && (
                                        <p className="text-xs text-mono-60">ID: {voter.student_id}</p>
                                    )}
                                    {voter.has_voted && (
                                        <span className="text-xs text-green-400">✓ Voted</span>
                                    )}
                                    {/* Verification Status Badge */}
                                    {voter.verification_status && (
                                        <span className={`text-xs ml-2 px-2 py-0.5 rounded-full ${voter.verification_status === 'verified' ? 'bg-green-500/20 text-green-400' :
                                            voter.verification_status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {voter.verification_status}
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleRemoveVoter(voter.id)}
                                    className="btn btn-ghost btn-sm p-2 text-red-400 hover:text-red-300"
                                    title="Remove voter"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CSV Format Help */}
            <div className="card p-4 bg-blue-500/10 border-blue-500/20">
                <p className="text-sm text-mono-70 mb-2">
                    <strong>CSV Format:</strong>
                </p>
                <code className="text-xs text-mono-60 block">
                    email,identifier,name<br />
                    student@school.edu,STU123,John Doe<br />
                    voter@company.com,EMP456,Jane Smith
                </code>
            </div>
        </div>
    );
}
