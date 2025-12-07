import { useState } from 'react';
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

    return (
        <div className="space-y-6">
            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={() => setShowAddVoter(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" />
                    Add Voter
                </button>

                <label className="btn btn-secondary flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Upload CSV'}
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleCSVUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                </label>

                <button
                    onClick={downloadTemplate}
                    className="btn btn-ghost flex items-center gap-2"
                >
                    <Download className="w-4 h-4" />
                    Download Template
                </button>
            </div>

            {/* Add Voter Modal */}
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

            {/* Voter List */}
            <div className="card-elevated p-6">
                <h3 className="text-heading mb-4">
                    Eligible Voters ({voters.length})
                </h3>

                {voters.length === 0 ? (
                    <div className="text-center py-8">
                        <UserPlus className="w-10 h-10 text-mono-50 mx-auto mb-3" />
                        <p className="text-mono-60">No voters added yet</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {voters.map((voter) => (
                            <div
                                key={voter.id}
                                className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-medium text-sm">{voter.identifier}</p>
                                    {voter.student_id && (
                                        <p className="text-xs text-mono-60">ID: {voter.student_id}</p>
                                    )}
                                    {voter.has_voted && (
                                        <span className="text-xs text-green-400">✓ Voted</span>
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
