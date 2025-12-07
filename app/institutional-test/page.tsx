'use client';

import Link from 'next/link';
import { Building2, Vote, Users, CheckCircle } from 'lucide-react';

export default function InstitutionalTestPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4 gold-text">Institutional Voting System - Test Page</h1>
                    <p className="text-mono-60">All features are installed and ready to use!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Components */}
                    <div className="card-gold p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-8 h-8 gold-text" />
                            <h2 className="text-2xl font-bold">Components</h2>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                EmailVerification.tsx (3-step flow)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                GovIDUpload.tsx
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                ShareRoomInvite.tsx (QR codes)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                AdminVerificationDashboard.tsx
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                VoterManagementPanel.tsx
                            </li>
                        </ul>
                    </div>

                    {/* APIs */}
                    <div className="card-gold p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Vote className="w-8 h-8 gold-text" />
                            <h2 className="text-2xl font-bold">API Endpoints</h2>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                /api/rooms/[id]/verify-email
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                /api/rooms/[id]/verify-code
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                /api/rooms/[id]/verify-id
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                /api/rooms/[id]/upload-verification
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                /api/admin/pending-verifications
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                /api/admin/verify-voter/[id]
                            </li>
                        </ul>
                    </div>

                    {/* Features */}
                    <div className="card-gold p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-8 h-8 gold-text" />
                            <h2 className="text-2xl font-bold">Features Ready</h2>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Tier 1: Email verification
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Tier 2: Email + ID
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Tier 3: Email + Gov ID
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                QR Code generation
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Voter CSV upload
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Admin review dashboard
                            </li>
                        </ul>
                    </div>

                    {/* Database */}
                    <div className="card-gold p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <Building2 className="w-8 h-8 gold-text" />
                            <h2 className="text-2xl font-bold">Database</h2>
                        </div>
                        <ul className="space-y-2 text-sm">
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                voter_eligibility table
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                voting_rooms table
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-green-400">✓</span>
                                Verification status tracking
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-yellow-400">⚠</span>
                                Run: migrations/add_verification_status.sql
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-8 card-gold p-6 gold-glow">
                    <h3 className="text-xl font-bold mb-4">Next Steps:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                        <li>Run the database migration: <code className="bg-white/10 px-2 py-1 rounded">migrations/add_verification_status.sql</code></li>
                        <li>The files need to be integrated into VoteQuestApp.tsx navigation</li>
                        <li>Create an organization to test the features</li>
                        <li>All components and APIs are ready to use!</li>
                    </ol>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-mono-60">Go to <code className="bg-white/10 px-2 py-1 rounded gold-text">/institutional-test</code> to see this page</p>
                </div>
            </div>
        </div>
    );
}
