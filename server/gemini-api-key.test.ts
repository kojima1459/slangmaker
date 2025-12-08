import { describe, it, expect } from "vitest";
import { GoogleGenAI } from "@google/genai";

describe("Gemini API Key Validation", () => {
  it("should validate GEMINI_API_KEY by making a simple API call", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    
    // Initialize Gemini AI with the API key (same as transform.ts)
    const ai = new GoogleGenAI({ apiKey: apiKey! });
    
    // Make a simple test request
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: "Say hello in one word."
    });
    
    const text = result.text;
    
    // Verify we got a response
    expect(text).toBeDefined();
    expect(text.length).toBeGreaterThan(0);
    
    console.log("[Gemini API Key Test] Success! Response:", text);
  }, 30000); // 30 second timeout
});
