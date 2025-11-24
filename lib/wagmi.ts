import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygonAmoy, sepolia } from 'viem/chains';
import { createConfig, http } from 'wagmi';
import { mock } from 'wagmi/connectors';

// Export config based on environment
export const config = process.env.NEXT_PUBLIC_TEST_MODE === 'true'
    ? createConfig({
        chains: [polygonAmoy, sepolia],
        transports: {
            [polygonAmoy.id]: http(),
            [sepolia.id]: http(),
        },
        connectors: [
            mock({
                accounts: ['0x71C7656EC7ab88b098defB751B7401B5f6d8976F'],
                features: {
                    reconnect: true,
                },
            }),
        ],
    })
    : getDefaultConfig({
        appName: 'VoteQuest',
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '01b4f422f856bbd18cb7cca5595d0df0',
        chains: [polygonAmoy, sepolia],
        ssr: true,
    });
