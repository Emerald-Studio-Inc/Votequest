import { test, expect } from '@playwright/test';
import { mockProposals } from '../fixtures/proposals';
import { waitForWalletConnected } from '../utils/test-helpers';

test.describe('Voting Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Mock API routes
        await page.route('**/rest/v1/proposals*', async (route) => {
            await route.fulfill({ json: mockProposals });
        });

        // Navigate to home
        await page.goto('/');

        // Wait for auto-connection (Test Mode)
        await waitForWalletConnected(page);
    });

    test('should allow a user to cast a vote', async ({ page }) => {
        // 1. Click on a proposal
        await page.getByText('Should we implement Dark Mode?').click();

        // 2. Verify detail screen loads
        await expect(page.getByRole('heading', { name: 'Should we implement Dark Mode?' })).toBeVisible();

        // 3. Select an option
        const optionButton = page.getByText('Yes, absolutely');
        await optionButton.click();

        // 4. Click vote button
        const voteButton = page.getByRole('button', { name: 'Confirm Vote' });
        await expect(voteButton).toBeVisible();
        await expect(voteButton).toBeEnabled();

        // Mock the vote API call
        await page.route('/api/vote', async (route) => {
            await route.fulfill({ status: 200, json: { success: true } });
        });

        await voteButton.click();

        // 5. Verify success state
        await expect(page.getByText('Vote recorded successfully')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Vote Recorded')).toBeVisible();
    });

    test('should show results for closed proposals', async ({ page }) => {
        // Placeholder for closed proposal test
    });
});
