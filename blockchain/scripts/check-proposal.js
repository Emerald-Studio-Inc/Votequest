const { createPublicClient, http } = require('viem');
const { polygonAmoy } = require('viem/chains');
const path = require('path');
const contractsPath = path.join(__dirname, '../../lib/contracts.ts');
// For .ts file, we need to read it differently
const VOTE_QUEST_ADDRESS = '0x77405d9D0a34D6eb59bC57dd5F434F8902CC5a5d';
const VOTE_QUEST_ABI = require('../../lib/VoteQuest.json').abi;

const client = createPublicClient({
    chain: polygonAmoy,
    transport: http(),
});

async function checkProposal(proposalId) {
    try {
        console.log(`\n🔍 Checking proposal #${proposalId} on Polygon Amoy blockchain...`);
        console.log(`Contract: ${VOTE_QUEST_ADDRESS}\n`);

        const proposal = await client.readContract({
            address: VOTE_QUEST_ADDRESS,
            abi: VOTE_QUEST_ABI,
            functionName: 'getProposal',
            args: [BigInt(proposalId)],
        });

        console.log('✅ Proposal exists on blockchain!');
        console.log('Title:', proposal.title);
        console.log('Description:', proposal.description);
        console.log('Deadline:', new Date(Number(proposal.deadline) * 1000).toISOString());
        console.log('Options:', proposal.options);
        console.log('Vote counts:', proposal.voteCounts.map(v => Number(v)));

    } catch (error) {
        console.error('❌ Proposal does NOT exist on blockchain!');
        console.error('Error:', error.message);
        console.error('\nThis means:');
        console.error('- Database has blockchain_id = 18');
        console.error('- But blockchain has no proposal #18');
        console.error('- The blockchain_id is wrong or proposal creation failed');
    }
}

const proposalId = process.argv[2] || 18;
checkProposal(proposalId);
