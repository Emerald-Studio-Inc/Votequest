const hre = require("hardhat");

async function main() {
    console.log("=== Simple Deployment Test ===\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "MATIC\n");

    const VoteQuest = await hre.ethers.getContractFactory("VoteQuest");
    console.log("Deploying...");

    // Deploy without ANY gas options - let Hardhat handle everything
    const voteQuest = await VoteQuest.deploy();
    console.log("Waiting for deployment...");

    await voteQuest.waitForDeployment();
    const address = await voteQuest.getAddress();
    console.log("\n✅ Deployed at:", address);
}

main().catch(error => {
    console.error("\n❌ Error:", error.message || error);
    if (error.data) console.error("Data:", error.data);
    process.exit(1);
});
