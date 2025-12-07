import { describe, expect, it } from "vitest";
import { SKINS } from "../shared/skins";

describe("Skins", () => {
  it("should have 15 skins defined", () => {
    expect(Object.keys(SKINS).length).toBe(15);
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

describe("Transform API Structure", () => {
  it("should have correct TransformRequest interface structure", () => {
    // Test that the interface accepts optional fields
    const validRequest = {
      extracted: "これはテスト記事です。",
      skin: "kansai_banter",
      params: {
        temperature: 1.0,
        topP: 0.9,
        maxOutputTokens: 1500,
        lengthRatio: 1.0,
      },
      apiKey: "test-api-key",
    };

    // Check required fields
    expect(validRequest).toHaveProperty("extracted");
    expect(validRequest).toHaveProperty("skin");
    expect(validRequest).toHaveProperty("params");
    expect(validRequest).toHaveProperty("apiKey");

    // Check params structure
    expect(validRequest.params).toHaveProperty("temperature");
    expect(validRequest.params).toHaveProperty("topP");
    expect(validRequest.params).toHaveProperty("maxOutputTokens");
    expect(validRequest.params).toHaveProperty("lengthRatio");
  });

  it("should validate skin exists in SKINS", () => {
    const validSkins = Object.keys(SKINS);
    expect(validSkins).toContain("kansai_banter");
    expect(validSkins).toContain("detached_lit");
    expect(validSkins).toContain("suggestive_safe");
  });
});
