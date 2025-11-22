const hre = require("hardhat");

async function main() {
    const contractAddress = "0xcf576bd6a1CC6b7dC4bcE1AF68540aFfD3aa3ef2";

    console.log("Checking VoteQuest contract on Sepolia...\n");

    const VoteQuest = await hre.ethers.getContractAt("VoteQuest", contractAddress);

    try {
        // Get proposal count
        const count = await VoteQuest.proposalCount();
        console.log(`Total proposals: ${count}\n`);

        if (count > 0n) {
            console.log("Proposals found! Fetching details...\n");

            // Fetch all proposals
            for (let i = 1; i <= Number(count); i++) {
                const proposal = await VoteQuest.getProposal(i);
                console.log(`Proposal #${i}:`);
                console.log(`  Title: ${proposal.title}`);
                console.log(`  Description: ${proposal.description}`);
                console.log(`  Deadline: ${new Date(Number(proposal.deadline) * 1000).toLocaleString()}`);
                console.log(`  Options: ${proposal.options.join(", ")}`);
                console.log(`  Vote counts: ${proposal.voteCounts.map(v => v.toString()).join(", ")}`);
                console.log("");
            }
        } else {
            console.log("❌ No proposals found on-chain.");
            console.log("\nThis means either:");
            console.log("1. The transaction failed (check MetaMask for 'Failed' status)");
            console.log("2. The transaction is still pending");
            console.log("3. You haven't created a proposal yet");
        }

    } catch (error) {
        console.error("Error fetching proposals:", error.message);
    }
}

main().catch(console.error);
