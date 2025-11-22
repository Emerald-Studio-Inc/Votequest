const hre = require("hardhat");

async function main() {
    const contractAddress = "0x77405d9D0a34D6eb59bC57dd5F434F8902CC5a5d";

    console.log("Checking contract at:", contractAddress);
    console.log("Network: Polygon Amoy\n");

    // Check if contract exists
    const code = await hre.ethers.provider.getCode(contractAddress);

    if (code === "0x") {
        console.log("❌ No contract found at this address");
        return;
    }

    console.log("✅ Contract exists!");
    console.log(`Code size: ${code.length} bytes\n`);

    // Try to interact with it
    const VoteQuest = await hre.ethers.getContractAt("VoteQuest", contractAddress);

    try {
        const proposalCount = await VoteQuest.proposalCount();
        console.log(`Proposal count: ${proposalCount}`);
        console.log("\n✅ Contract is functional and accessible!");

        // If there are proposals, show the first one
        if (proposalCount > 0n) {
            console.log("\nFetching first proposal...");
            const proposal = await VoteQuest.getProposal(1);
            console.log(`Title: ${proposal.title}`);
            console.log(`Description: ${proposal.description}`);
            console.log(`Options: ${proposal.options.join(", ")}`);
            console.log(`Vote counts: ${proposal.voteCounts.map(c => c.toString()).join(", ")}`);
        }
    } catch (error) {
        console.error("❌ Error interacting with contract:", error.message);
    }
}

main().catch(console.error);
