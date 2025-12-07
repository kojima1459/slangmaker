import { describe, expect, it } from "vitest";
import { SKINS } from "../shared/skins";

describe("Skins", () => {
  it("should have 10 skins defined", () => {
    expect(Object.keys(SKINS).length).toBe(10);
  });

  it("should have all required properties for each skin", () => {
    Object.values(SKINS).forEach((skin) => {
      expect(skin).toHaveProperty("key");
      expect(skin).toHaveProperty("name");
      expect(skin).toHaveProperty("description");
      expect(skin).toHaveProperty("rules");
      expect(skin).toHaveProperty("doList");
      expect(skin).toHaveProperty("dontList");
      expect(skin).toHaveProperty("fewShots");
      expect(Array.isArray(skin.doList)).toBe(true);
      expect(Array.isArray(skin.dontList)).toBe(true);
      expect(Array.isArray(skin.fewShots)).toBe(true);
    });
  });

  it("should have unique keys", () => {
    const keys = Object.keys(SKINS);
    const uniqueKeys = new Set(keys);
    expect(keys.length).toBe(uniqueKeys.size);
  });
});
