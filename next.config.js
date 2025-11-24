/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
    webpack: (config, { isServer }) => {
        // Fix for transitive dependencies that are Node.js or React Native only
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                '@react-native-async-storage/async-storage': false,
                'react-native-async-storage': false,
                'pino-pretty': false,
                'encoding': false,
                'lokijs': false,
            };
        }
        return config;
    },
}

module.exports = nextConfig
