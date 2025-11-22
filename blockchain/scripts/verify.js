const hre = require("hardhat");

async function main() {
    const contractAddress = process.argv[2];

    if (!contractAddress) {
        console.error("❌ Please provide contract address as argument");
        console.log("Usage: npx hardhat run scripts/verify.js --network <network> <contract-address>");
        process.exit(1);
    }

    console.log(`Verifying contract at ${contractAddress}...`);

    try {
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: [], // VoteQuest has no constructor arguments
        });
        console.log("✅ Contract verified successfully!");
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contract already verified!");
        } else {
            console.error("❌ Verification failed:", error);
        }
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
