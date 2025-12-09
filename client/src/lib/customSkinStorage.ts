/**
 * Custom Skin Storage Utility
 * Manages a single custom skin in localStorage (no login required)
 */

export interface CustomSkin {
  id: string; // Always "custom-skin" for single storage
  name: string;
  description?: string;
  prompt: string;
  example?: string;
  createdAt: number; // timestamp
  updatedAt: number; // timestamp
}

const STORAGE_KEY = "newsskins_custom_skin";

/**
 * Get the stored custom skin
 */
export function getCustomSkin(): CustomSkin | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as CustomSkin;
  } catch (error) {
    console.error("Failed to get custom skin:", error);
    return null;
  }
}

/**
 * Save a custom skin
 */
export function saveCustomSkin(skin: Omit<CustomSkin, "id" | "createdAt" | "updatedAt">): CustomSkin {
  try {
    const now = Date.now();
    const existing = getCustomSkin();

    const customSkin: CustomSkin = {
      id: "custom-skin",
      ...skin,
      createdAt: existing?.createdAt || now,
      updatedAt: now,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(customSkin));
    return customSkin;
  } catch (error) {
    console.error("Failed to save custom skin:", error);
    throw new Error("カスタムスキンの保存に失敗しました");
  }
}

/**
 * Delete the custom skin
 */
export function deleteCustomSkin(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to delete custom skin:", error);
    throw new Error("カスタムスキンの削除に失敗しました");
  }
}

/**
 * Check if custom skin exists
 */
export function hasCustomSkin(): boolean {
  return getCustomSkin() !== null;
}
