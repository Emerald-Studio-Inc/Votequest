import * as hre from "hardhat";

// @ts-ignore - ethers is available via hardhat-toolbox plugin
const ethers = hre.ethers;

async function main() {
    console.log("=== Starting deployment test ===");

    try {
        console.log("Step 1: Getting network info...");
        const network = await ethers.provider.getNetwork();
        console.log(`Network: ${network.name}, Chain ID: ${network.chainId}`);

        console.log("\nStep 2: Getting signers...");
        const [deployer] = await ethers.getSigners();
        console.log(`Deployer address: ${deployer.address}`);

        console.log("\nStep 3: Getting deployer balance...");
        const balance = await ethers.provider.getBalance(deployer.address);
        console.log(`Balance: ${ethers.formatEther(balance)} MATIC`);

        console.log("\nStep 4: Getting contract factory...");
        const VoteQuest = await ethers.getContractFactory("VoteQuest");
        console.log("Contract factory created successfully!");
        console.log(`Factory type: ${typeof VoteQuest}`);

        console.log("\nStep 5: Deploying contract...");
        const voteQuest = await VoteQuest.deploy();
        console.log("Deploy transaction submitted!");
        console.log(`Transaction hash: ${voteQuest.deploymentTransaction()?.hash}`);

        console.log("\nStep 6: Waiting for deployment...");
        await voteQuest.waitForDeployment();

        console.log("\nStep 7: Getting contract address...");
        const address = await voteQuest.getAddress();
        console.log(`✅ Contract deployed at: ${address}`);

    } catch (error: any) {
        console.error("\n❌ Error occurred:");
        console.error(`Message: ${error.message}`);
        console.error(`Code: ${error.code}`);
        console.error(`\nFull error:`);
        console.error(error);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
