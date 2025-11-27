'use client'

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Proposal redirect page
 * When users click share links like /proposal/xyz?ref=ABC
 * This captures the ref code and redirects to main app
 */
export default function ProposalPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const proposalId = params.id;
        const refCode = searchParams.get('ref');

        // Store referral code if present
        if (refCode) {
            localStorage.setItem('referralCode', refCode);
            localStorage.setItem('targetProposalId', proposalId);
            console.log('[REFERRAL] Captured code:', refCode, 'for proposal:', proposalId);
        }

        // Redirect to main app
        // The app will check localStorage for targetProposalId and auto-navigate
        router.push('/');
    }, [params.id, searchParams, router]);

    return (
        <div className="fixed inset-0 bg-gray-950 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white text-lg">Loading proposal...</p>
            </div>
        </div>
    );
}
