const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const VoteQuest = await hre.ethers.getContractFactory("VoteQuest");
    const voteQuest = await VoteQuest.deploy();

    await voteQuest.waitForDeployment();

    const address = voteQuest.target;
    console.log(`VoteQuest deployed to ${address}`);
    fs.writeFileSync("deployed_address.txt", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
