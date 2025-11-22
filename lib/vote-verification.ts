import { Address, Hash } from 'viem';
import { createBlockchainClient, hasUserVoted, getVoteEvents } from './blockchain-sync';

export interface VoteVerificationResult {
    isVerified: boolean;
    onChain: boolean;
    transactionHash?: Hash;
    blockNumber?: number;
    timestamp?: number;
    error?: string;
}

/**
 * Verify that a vote was successfully recorded on the blockchain
 */
export async function verifyVote(
    contractAddress: Address,
    proposalId: number,
    voterAddress: Address,
    expectedOption: number,
    chainId: number,
    transactionHash?: Hash
): Promise<VoteVerificationResult> {
    try {
        // Step 1: Check if user has voted according to the contract
        const voted = await hasUserVoted(contractAddress, proposalId, voterAddress, chainId);

        if (!voted) {
            return {
                isVerified: false,
                onChain: false,
                error: 'Vote not found in contract storage',
            };
        }

        // Step 2: Verify via events
        const voteEvents = await getVoteEvents(contractAddress, proposalId, chainId);
        const userVoteEvent = voteEvents.find(
            event => event.voter && event.voter.toLowerCase() === voterAddress.toLowerCase()
        );

        if (!userVoteEvent) {
            return {
                isVerified: false,
                onChain: true,
                error: 'Vote recorded but event not found (this is unusual)',
            };
        }

        // Step 3: Verify the option matches
        if (userVoteEvent.optionIndex !== expectedOption) {
            return {
                isVerified: false,
                onChain: true,
                error: `Option mismatch: expected ${expectedOption}, got ${userVoteEvent.optionIndex}`,
            };
        }

        // Step 4: If transaction hash provided, verify it matches
        if (transactionHash && userVoteEvent.transactionHash.toLowerCase() !== transactionHash.toLowerCase()) {
            return {
                isVerified: false,
                onChain: true,
                error: 'Transaction hash mismatch',
            };
        }

        // Step 5: Get block timestamp
        const client = createBlockchainClient(chainId);
        const block = await client.getBlock({ blockNumber: BigInt(userVoteEvent.blockNumber) });

        return {
            isVerified: true,
            onChain: true,
            transactionHash: userVoteEvent.transactionHash,
            blockNumber: userVoteEvent.blockNumber,
            timestamp: Number(block.timestamp),
        };
    } catch (error) {
        console.error('Vote verification error:', error);
        return {
            isVerified: false,
            onChain: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Verify proposal creation
 */
export async function verifyProposalCreation(
    contractAddress: Address,
    proposalId: number,
    chainId: number,
    transactionHash?: Hash
): Promise<VoteVerificationResult> {
    try {
        const client = createBlockchainClient(chainId);

        // Get ProposalCreated events
        const logs = await client.getLogs({
            address: contractAddress,
            event: {
                type: 'event',
                name: 'ProposalCreated',
                inputs: [
                    { type: 'uint256', indexed: true, name: 'id' },
                    { type: 'string', indexed: false, name: 'title' },
                    { type: 'uint256', indexed: false, name: 'deadline' },
                ],
            },
            args: {
                id: BigInt(proposalId),
            },
            fromBlock: 'earliest',
            toBlock: 'latest',
        });

        if (logs.length === 0) {
            return {
                isVerified: false,
                onChain: false,
                error: 'Proposal creation event not found',
            };
        }

        const proposalEvent = logs[0];
        const block = await client.getBlock({ blockNumber: proposalEvent.blockNumber });

        return {
            isVerified: true,
            onChain: true,
            transactionHash: proposalEvent.transactionHash,
            blockNumber: Number(proposalEvent.blockNumber),
            timestamp: Number(block.timestamp),
        };
    } catch (error) {
        console.error('Proposal verification error:', error);
        return {
            isVerified: false,
            onChain: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

/**
 * Get vote tallies and verify against blockchain
 */
export async function verifyVoteTally(
    contractAddress: Address,
    proposalId: number,
    chainId: number,
    expectedTotals?: number[]
): Promise<{
    verified: boolean;
    onChainTotals: number[];
    discrepancies: { optionIndex: number; expected: number; actual: number }[];
}> {
    try {
        const client = createBlockchainClient(chainId);

        // Get vote counts from contract
        const proposal = await client.readContract({
            address: contractAddress,
            abi: [
                {
                    inputs: [{ internalType: 'uint256', name: '_proposalId', type: 'uint256' }],
                    name: 'getProposal',
                    outputs: [
                        {
                            components: [
                                { internalType: 'uint256', name: 'id', type: 'uint256' },
                                { internalType: 'string', name: 'title', type: 'string' },
                                { internalType: 'string', name: 'description', type: 'string' },
                                { internalType: 'uint256', name: 'deadline', type: 'uint256' },
                                { internalType: 'string[]', name: 'options', type: 'string[]' },
                                { internalType: 'uint256[]', name: 'voteCounts', type: 'uint256[]' },
                            ],
                            internalType: 'struct VoteQuest.ProposalView',
                            name: '',
                            type: 'tuple',
                        },
                    ],
                    stateMutability: 'view',
                    type: 'function',
                },
            ],
            functionName: 'getProposal',
            args: [BigInt(proposalId)],
        });

        const onChainTotals = (proposal as any)[5].map((count: bigint) => Number(count));

        if (!expectedTotals) {
            return {
                verified: true,
                onChainTotals,
                discrepancies: [],
            };
        }

        // Check for discrepancies
        const discrepancies = [];
        for (let i = 0; i < expectedTotals.length; i++) {
            if (expectedTotals[i] !== onChainTotals[i]) {
                discrepancies.push({
                    optionIndex: i,
                    expected: expectedTotals[i],
                    actual: onChainTotals[i],
                });
            }
        }

        return {
            verified: discrepancies.length === 0,
            onChainTotals,
            discrepancies,
        };
    } catch (error) {
        console.error('Vote tally verification error:', error);
        return {
            verified: false,
            onChainTotals: [],
            discrepancies: [],
        };
    }
}
