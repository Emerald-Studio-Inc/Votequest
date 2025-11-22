'use client';

import { useReadContract, useReadContracts } from 'wagmi';
import { VOTE_QUEST_ADDRESS, VOTE_QUEST_ABI } from '@/lib/contracts';
import { useEffect, useState } from 'react';

export default function DebugProposals() {
    const [debugInfo, setDebugInfo] = useState<any>({});

    // Get proposal count
    const { data: proposalCount, isError: countError, isLoading: countLoading } = useReadContract({
        address: VOTE_QUEST_ADDRESS,
        abi: VOTE_QUEST_ABI,
        functionName: 'proposalCount',
    });

    const proposalIds = proposalCount ? Array.from({ length: Number(proposalCount) }, (_, i) => BigInt(i + 1)) : [];

    // Get all proposals
    const { data: proposalsData, isError: proposalsError, isLoading: proposalsLoading } = useReadContracts({
        contracts: proposalIds.map(id => ({
            address: VOTE_QUEST_ADDRESS,
            abi: VOTE_QUEST_ABI,
            functionName: 'getProposal',
            args: [id]
        }))
    });

    useEffect(() => {
        setDebugInfo({
            proposalCount: proposalCount ? proposalCount.toString() : 'undefined',
            proposalIds: proposalIds.map(id => id.toString()),
            proposalsData: proposalsData,
            countError,
            countLoading,
            proposalsError,
            proposalsLoading,
        });
    }, [proposalCount, proposalsData, countError, countLoading, proposalsError, proposalsLoading]);

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-3xl mb-6">Debug Proposals Data</h1>

            <div className="space-y-6">
                <div className="bg-zinc-900 p-4 rounded-lg">
                    <h2 className="text-xl mb-2">Contract Info</h2>
                    <p><strong>Contract Address:</strong> {VOTE_QUEST_ADDRESS}</p>
                </div>

                <div className="bg-zinc-900 p-4 rounded-lg">
                    <h2 className="text-xl mb-2">Proposal Count</h2>
                    <p><strong>Value:</strong> {debugInfo.proposalCount || 'Loading...'}</p>
                    <p><strong>Loading:</strong> {countLoading ? 'Yes' : 'No'}</p>
                    <p><strong>Error:</strong> {countError ? 'Yes' : 'No'}</p>
                </div>

                <div className="bg-zinc-900 p-4 rounded-lg">
                    <h2 className="text-xl mb-2">Proposal IDs</h2>
                    <p><strong>IDs Generated:</strong> {debugInfo.proposalIds?.join(', ') || 'None'}</p>
                </div>

                <div className="bg-zinc-900 p-4 rounded-lg">
                    <h2 className="text-xl mb-2">Proposals Data</h2>
                    <p><strong>Loading:</strong> {proposalsLoading ? 'Yes' : 'No'}</p>
                    <p><strong>Error:</strong> {proposalsError ? 'Yes' : 'No'}</p>
                    <p><strong>Data Count:</strong> {proposalsData?.length || 0}</p>
                </div>

                {proposalsData && proposalsData.length > 0 && (
                    <div className="bg-zinc-900 p-4 rounded-lg">
                        <h2 className="text-xl mb-4">Proposals Details</h2>
                        {proposalsData.map((result: any, index: number) => (
                            <div key={index} className="mb-4 p-3 bg-zinc-800 rounded">
                                <p><strong>Proposal #{index + 1}</strong></p>
                                <p><strong>Status:</strong> {result.status}</p>
                                {result.status === 'success' && result.result && (
                                    <div className="mt-2 space-y-1 text-sm">
                                        <p><strong>ID:</strong> {result.result.id?.toString()}</p>
                                        <p><strong>Title:</strong> {result.result.title}</p>
                                        <p><strong>Description:</strong> {result.result.description}</p>
                                        <p><strong>Deadline:</strong> {new Date(Number(result.result.deadline) * 1000).toLocaleString()}</p>
                                        <p><strong>Options:</strong> {result.result.options?.join(', ')}</p>
                                        <p><strong>Vote Counts:</strong> {result.result.voteCounts?.map((v: any) => v.toString()).join(', ')}</p>
                                    </div>
                                )}
                                {result.error && (
                                    <p className="text-red-500 mt-2">Error: {result.error.toString()}</p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-zinc-900 p-4 rounded-lg">
                    <h2 className="text-xl mb-2">Raw Debug Info</h2>
                    <pre className="text-xs overflow-auto max-h-96 bg-black p-3 rounded">
                        {JSON.stringify(debugInfo, (key, value) =>
                            typeof value === 'bigint' ? value.toString() : value
                            , 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
