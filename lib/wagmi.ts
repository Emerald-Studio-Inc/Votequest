import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonAmoy } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'VoteQuest',
    // Replace the placeholder with your RainbowKit project ID (from https://cloud.rainbow.me/)
    // For testing you can use a dummy ID like 'test-project-id'
    projectId: 'test-project-id',
    chains: [polygon, polygonAmoy],
    ssr: true, // If your dApp uses server side rendering (SSR)
});
