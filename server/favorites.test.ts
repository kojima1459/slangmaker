import { describe, it, expect, beforeAll } from 'vitest';
import { addFavoriteSkin, removeFavoriteSkin, getFavoriteSkins, isFavoriteSkin } from './db';

describe('Favorite Skins', () => {
  const testUserId = 1;
  const testSkinKey = 'kansai_banter';

  beforeAll(async () => {
    // Clean up any existing test data
    await removeFavoriteSkin(testUserId, testSkinKey);
  });

  it('should add a favorite skin', async () => {
    const result = await addFavoriteSkin(testUserId, testSkinKey);
    expect(result).toBeDefined();
    expect(result?.success).toBe(true);
  });

  it('should not add duplicate favorite skin', async () => {
    // Try to add the same skin again
    const result = await addFavoriteSkin(testUserId, testSkinKey);
    expect(result).toBeDefined();
    // The function should catch the duplicate error and return success: false
    if (result) {
      expect(result.success).toBe(false);
      expect(result.error).toBe('Already favorited');
    }
  });

  it('should check if skin is favorited', async () => {
    const isFav = await isFavoriteSkin(testUserId, testSkinKey);
    expect(isFav).toBe(true);
  });

  it('should get favorite skins list', async () => {
    const favorites = await getFavoriteSkins(testUserId);
    expect(favorites).toBeDefined();
    expect(Array.isArray(favorites)).toBe(true);
    expect(favorites.length).toBeGreaterThan(0);
    expect(favorites.some(f => f.skinKey === testSkinKey)).toBe(true);
  });

  it('should remove a favorite skin', async () => {
    const result = await removeFavoriteSkin(testUserId, testSkinKey);
    expect(result).toBeDefined();
    expect(result?.success).toBe(true);
  });

  it('should verify skin is no longer favorited', async () => {
    const isFav = await isFavoriteSkin(testUserId, testSkinKey);
    expect(isFav).toBe(false);
  });
});
