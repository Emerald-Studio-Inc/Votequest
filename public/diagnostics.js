// Add this to your browser console to check what's happening

console.log("=== VoteQuest Diagnostics ===");
console.log("Contract Address:", "0xcf576bd6a1CC6b7dC4bcE1AF68540aFfD3aa3ef2");
console.log("Expected Network: Sepolia (Chain ID: 11155111)");
console.log("\nTo check your current network:");
console.log("1. Open MetaMask");
console.log("2. Look at the network name at the top");
console.log("3. It should say 'Sepolia'");
console.log("\nIf you see any other network (Ethereum Mainnet, Polygon, etc.),");
console.log("then that's why the transaction is stuck!");
console.log("\n=== Quick Fix ===");
console.log("1. Click MetaMask extension");
console.log("2. Click network dropdown");
console.log("3. Select 'Sepolia Test Network'");
console.log("4. Refresh this page");
console.log("\n=== Check wallet connection ===");
if (typeof window !== 'undefined' && window.ethereum) {
    window.ethereum.request({ method: 'eth_chainId' })
        .then((chainId) => {
            const decimalChainId = parseInt(chainId, 16);
            console.log(`\nCurrent Chain ID: ${decimalChainId}`);
            if (decimalChainId === 11155111) {
                console.log("✅ CORRECT! You're on Sepolia");
            } else {
                console.log("❌ WRONG NETWORK!");
                console.log(`You're on chain ${decimalChainId}, but VoteQuest is deployed on Sepolia (11155111)`);
                console.log("\nSwitch to Sepolia in MetaMask and try again!");
            }
        })
        .catch(console.error);
} else {
    console.log("❌ No wallet detected");
}
