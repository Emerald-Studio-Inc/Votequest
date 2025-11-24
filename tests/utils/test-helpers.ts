import { Page } from '@playwright/test';

// Mock data generators
export const generateUser = (overrides = {}) => ({
    id: 'user-123',
    wallet_address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', // Matches mock connector
    level: 5,
    xp: 1000,
    voting_power: 100,
    coins: 500,
    ...overrides,
});

export const generateProposal = (overrides = {}) => ({
    id: 'prop-123',
    title: 'Test Proposal',
    description: 'This is a test proposal description',
    status: 'active',
    end_date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    created_by: 'user-123',
    options: [
        { id: 'opt-1', title: 'Option 1', votes: 10 },
        { id: 'opt-2', title: 'Option 2', votes: 5 },
    ],
    ...overrides,
});

// Helper to mock Supabase responses in Playwright
export async function mockSupabaseResponse(page: Page, urlPattern: string, responseData: any) {
    await page.route(`**/${urlPattern}*`, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(responseData),
        });
    });
}

// Helper to wait for wallet to be connected and dashboard to load
// In Test Mode, app starts at dashboard and auto-connects immediately
export async function waitForWalletConnected(page: Page) {
    try {
        // Wait for dashboard navigation elements to appear
        await page.waitForSelector('text=/Overview|Proposals|Analytics/', { timeout: 15000 });

        // Additional wait to ensure state is fully settled
        await page.waitForTimeout(1000);

        console.log('Dashboard loaded successfully');
    } catch (e) {
        console.log('Dashboard not loaded within timeout. Current URL:', page.url());
        console.log('Error:', e);
        // Don't throw - let test continue and fail with better error message
    }
}
