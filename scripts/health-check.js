#!/usr/bin/env node
/**
 * VoteQuest System Health Check
 * Automatically verifies all systems are working
 */

const { createPublicClient, http } = require('viem');
const { polygonAmoy } = require('viem/chains');

const VOTE_QUEST_ADDRESS = '0x77405d9D0a34D6eb59bC57dd5F434F8902CC5a5d';
const VOTE_QUEST_ABI = require('../lib/VoteQuest.json').abi;

const client = createPublicClient({
    chain: polygonAmoy,
    transport: http(),
});

async function healthCheck() {
    console.log('\n🏥 VoteQuest System Health Check\n');
    console.log('='.repeat(50));

    let allGood = true;

    // Test 1: Blockchain Connection
    try {
        const proposalCount = await client.readContract({
            address: VOTE_QUEST_ADDRESS,
            abi: VOTE_QUEST_ABI,
            functionName: 'proposalCount',
        });
        console.log('\n✅ Blockchain Connection: OK');
        console.log(`   Total blockchain proposals: ${proposalCount}`);
    } catch (error) {
        console.log('\n❌ Blockchain Connection: FAILED');
        console.log(`   Error: ${error.message}`);
        allGood = false;
    }

    // Test 2: Check latest proposal exists
    try {
        const proposal18 = await client.readContract({
            address: VOTE_QUEST_ADDRESS,
            abi: VOTE_QUEST_ABI,
            functionName: 'getProposal',
            args: [BigInt(18)],
        });
        console.log('\n✅ Latest Proposal (#18): EXISTS');
        console.log(`   Title: ${proposal18.title}`);
    } catch (error) {
        console.log('\n❌ Latest Proposal (#18): NOT FOUND');
        allGood = false;
    }

    // Test 3:Check if user can vote
    try {
        const userAddress = '0xA7BA23b07deE73Bba9B6C01191a43e315338e0A6';
        const hasVoted = await client.readContract({
            address: VOTE_QUEST_ADDRESS,
            abi: VOTE_QUEST_ABI,
            functionName: 'hasVoted',
            args: [BigInt(18), userAddress],
        });

        if (hasVoted) {
            console.log('\n⚠️  Voting Status: Already voted on #18');
            console.log('   Try voting on proposal #8, 9, 10, 12, 14, 16, or 17 instead');
        } else {
            console.log('\n✅ Voting Status: Ready to vote on #18');
        }
    } catch (error) {
        console.log('\n❌ Voting Status Check: FAILED');
        allGood = false;
    }

    console.log('\n' + '='.repeat(50));

    if (allGood) {
        console.log('\n🎉 ALL SYSTEMS OPERATIONAL\n');
        console.log('Next steps:');
        console.log('1. Go to http://localhost:3000');
        console.log('2. Vote on any blockchain proposal');
        console.log('3. Vote should work now!\n');
    } else {
        console.log('\n⚠️  SOME ISSUES DETECTED\n');
        console.log('Review errors above for details.\n');
    }
}

healthCheck().catch(console.error);
