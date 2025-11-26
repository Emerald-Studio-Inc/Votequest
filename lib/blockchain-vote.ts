import { writeContract as wagmiWriteContract } from '@wagmi/core';
import { VOTE_QUEST_ADDRESS, VOTE_QUEST_ABI } from './contracts';
import { config } from './wagmi';

export interface BlockchainVoteResult {
    success: boolean;
    txHash?: string;
    error?: string;
    fallbackToDatabase: boolean;
}

/**
 * Attempt to vote on blockchain
 * Returns success status and optional transaction hash
 * If blockchain fails, returns fallbackToDatabase: true
 */
export async function attemptBlockchainVote(
    proposalBlockchainId: number,
    optionIndex: number,
    isConnected: boolean,
    walletAddress: string | undefined
): Promise<BlockchainVoteResult> {
    // Check if we should attempt blockchain vote
    if (!isConnected || !walletAddress) {
        return {
            success: false,
            fallbackToDatabase: true,
            error: 'Wallet not connected'
        };
    }

    try {
        console.log('[BLOCKCHAIN] Attempting vote on proposal:', proposalBlockchainId);

        // Initiate blockchain transaction
        const hash = await wagmiWriteContract(config, {
            address: VOTE_QUEST_ADDRESS,
            abi: VOTE_QUEST_ABI,
            functionName: 'vote',
            args: [BigInt(proposalBlockchainId), BigInt(optionIndex)],
        });

        console.log('[BLOCKCHAIN] Transaction submitted:', hash);

        return {
            success: true,
            txHash: hash,
            fallbackToDatabase: false
        };
    } catch (error: any) {
        console.warn('[BLOCKCHAIN] Transaction failed:', error.message);

        // Check if user rejected transaction
        if (error.message?.includes('User rejected') || error.message?.includes('rejected')) {
            return {
                success: false,
                fallbackToDatabase: true,
                error: 'User rejected transaction'
            };
        }

        // Other errors (gas, network, etc.) - fall back to database
        return {
            success: false,
            fallbackToDatabase: true,
            error: error.message || 'Blockchain transaction failed'
        };
    }
}

/**
 * Attempt to create proposal on blockchain
 */
export async function attemptBlockchainProposalCreation(
    title: string,
    description: string,
    durationInMinutes: number,
    options: string[],
    isConnected: boolean,
    walletAddress: string | undefined
): Promise<BlockchainVoteResult> {
    if (!isConnected || !walletAddress) {
        return {
            success: false,
            fallbackToDatabase: true,
            error: 'Wallet not connected'
        };
    }

    try {
        console.log('[BLOCKCHAIN] Creating proposal on blockchain...');

        const hash = await wagmiWriteContract(config, {
            address: VOTE_QUEST_ADDRESS,
            abi: VOTE_QUEST_ABI,
            functionName: 'createProposal',
            args: [title, description, BigInt(durationInMinutes), options],
        });

        console.log('[BLOCKCHAIN] Proposal creation transaction:', hash);

        return {
            success: true,
            txHash: hash,
            fallbackToDatabase: false
        };
    } catch (error: any) {
        console.warn('[BLOCKCHAIN] Proposal creation failed:', error.message);

        return {
            success: false,
            fallbackToDatabase: true,
            error: error.message || 'Blockchain transaction failed'
        };
    }
}
