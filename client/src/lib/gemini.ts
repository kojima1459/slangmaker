/**
 * Client-side Gemini API service
 * Calls Google Gemini API directly from client (user provides their own API key)
 */

import { SKINS, type SkinDefinition } from "@shared/skins";

export interface TransformParams {
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  lengthRatio: number;
  humor?: number;
  insightLevel?: number;
}

export interface TransformExtras {
  addGlossary?: boolean;
  addCore3?: boolean;
  addQuestions?: boolean;
}

export interface TransformRequest {
  title?: string;
  extracted: string;
  skin: string;
  customPrompt?: string;
  params: TransformParams;
  extras?: TransformExtras;
  apiKey: string;
}

export interface TransformResponse {
  output: string;
  meta: {
    skin: string;
    tokensIn?: number;
    tokensOut?: number;
    safety: string;
  };
}

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

function buildSystemPrompt(
  skinDef: SkinDefinition,
  params: TransformParams,
  extras?: TransformExtras
): string {
  const { lengthRatio, humor = 0.6, insightLevel = 0.7 } = params;

  return `
You are a news style-rewriter engine.

Task: Rewrite the given article content into the selected "Skin" (style preset) while
preserving the original meaning and facts.

Constraints:
- Do not imitate real person's identity. Use the provided style rules instead.
- Avoid disallowed content. For suggestive style, keep R-15 with metaphors only.
- **IMPORTANT**: Keep output length approximately ${Math.round(lengthRatio * 100)}% of the original text length. Do NOT make it too short. If the original is 1000 characters, output should be around ${Math.round(lengthRatio * 1000)} characters.
- Language: follow input lang; if ja, keep natural Japanese.

Style Rules:
- ACTIVE_SKIN = ${skinDef.name}
- Description: ${skinDef.description}
- Rules: ${skinDef.rules}
- DO: ${skinDef.doList.join(", ")}
- DON'T: ${skinDef.dontList.join(", ")}
- Few-shot examples: ${skinDef.fewShots.join(" | ")}

Apply 2–4 hallmark features from ACTIVE_SKIN. Avoid clichés list.

${extras?.addCore3 ? '- Add "■本質3点" as bullet list at the end.' : ""}
${extras?.addGlossary ? '- Add "■用語ミニ辞典" with 3–5 terms at the end.' : ""}
${extras?.addQuestions ? '- Add "■素朴な疑問" with 2–3 questions at the end.' : ""}

Humor level: ${humor} (0–1). Insight level: ${insightLevel} (0–1).

System:
- Think step-by-step internally to map facts→style. Do NOT reveal analysis.
- If unsafe content is requested, soften per policy or refuse with short reason.

Output:
- Final text only.
`.trim();
}

/**
 * Transform text using Gemini API (client-side)
 */
export async function transformWithGemini(request: TransformRequest): Promise<TransformResponse> {
  const { title, extracted, skin, customPrompt, params, extras, apiKey } = request;

  if (!apiKey) {
    throw new Error("Gemini APIキーが必要です。設定から入力してください。");
  }

  // Get skin definition
  let systemPrompt: string;
  let skinName: string;

  if (customPrompt) {
    systemPrompt = customPrompt;
    skinName = "Custom Style";
  } else {
    const skinDef = SKINS[skin];
    if (!skinDef) {
      throw new Error(`Unknown skin: ${skin}`);
    }
    systemPrompt = buildSystemPrompt(skinDef, params, extras);
    skinName = skinDef.name;
  }

  // Build user prompt
  const userPrompt = `
${title ? `Title: ${title}` : ""}
Content:
${extracted}

Please rewrite this article in the "${skinName}" style.
`.trim();

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}\n\n---\n\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: params.temperature,
          topP: params.topP,
          maxOutputTokens: params.maxOutputTokens,
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 400 && errorText.includes("API_KEY_INVALID")) {
        throw new Error("APIキーが無効です。正しいGemini APIキーを入力してください。");
      }
      if (response.status === 429) {
        throw new Error("レート制限に達しました。しばらく待ってから再試行してください。");
      }
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract text from Gemini response
    const output = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!output) {
      console.error("[Gemini] Response structure:", data);
      throw new Error("Gemini APIが空のレスポンスを返しました。");
    }

    // Add credit at the end
    let finalOutput = output;
    if (!finalOutput.includes("[スラングメーカー]")) {
      finalOutput += `\n\n[スラングメーカー]`;
    }

    return {
      output: finalOutput,
      meta: {
        skin,
        tokensIn: data.usageMetadata?.promptTokenCount,
        tokensOut: data.usageMetadata?.candidatesTokenCount,
        safety: "clean",
      },
    };
  } catch (error) {
    console.error("[Gemini] Transform failed:", error);
    throw error;
  }
}
