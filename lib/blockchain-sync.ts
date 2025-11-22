import { createPublicClient, http, Address } from 'viem';
import { polygonAmoy, sepolia } from 'viem/chains';
import { VOTE_QUEST_ABI } from './contracts';

// Get chain configuration based on chain ID
export function getChainConfig(chainId: number) {
    switch (chainId) {
        case 80002: // Polygon Amoy
            return {
                chain: polygonAmoy,
                rpcUrl: process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
            };
        case 11155111: // Sepolia
            return {
                chain: sepolia,
                rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
            };
        default:
            throw new Error(`Unsupported chain ID: ${chainId}`);
    }
}

// Create a public client for reading blockchain data
export function createBlockchainClient(chainId: number) {
    const config = getChainConfig(chainId);
    return createPublicClient({
        chain: config.chain,
        transport: http(config.rpcUrl),
    });
}

// Fetch proposal count from blockchain
export async function getProposalCount(
    contractAddress: Address,
    chainId: number
): Promise<number> {
    const client = createBlockchainClient(chainId);

    const count = await client.readContract({
        address: contractAddress,
        abi: VOTE_QUEST_ABI,
        functionName: 'proposalCount',
    });

    return Number(count);
}

// Fetch a single proposal from blockchain
export async function getProposalFromChain(
    contractAddress: Address,
    proposalId: number,
    chainId: number
) {
    const client = createBlockchainClient(chainId);

    const proposal = await client.readContract({
        address: contractAddress,
        abi: VOTE_QUEST_ABI,
        functionName: 'getProposal',
        args: [BigInt(proposalId)],
    }) as unknown as [bigint, string, string, bigint, readonly string[], readonly bigint[]];

    // Proposal is returned as a tuple: [id, title, description, deadline, options, voteCounts]
    return {
        id: Number(proposal[0]),
        title: proposal[1],
        description: proposal[2],
        deadline: Number(proposal[3]),
        options: proposal[4],
        voteCounts: proposal[5].map((count: bigint) => Number(count)),
    };
}

// Fetch all proposals from blockchain
export async function getAllProposalsFromChain(
    contractAddress: Address,
    chainId: number
) {
    const count = await getProposalCount(contractAddress, chainId);
    const proposals = [];

    for (let i = 1; i <= count; i++) {
        try {
            const proposal = await getProposalFromChain(contractAddress, i, chainId);
            proposals.push(proposal);
        } catch (error) {
            console.error(`Failed to fetch proposal ${i}:`, error);
        }
    }

    return proposals;
}

// Check if address has voted on a proposal
export async function hasUserVoted(
    contractAddress: Address,
    proposalId: number,
    userAddress: Address,
    chainId: number
): Promise<boolean> {
    const client = createBlockchainClient(chainId);

    const voted = await client.readContract({
        address: contractAddress,
        abi: VOTE_QUEST_ABI,
        functionName: 'hasVoted',
        args: [BigInt(proposalId), userAddress],
    });

    return voted as boolean;
}

// Get vote events for a proposal
export async function getVoteEvents(
    contractAddress: Address,
    proposalId: number,
    chainId: number
) {
    const client = createBlockchainClient(chainId);

    const logs = await client.getLogs({
        address: contractAddress,
        event: {
            type: 'event',
            name: 'VoteCast',
            inputs: [
                { type: 'uint256', indexed: true, name: 'proposalId' },
                { type: 'address', indexed: true, name: 'voter' },
                { type: 'uint256', indexed: false, name: 'optionIndex' },
            ],
        },
        args: {
            proposalId: BigInt(proposalId),
        },
        fromBlock: 'earliest',
        toBlock: 'latest',
    });

    return logs.map(log => ({
        proposalId: Number(log.args.proposalId),
        voter: log.args.voter,
        optionIndex: Number(log.args.optionIndex),
        blockNumber: Number(log.blockNumber),
        transactionHash: log.transactionHash,
    }));
}

// Sync blockchain data with Supabase
export async function syncProposalWithDatabase(
    contractAddress: Address,
    proposalId: number,
    chainId: number,
    supabaseProposalId: string
) {
    try {
        const chainProposal = await getProposalFromChain(contractAddress, proposalId, chainId);
        const voteEvents = await getVoteEvents(contractAddress, proposalId, chainId);

        // Return data for updating Supabase
        return {
            blockchainId: chainProposal.id,
            title: chainProposal.title,
            description: chainProposal.description,
            deadline: new Date(chainProposal.deadline * 1000).toISOString(),
            voteCounts: chainProposal.voteCounts,
            totalVotes: voteEvents.length,
            voters: voteEvents.map(e => ({ address: e.voter, option: e.optionIndex })),
        };
    } catch (error) {
        console.error('Failed to sync proposal:', error);
        throw error;
    }
}
