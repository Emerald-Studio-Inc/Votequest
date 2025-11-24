import * as hre from "hardhat";
import * as fs from "fs";
import * as path from "path";

// @ts-ignore - ethers is available via hardhat-toolbox plugin
const ethers = hre.ethers;

async function main() {
    console.log("Deploying VoteQuest contract...");

    try {
        const VoteQuest = await ethers.getContractFactory("VoteQuest");
        console.log("Contract factory created, deploying...");

        const voteQuest = await VoteQuest.deploy();
        console.log("Deployment transaction sent, waiting for confirmation...");

        await voteQuest.waitForDeployment();
        console.log("Deployment confirmed!");

        const address = await voteQuest.getAddress();
        const network = (await ethers.provider.getNetwork()).name;
        const chainId = (await ethers.provider.getNetwork()).chainId;
        const deployBlock = await ethers.provider.getBlockNumber();

        console.log(`\n✅ VoteQuest deployed successfully!`);
        console.log(`   Address: ${address}`);
        console.log(`   Network: ${network} (Chain ID: ${chainId})`);
        console.log(`   Block: ${deployBlock}`);

        // Save deployment info
        const deploymentInfo = {
            address: address,
            network: network,
            chainId: Number(chainId),
            blockNumber: deployBlock,
            timestamp: new Date().toISOString(),
            contractName: "VoteQuest"
        };

        fs.writeFileSync("deployed_address.txt", address);
        fs.writeFileSync(
            "deployment_info.json",
            JSON.stringify(deploymentInfo, null, 2)
        );

        // Copy ABI to frontend
        const artifactPath = path.join(__dirname, "../artifacts/contracts/VoteQuest.sol/VoteQuest.json");
        const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

        const abiExport = {
            address: address,
            abi: artifact.abi,
            network: network,
            chainId: Number(chainId)
        };

        const frontendLibPath = path.join(__dirname, "../../lib");
        if (!fs.existsSync(frontendLibPath)) {
            fs.mkdirSync(frontendLibPath, { recursive: true });
        }

        fs.writeFileSync(
            path.join(frontendLibPath, "VoteQuest.json"),
            JSON.stringify(abiExport, null, 2)
        );

        console.log("\n📝 Deployment info saved:");
        console.log("   - deployed_address.txt");
        console.log("   - deployment_info.json");
        console.log("   - ../lib/VoteQuest.json (for frontend)");

        console.log("\n🔍 Verify contract with:");
        console.log(`   npx hardhat verify --network ${network} ${address}`);

        console.log("\n📊 View on block explorer:");
        const networkName = await (await ethers.provider.getNetwork()).name;
        if (networkName.includes('amoy') || chainId === BigInt(80002)) {
            console.log(`   https://amoy.polygonscan.com/address/${address}`);
        } else if (networkName.includes('sepolia') || chainId === BigInt(11155111)) {
            console.log(`   https://sepolia.etherscan.io/address/${address}`);
        }
    } catch (error) {
        console.error("\n❌ Deployment failed:");
        console.error(error);
        throw error;
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
