/**
 * Custom Skin Storage Utility
 * Manages multiple custom skins in localStorage (no login required)
 * Maximum 5 custom skins supported
 */

export interface CustomSkin {
  id: string;
  name: string;
  description?: string;
  prompt: string;
  example?: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = "newsskins_custom_skins";
const MAX_CUSTOM_SKINS = 5;

/**
 * Generate unique ID for custom skin
 */
function generateId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get all stored custom skins
 */
export function getCustomSkins(): CustomSkin[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Migrate from old single-skin format if exists
      const oldSkin = localStorage.getItem("newsskins_custom_skin");
      if (oldSkin) {
        const parsed = JSON.parse(oldSkin);
        const migrated: CustomSkin = {
          ...parsed,
          id: parsed.id === "custom-skin" ? generateId() : parsed.id,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([migrated]));
        localStorage.removeItem("newsskins_custom_skin");
        return [migrated];
      }
      return [];
    }
    return JSON.parse(stored) as CustomSkin[];
  } catch (error) {
    console.error("Failed to get custom skins:", error);
    return [];
  }
}

/**
 * Get a single custom skin by ID
 * @deprecated Use getCustomSkins() instead for new code
 */
export function getCustomSkin(): CustomSkin | null {
  const skins = getCustomSkins();
  return skins.length > 0 ? skins[0] : null;
}

/**
 * Get custom skin by ID
 */
export function getCustomSkinById(id: string): CustomSkin | null {
  const skins = getCustomSkins();
  return skins.find(s => s.id === id) || null;
}

/**
 * Save a new custom skin or update existing one
 */
export function saveCustomSkin(
  skin: Omit<CustomSkin, "id" | "createdAt" | "updatedAt">,
  existingId?: string
): CustomSkin {
  try {
    const skins = getCustomSkins();
    const now = Date.now();

    if (existingId) {
      // Update existing
      const index = skins.findIndex(s => s.id === existingId);
      if (index === -1) {
        throw new Error("カスタムスキンが見つかりません");
      }
      const updatedSkin: CustomSkin = {
        ...skins[index],
        ...skin,
        updatedAt: now,
      };
      skins[index] = updatedSkin;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(skins));
      return updatedSkin;
    } else {
      // Create new
      if (skins.length >= MAX_CUSTOM_SKINS) {
        throw new Error(`カスタムスキンは最大${MAX_CUSTOM_SKINS}個まで作成できます`);
      }
      const newSkin: CustomSkin = {
        id: generateId(),
        ...skin,
        createdAt: now,
        updatedAt: now,
      };
      skins.push(newSkin);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(skins));
      return newSkin;
    }
  } catch (error) {
    console.error("Failed to save custom skin:", error);
    throw error;
  }
}

/**
 * Delete a custom skin by ID
 */
export function deleteCustomSkinById(id: string): void {
  try {
    const skins = getCustomSkins();
    const filtered = skins.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete custom skin:", error);
    throw new Error("カスタムスキンの削除に失敗しました");
  }
}

/**
 * Delete the first custom skin (backward compatibility)
 * @deprecated Use deleteCustomSkinById() instead
 */
export function deleteCustomSkin(): void {
  const skins = getCustomSkins();
  if (skins.length > 0) {
    deleteCustomSkinById(skins[0].id);
  }
}

/**
 * Check if custom skins exist
 */
export function hasCustomSkin(): boolean {
  return getCustomSkins().length > 0;
}

/**
 * Get max allowed custom skins
 */
export function getMaxCustomSkins(): number {
  return MAX_CUSTOM_SKINS;
}

/**
 * Get remaining slots for custom skins
 */
export function getRemainingSlots(): number {
  return MAX_CUSTOM_SKINS - getCustomSkins().length;
}
