import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should load the splash screen', async ({ page }) => {
        await page.goto('/');

        // Wait for splash screen  
        await expect(page.getByText('VoteQuest')).toBeVisible();
    });

    test('should navigate to login screen', async ({ page }) => {
        await page.goto('/');

        // Wait for splash to complete (mock fast forward or wait)
        // The splash screen has a 2.5s delay + animation
        await expect(page.getByText(/connect wallet/i)).toBeVisible({ timeout: 10000 });
    });

    // Note: Actual wallet connection testing requires wallet mocking
    // For full E2E, use tools like Synpress with MetaMask
});
