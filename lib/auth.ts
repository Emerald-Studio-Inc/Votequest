import { createPublicClient, http } from 'viem';
import { mainnet, sepolia, polygon, polygonAmoy } from 'viem/chains';

// Create a public client for signature verification
// We use mainnet by default for ENS resolution, but signature verification is chain-agnostic
const publicClient = createPublicClient({
    chain: mainnet,
    transport: http(),
});

export async function verifySignature(
    message: string,
    signature: string,
    address: string
): Promise<boolean> {
    try {
        const valid = await publicClient.verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
        });
        return valid;
    } catch (error) {
        console.error('Error verifying signature:', error);
        return false;
    }
}

export function generateLoginMessage(address: string, nonce: string): string {
    return `Welcome to VoteQuest!

Please sign this message to verify your identity.
This action will not cost any gas.

Wallet: ${address}
Nonce: ${nonce}
Timestamp: ${new Date().toISOString()}`;
}
