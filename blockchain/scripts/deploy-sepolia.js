const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying Vote Quest contract to Sepolia...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

    const VoteQuest = await hre.ethers.getContractFactory("VoteQuest");
    const voteQuest = await VoteQuest.deploy();

    console.log("Deployment transaction sent...");
    await voteQuest.waitForDeployment();

    const address = await voteQuest.getAddress();
    const network = await (await hre.ethers.provider.getNetwork()).name;
    const chainId = (await hre.ethers.provider.getNetwork()).chainId;
    const deployBlock = await hre.ethers.provider.getBlockNumber();

    console.log("\n✅ Contract deployed successfully!");
    console.log(`   Address: ${address}`);
    console.log(`   Network: ${network} (Chain ID: ${chainId})`);
    console.log(`   Block: ${deployBlock}`);

    // Save deployment info
    const deploymentInfo = {
        address: address,
        network: "sepolia",
        chainId: Number(chainId),
        blockNumber: deployBlock,
        timestamp: new Date().toISOString(),
        contractName: "VoteQuest"
    };

    fs.writeFileSync("deployed_address.txt", address);
    fs.writeFileSync("deployment_info.json", JSON.stringify(deploymentInfo, null, 2));

    // Copy ABI to frontend
    const artifactPath = path.join(__dirname, "../artifacts/contracts/VoteQuest.sol/VoteQuest.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const abiExport = {
        address: address,
        abi: artifact.abi,
        network: "sepolia",
        chainId: Number(chainId)
    };

    const frontendLibPath = path.join(__dirname, "../../lib");
    fs.writeFileSync(
        path.join(frontendLibPath, "VoteQuest.json"),
        JSON.stringify(abiExport, null, 2)
    );

    console.log("\n📝 Files saved:");
    console.log("   - deployed_address.txt");
    console.log("   - deployment_info.json");
    console.log("   - ../lib/VoteQuest.json");

    console.log("\n📊 View on Etherscan:");
    console.log(`   https://sepolia.etherscan.io/address/${address}`);

    console.log("\n🔍 Verify contract:");
    console.log(`   npx hardhat verify --network sepolia ${address}`);
}

main().catch(console.error);
