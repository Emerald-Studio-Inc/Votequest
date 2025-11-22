'use client';

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { VOTE_QUEST_ADDRESS, VOTE_QUEST_ABI } from '@/lib/contracts';
import { useState } from 'react';

export default function TestProposal() {
    const { address, chain } = useAccount();
    const [status, setStatus] = useState('');
    const { writeContract, data: hash, error, isPending } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

    const testSimpleProposal = async () => {
        setStatus('Starting...');
        try {
            console.log('Chain:', chain?.id);
            console.log('Address:', address);
            console.log('Contract:', VOTE_QUEST_ADDRESS);

            setStatus('Calling writeContract...');
            writeContract({
                address: VOTE_QUEST_ADDRESS,
                abi: VOTE_QUEST_ABI,
                functionName: 'createProposal',
                args: [
                    "Test Proposal",
                    "This is a simple test",
                    BigInt(60), // 60 minutes
                    ["Yes", "No"]
                ],
            });
            setStatus('Transaction sent to MetaMask!');
        } catch (err: any) {
            console.error('Error:', err);
            setStatus(`Error: ${err.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <h1 className="text-2xl mb-4">Test Proposal Creation</h1>

            <div className="space-y-4 mb-8">
                <p>Connected: {address ? '✅' : '❌'}</p>
                <p>Network: {chain?.name || 'Not connected'}</p>
                <p>Chain ID: {chain?.id || 'N/A'} (should be 11155111 for Sepolia)</p>
                <p>Contract: {VOTE_QUEST_ADDRESS}</p>
            </div>

            <button
                onClick={testSimpleProposal}
                disabled={isPending || !address}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg disabled:opacity-50"
            >
                {isPending ? 'Check MetaMask...' : 'Test Create Proposal'}
            </button>

            <div className="mt-8 space-y-2">
                <p>Status: {status}</p>
                {isPending && <p className="text-yellow-500">⏳ Waiting for user confirmation...</p>}
                {isConfirming && <p className="text-blue-500">⏳ Confirming transaction...</p>}
                {isConfirmed && <p className="text-green-500">✅ Transaction confirmed!</p>}
                {error && (
                    <div className="text-red-500">
                        <p>❌ Error: {error.message}</p>
                    </div>
                )}
                {hash && <p className="text-sm break-all">Transaction: {hash}</p>}
            </div>

            <div className="mt-8 p-4 bg-zinc-900 rounded-lg">
                <h2 className="text-lg mb-2">Console Logs</h2>
                <p className="text-sm text-zinc-400">Open browser console (F12) to see detailed logs</p>
            </div>
        </div>
    );
}
