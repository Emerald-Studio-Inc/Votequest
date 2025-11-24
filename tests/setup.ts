import '@testing-library/jest-dom';

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
    supabase: {
        from: jest.fn(() => ({
            select: jest.fn(() => Promise.resolve({ data: [], error: null })),
            insert: jest.fn(() => Promise.resolve({ data: null, error: null })),
            update: jest.fn(() => Promise.resolve({ data: null, error: null })),
            delete: jest.fn(() => Promise.resolve({ data: null, error: null })),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockReturnThis(),
        })),
    },
}));

// Mock RainbowKit
jest.mock('wagmi', () => ({
    useAccount: () => ({
        address: '0x1234567890123456789012345678901234567890',
        isConnected: true,
    }),
    useConnect: () => ({
        connect: jest.fn(),
        connectors: [],
    }),
    useDisconnect: () => ({
        disconnect: jest.fn(),
    }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});
