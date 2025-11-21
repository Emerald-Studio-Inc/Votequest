import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonAmoy } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'VoteQuest',
    projectId: 'YOUR_PROJECT_ID',
    chains: [polygon, polygonAmoy],
    ssr: true, // If your dApp uses server side rendering (SSR)
});
