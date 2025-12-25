import { test, expect } from '@playwright/test';

test.describe('Gallery Page E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gallery');
  });

  // [TEST: 正常系] 初期表示とローディング
  test('should show loading state then content', async ({ page }) => {
    // ローディング中か、完了後にリストが表示されるか
    // モックしない場合、実際のデータ依存になるため、タイムアウトを長めに取る
    await expect(page.getByText('新着')).toBeVisible();
    
    // データがない場合の空ステート、ある場合のカード表示のいずれかだが
    // 最低限クラッシュしていないことを確認
    await expect(page.locator('h1').getByText(/ギャラリー/)).toBeVisible();
  });

  // [TEST: 異常系] 無効なURLへのアクセスハンドリング（404ページなどがあれば）
  // SPAなのでクライアントサイドでハンドリング
  test('should handle invalid skin filter gracefully', async ({ page }) => {
    await page.goto('/gallery?skin=invalid_skin_key');
    // クラッシュせずにギャラリーが表示されること
    await expect(page.getByText('ギャラリー')).toBeVisible();
  });
});
