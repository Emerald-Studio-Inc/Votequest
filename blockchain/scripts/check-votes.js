const hre = require("hardhat");

async function main() {
    const contractAddress = "0xcf576bd6a1CC6b7dC4bcE1AF68540aFfD3aa3ef2";

    console.log("Checking votes on VoteQuest contract...\n");

    const VoteQuest = await hre.ethers.getContractAt("VoteQuest", contractAddress);

    try {
        const count = await VoteQuest.proposalCount();
        console.log(`Total proposals: ${count}\n`);

        for (let i = 1; i <= Number(count); i++) {
            const proposal = await VoteQuest.getProposal(i);
            console.log(`📊 Proposal #${i}: ${proposal.title}`);
            console.log(`   Options: ${proposal.options.join(", ")}`);
            console.log(`   Vote counts: ${proposal.voteCounts.map(v => v.toString()).join(", ")}`);

            const totalVotes = proposal.voteCounts.reduce((acc, v) => acc + v, 0n);
            console.log(`   Total votes: ${totalVotes}`);

            if (totalVotes > 0n) {
                console.log(`   ✅ Has votes!`);
            }
            console.log("");
        }

        console.log("\n🔗 View all events on Etherscan:");
        console.log(`https://sepolia.etherscan.io/address/${contractAddress}#events`);

    } catch (error) {
        console.error("Error:", error.message);
    }
}

main().catch(console.error);
