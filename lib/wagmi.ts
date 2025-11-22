import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonAmoy, sepolia } from 'viem/chains';

export const config = getDefaultConfig({
    appName: 'VoteQuest',
    // Replace the placeholder with your RainbowKit project ID (from https://cloud.rainbow.me/)
    // For testing you can use a dummy ID like 'test-project-id'
    projectId: 'test-project-id',
    chains: [sepolia, polygonAmoy, polygon], // Sepolia first since contract is deployed there
    ssr: true, // If your dApp uses server side rendering (SSR)
});
