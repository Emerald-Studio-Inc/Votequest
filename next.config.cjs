/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    webpack: (config, { isServer }) => {
        // Fix for @react-native-async-storage missing in MetaMask SDK
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                '@react-native-async-storage/async-storage': false,
            };
        }
        return config;
    },
}

module.exports = nextConfig
