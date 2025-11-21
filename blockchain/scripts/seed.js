const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const address = fs.readFileSync("deployed_address.txt", "utf8").trim();
    console.log(`Attaching to contract at ${address}...`);

    const VoteQuest = await hre.ethers.getContractFactory("VoteQuest");
    const voteQuest = VoteQuest.attach(address);

    console.log("Creating seed proposal...");
    const tx = await voteQuest.createProposal(
        "Should we adopt a 4-day work week?",
        "Proposal to transition the company to a 4-day work week (32 hours) with no reduction in pay.",
        10080, // 7 days in minutes
        ["Yes", "No", "Abstain"]
    );

    console.log(`Transaction sent: ${tx.hash}`);
    await tx.wait();
    console.log("Proposal created successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
