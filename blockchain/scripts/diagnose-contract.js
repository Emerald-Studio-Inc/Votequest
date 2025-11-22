const hre = require("hardhat");

async function main() {
    const contractAddress = "0xcf576bd6a1CC6b7dC4bcE1AF68540aFfD3aa3ef2";

    console.log("Checking Sepolia contract status...\n");
    console.log(`Contract: ${contractAddress}`);
    console.log(`Network: Sepolia (Chain ID: 11155111)\n`);

    // Check if contract exists
    const code = await hre.ethers.provider.getCode(contractAddress);

    if (code === "0x") {
        console.log("❌ ERROR: No contract found at this address!");
        console.log("The contract may not have been deployed correctly.");
        return;
    }

    console.log("✅ Contract exists on Sepolia");
    console.log(`   Code size: ${(code.length - 2) / 2} bytes\n`);

    // Try to interact with it
    try {
        const VoteQuest = await hre.ethers.getContractAt("VoteQuest", contractAddress);

        const proposalCount = await VoteQuest.proposalCount();
        console.log(`✅ Contract is functional`);
        console.log(`   Proposal count: ${proposalCount}\n`);

        // Try to estimate gas for creating a proposal
        console.log("Testing gas estimation for createProposal...");
        const gasEstimate = await VoteQuest.createProposal.estimateGas(
            "Test Proposal",
            "This is a test",
            60, // 60 minutes
            ["Option A", "Option B"]
        );

        console.log(`✅ Gas estimation successful`);
        console.log(`   Estimated gas: ${gasEstimate.toString()}\n`);

        console.log("✅ All checks passed! Contract is working correctly.");

    } catch (error) {
        console.error("\n❌ Error interacting with contract:");
        console.error(error.message);

        if (error.code === 'CALL_EXCEPTION') {
            console.error("\nThis might indicate:");
            console.error("- Wrong contract ABI");
            console.error("- Contract has a bug");
            console.error("- Contract is paused or has restrictions");
        }
    }
}

main().catch(console.error);
