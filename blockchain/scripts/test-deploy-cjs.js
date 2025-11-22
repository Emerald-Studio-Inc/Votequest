const hre = require("hardhat");

async function main() {
    console.log("=== Checking deployment requirements ===");

    try {
        const [deployer] = await hre.ethers.getSigners();
        const balance = await hre.ethers.provider.getBalance(deployer.address);

        console.log(`Deployer: ${deployer.address}`);
        console.log(`Balance: ${hre.ethers.formatEther(balance)} MATIC`);

        // Get contract factory
        const VoteQuest = await hre.ethers.getContractFactory("VoteQuest");

        // Estimate deployment gas
        console.log("\nEstimating deployment cost...");
        const deploymentData = VoteQuest.interface.encodeDeploy([]);
        const gasEstimate = await hre.ethers.provider.estimateGas({
            data: VoteQuest.bytecode + deploymentData.slice(2)
        });

        console.log(`Estimated gas: ${gasEstimate.toString()}`);

        // Get current gas price
        const feeData = await hre.ethers.provider.getFeeData();
        console.log(`Gas price: ${hre.ethers.formatUnits(feeData.gasPrice || 0n, "gwei")} gwei`);

        const estimatedCost = gasEstimate * (feeData.gasPrice || 0n);
        console.log(`Estimated cost: ${hre.ethers.formatEther(estimatedCost)} MATIC`);

        if (balance < estimatedCost * 2n) {
            console.warn("\n⚠️  WARNING: Balance might be insufficient!");
            console.warn(`You have: ${hre.ethers.formatEther(balance)} MATIC`);
            console.warn(`Estimated need: ${hre.ethers.formatEther(estimatedCost * 2n)} MATIC (with 2x buffer)`);
        }

        // Deploy with explicit gas settings
        console.log("\nDeploying contract with explicit gas settings...");
        const voteQuest = await VoteQuest.deploy({
            gasLimit: gasEstimate * 120n / 100n, // 20% buffer
        });

        console.log("✅ Deployment transaction sent!");
        console.log(`Transaction hash: ${voteQuest.deploymentTransaction()?.hash}`);

        console.log("\nWaiting for confirmation...");
        await voteQuest.waitForDeployment();

        const address = await voteQuest.getAddress();
        console.log(`\n🎉 Contract deployed at: ${address}`);

        return address;

    } catch (error) {
        console.error("\n❌ Deployment failed:");
        console.error("Message:", error.message);
        if (error.code) console.error("Code:", error.code);
        if (error.reason) console.error("Reason:", error.reason);
        if (error.data) console.error("Data:", error.data);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
