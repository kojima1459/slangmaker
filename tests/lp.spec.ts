import { test, expect } from '@playwright/test';

test.describe('Landing Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lp');
  });

  // [TEST: 正常系] ページの基本表示確認
  test('should load landing page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/AIスラングメーカー/);
    await expect(page.getByText('無料')).toBeVisible();
    await expect(page.getByText('AIが文脈を解析中')).toBeVisible(); // Labor Illusion check
  });

  // [TEST: 正常系] CTAボタンの動作確認
  test('should navigate to home on CTA click', async ({ page }) => {
    // ボタンのテキストはデザイン変更により変わる可能性があるため、役割で取得するか、不変なテキストで
    const ctaButton = page.getByRole('button', { name: '無料で開始' }).first();
    await ctaButton.click();
    await expect(page).toHaveURL('/');
  });

  // [TEST: 正常系] ギャラリーへの遷移
  test('should navigate to gallery', async ({ page }) => {
    await page.getByRole('button', { name: 'みんなの投稿を見る' }).click();
    await expect(page).toHaveURL('/gallery');
  });
});
