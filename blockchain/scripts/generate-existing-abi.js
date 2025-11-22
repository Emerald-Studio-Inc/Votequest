const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const contractAddress = "0x77405d9D0a34D6eb59bC57dd5F434F8902CC5a5d";
    const network = "amoy";
    const chainId = 80002;

    console.log("Generating deployment info for existing contract...");
    console.log(`Address: ${contractAddress}`);
    console.log(`Network: ${network}`);
    console.log(`Chain ID: ${chainId}\n`);

    // Verify contract exists
    const code = await hre.ethers.provider.getCode(contractAddress);
    if (code === "0x") {
        console.error("❌ No contract found at this address!");
        process.exit(1);
    }

    console.log("✅ Contract verified on-chain");

    // Get contract info
    const VoteQuest = await hre.ethers.getContractAt("VoteQuest", contractAddress);
    const proposalCount = await VoteQuest.proposalCount();
    console.log(`Proposal count: ${proposalCount}\n`);

    // Save deployment info
    const deploymentInfo = {
        address: contractAddress,
        network: network,
        chainId: chainId,
        blockNumber: "unknown", // existing deployment
        timestamp: new Date().toISOString(),
        contractName: "VoteQuest",
        note: "Using existing deployed contract"
    };

    fs.writeFileSync("deployed_address.txt", contractAddress);
    fs.writeFileSync(
        "deployment_info.json",
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("📝 Deployment info saved:");
    console.log("   - deployed_address.txt");
    console.log("   - deployment_info.json");

    // Copy ABI to frontend
    const artifactPath = path.join(__dirname, "../artifacts/contracts/VoteQuest.sol/VoteQuest.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const abiExport = {
        address: contractAddress,
        abi: artifact.abi,
        network: network,
        chainId: chainId
    };

    const frontendLibPath = path.join(__dirname, "../../lib");
    if (!fs.existsSync(frontendLibPath)) {
        fs.mkdirSync(frontendLibPath, { recursive: true });
    }

    fs.writeFileSync(
        path.join(frontendLibPath, "VoteQuest.json"),
        JSON.stringify(abiExport, null, 2)
    );

    console.log("   - ../lib/VoteQuest.json (for frontend)");

    console.log("\n✅ Frontend integration files generated!");
    console.log("\n📊 View on PolygonScan:");
    console.log(`   https://amoy.polygonscan.com/address/${contractAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
