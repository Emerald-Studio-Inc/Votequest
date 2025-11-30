const { createPublicClient, http } = require('viem');
const { polygonAmoy } = require('viem/chains');
const VOTE_QUEST_ADDRESS = '0x77405d9D0a34D6eb59bC57dd5F434F8902CC5a5d';
const VOTE_QUEST_ABI = require('../../lib/VoteQuest.json').abi;

const client = createPublicClient({
    chain: polygonAmoy,
    transport: http(),
});

async function checkIfVoted(proposalId, voterAddress) {
    try {
        console.log(`\n🔍 Checking if ${voterAddress} voted on proposal #${proposalId}...\n`);

        const hasVoted = await client.readContract({
            address: VOTE_QUEST_ADDRESS,
            abi: VOTE_QUEST_ABI,
            functionName: 'hasVoted',
            args: [BigInt(proposalId), voterAddress],
        });

        if (hasVoted) {
            console.log('✅ YES - You already voted on this proposal on-chain');
            console.log('This is why the vote transaction is failing!');
            console.log('The smart contract prevents double voting.');
        } else {
            console.log('❌ NO - You have NOT voted on this proposal yet');
            console.log('The blockchain should accept your vote...');
            console.log('The error must be something else!');
        }

    } catch (error) {
        console.error('Error checking vote status:', error.message);
    }
}

const proposalId = process.argv[2] || 18;
const voterAddress = process.argv[3] || '0xA7BA23b07deE73Bba9B6C01191a43e315338e0A6';
checkIfVoted(proposalId, voterAddress);
