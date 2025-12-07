import { GoogleGenAI } from "@google/genai";
import { SKINS } from "../shared/skins";

export interface TransformParams {
  temperature: number; // 0.0 - 2.0
  topP: number; // 0.0 - 1.0
  maxOutputTokens: number;
  lengthRatio: number; // 0.6 - 1.6
  humor?: number; // 0.0 - 1.0
  insightLevel?: number; // 0.0 - 1.0
}

export interface TransformExtras {
  addGlossary?: boolean;
  addCore3?: boolean;
  addQuestions?: boolean;
}

export interface TransformRequest {
  url?: string; // Optional now
  title?: string; // Optional now
  site?: string;
  lang?: string;
  extracted: string; // Text content
  skin: string;
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

/**
 * Transform article content using Gemini 2.5 Flash
 */
export async function transformArticle(request: TransformRequest): Promise<TransformResponse> {
  const { url, title, extracted, skin, params, extras, apiKey } = request;

  // Get skin definition
  const skinDef = SKINS[skin];
  if (!skinDef) {
    throw new Error(`Unknown skin: ${skin}`);
  }

  // Initialize Gemini with new SDK
  const ai = new GoogleGenAI({ apiKey });

  // Build system prompt
  const systemPrompt = buildSystemPrompt(skinDef, params, extras);

  // Build user prompt (URL and title are now optional)
  const userPrompt = `
${title ? `Title: ${title}` : ''}
Content:
${extracted}

Please rewrite this article in the "${skinDef.name}" style.
`.trim();

  try {
    // Set timeout for API call (30 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('API request timed out after 30 seconds')), 30000);
    });

    const apiPromise = ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: params.temperature,
        topP: params.topP,
        maxOutputTokens: params.maxOutputTokens,
      },
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);

    console.log('[Transform] Gemini response:', JSON.stringify(response, null, 2));
    
    // Extract text from response
    let output: string | undefined;
    if (response.text) {
      output = response.text;
    } else if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
      output = response.candidates[0].content.parts[0].text;
    }
    
    console.log('[Transform] Extracted output:', output);

    if (!output) {
      console.error('[Transform] Response structure:', {
        hasText: !!response.text,
        hasCandidates: !!response.candidates,
        candidatesLength: response.candidates?.length,
        firstCandidate: response.candidates?.[0],
      });
      throw new Error('Gemini API returned empty response');
    }

    // Add NEWSSKINS credit at the end
    let finalOutput = output;
    if (!finalOutput.includes("[NEWSSKINS]")) {
      finalOutput += `\n\n[NEWSSKINS]`;
    }

    return {
      output: finalOutput,
      meta: {
        skin,
        tokensIn: response.usageMetadata?.promptTokenCount,
        tokensOut: response.usageMetadata?.candidatesTokenCount,
        safety: "clean",
      },
    };
  } catch (error) {
    console.error("[Transform] Failed to transform article:", error);
    throw new Error(`Transformation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

function buildSystemPrompt(
  skinDef: any,
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
- Keep output length ≈ original × ${lengthRatio}. If fixed length is provided, prefer it.
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
