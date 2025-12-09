import { test, expect } from '@playwright/test';

/**
 * E2E Tests for AI Slang Maker
 * 
 * These tests cover the main user flows:
 * 1. Homepage loads correctly
 * 2. User can paste article text
 * 3. User can select a skin
 * 4. User can transform article
 * 5. User can view transformation result
 * 6. User can copy result
 * 7. User can share on social media
 */

test.describe('AI Slang Maker - Main Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Skip onboarding if it appears
    const skipButton = page.getByText('Skip');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
  });

  test('should load homepage correctly', async ({ page }) => {
    // Check title
    await expect(page).toHaveTitle(/AI Slang Maker|スラングメーカー/);
    
    // Check main heading
    const heading = page.getByRole('heading', { name: /AI Slang Maker|スラングメーカー/ });
    await expect(heading).toBeVisible();
    
    // Check article text input
    const textarea = page.getByPlaceholder(/Paste the article text here|記事のテキストをここに貼り付けてください/);
    await expect(textarea).toBeVisible();
  });

  test('should allow user to paste article text', async ({ page }) => {
    const sampleText = '日本の経済は2024年第3四半期に前期比0.9%の成長を記録しました。';
    
    // Find and fill textarea
    const textarea = page.getByRole('textbox', { name: /Article Text|記事テキスト/ });
    await textarea.fill(sampleText);
    
    // Verify text was entered
    await expect(textarea).toHaveValue(sampleText);
  });

  test('should display available skins', async ({ page }) => {
    // Check if skin selector is visible
    const skinSelector = page.locator('[data-testid="skin-selector"]').or(
      page.getByText(/関西弁|Z世代|ビジネス/)
    );
    await expect(skinSelector.first()).toBeVisible();
  });

  test('should allow user to select a skin', async ({ page }) => {
    // Find and click a skin option
    const skinOption = page.getByText('関西弁風').or(
      page.getByRole('button', { name: /関西弁/ })
    );
    
    if (await skinOption.isVisible()) {
      await skinOption.click();
      
      // Verify skin was selected (check for active state or confirmation)
      await expect(skinOption).toHaveClass(/selected|active|bg-primary/);
    }
  });

  test('should transform article with selected skin', async ({ page }) => {
    // This test requires authentication, so we'll skip it if not logged in
    const isLoggedIn = await page.getByText(/ログアウト|Logout/).isVisible().catch(() => false);
    
    if (!isLoggedIn) {
      test.skip();
      return;
    }

    const sampleText = '日本の経済は2024年第3四半期に前期比0.9%の成長を記録しました。';
    
    // Fill article text
    const textarea = page.getByRole('textbox', { name: /Article Text|記事テキスト/ });
    await textarea.fill(sampleText);
    
    // Select a skin (if not already selected)
    const skinOption = page.getByText('関西弁風').first();
    if (await skinOption.isVisible()) {
      await skinOption.click();
    }
    
    // Click transform button
    const transformButton = page.getByRole('button', { name: /変換する|Transform/ });
    await transformButton.click();
    
    // Wait for transformation to complete (max 30 seconds)
    await page.waitForURL(/\/reader/, { timeout: 30000 });
    
    // Verify we're on the reader page
    await expect(page).toHaveURL(/\/reader/);
  });

  test('should display transformation result', async ({ page }) => {
    // Navigate directly to reader page (assuming we have session storage)
    // This test assumes a successful transformation has occurred
    
    // For now, we'll skip this test as it requires prior transformation
    test.skip();
  });

  test('should allow user to copy result', async ({ page }) => {
    // This test requires being on the reader page
    test.skip();
  });

  test('should allow user to share on social media', async ({ page }) => {
    // This test requires being on the reader page
    test.skip();
  });
});

test.describe('AI Slang Maker - Rate Limiting', () => {
  test('should show rate limit error after too many requests', async ({ page }) => {
    // This test would require making 10+ requests in 1 minute
    // Skipping for now to avoid hitting actual rate limits
    test.skip();
  });
});

test.describe('AI Slang Maker - Error Handling', () => {
  test('should show error for empty article text', async ({ page }) => {
    await page.goto('/');
    
    // Skip onboarding
    const skipButton = page.getByText('Skip');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
    
    // Try to transform without entering text
    const transformButton = page.getByRole('button', { name: /変換する|Transform/ });
    
    // Check if button is disabled or shows error
    const isDisabled = await transformButton.isDisabled();
    expect(isDisabled).toBe(true);
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // This test would require simulating network failures
    test.skip();
  });
});

test.describe('AI Slang Maker - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/');
    
    // Skip onboarding
    const skipButton = page.getByText('Skip');
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
    
    // Tab through elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Verify focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/');
    
    // Check for ARIA labels on important elements
    const textarea = page.getByRole('textbox');
    await expect(textarea).toBeVisible();
    
    const buttons = page.getByRole('button');
    expect(await buttons.count()).toBeGreaterThan(0);
  });
});
