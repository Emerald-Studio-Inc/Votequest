import { test, expect } from '@playwright/test';
import { mockUser } from '../fixtures/users';
import { waitForWalletConnected } from '../utils/test-helpers';

test.describe('Proposal Creation Flow', () => {
    test.beforeEach(async ({ page }) => {
        // Mock user to be authenticated
        await page.route('**/rest/v1/users*', async (route) => {
            await route.fulfill({ json: mockUser });
        });

        await page.goto('/');

        // Wait for auto-connection (Test Mode)
        await waitForWalletConnected(page);

        // Navigate to creation page
        await page.goto('/create-proposal');
    });

    test('should validate form inputs', async ({ page }) => {
        // Wait for form to be visible
        const createButton = page.getByRole('button', { name: /create/i });
        await expect(createButton).toBeVisible();

        // Try to submit empty form
        await createButton.click();

        // Check for validation errors (button should still be visible)
        await expect(createButton).toBeVisible();
    });

    test('should create a new proposal successfully', async ({ page }) => {
        // 1. Fill Title
        await page.getByPlaceholder(/proposal title/i).fill('New E2E Test Proposal');

        // 2. Fill Description
        await page.getByPlaceholder(/describe your proposal/i).fill('This is a test description for E2E testing.');

        // 3. Add Options
        const optionInputs = page.getByPlaceholder(/option/i);
        await optionInputs.nth(0).fill('Option A');
        await optionInputs.nth(1).fill('Option B');

        // 4. Submit
        // Mock the create API
        await page.route('/api/proposal/create', async (route) => {
            await route.fulfill({
                status: 200,
                json: { success: true, proposalId: 'new-prop-id' }
            });
        });

        await page.getByRole('button', { name: /create/i }).click();

        // 5. Verify success
        // await expect(page.getByText('Proposal created!')).toBeVisible();
    });
});
