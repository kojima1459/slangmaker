import { GoogleGenerativeAI } from "@google/generative-ai";
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
  url: string;
  title: string;
  site: string;
  lang: string;
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
 * Transform article content using Gemini 1.5 Flash
 */
export async function transformArticle(request: TransformRequest): Promise<TransformResponse> {
  const { url, title, extracted, skin, params, extras, apiKey } = request;

  // Validate URL is present
  if (!url) {
    throw new Error("SOURCE_URL_REQUIRED");
  }

  // Get skin definition
  const skinDef = SKINS[skin];
  if (!skinDef) {
    throw new Error(`Unknown skin: ${skin}`);
  }

  // Initialize Gemini
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  // Build system prompt
  const systemPrompt = buildSystemPrompt(skinDef, params, extras);

  // Build user prompt
  const userPrompt = `
Title: ${title}
Content:
${extracted}

Source URL: ${url}

Please rewrite this article in the "${skinDef.name}" style.
`.trim();

  try {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: userPrompt },
          ],
        },
      ],
      generationConfig: {
        temperature: params.temperature,
        topP: params.topP,
        maxOutputTokens: params.maxOutputTokens,
      },
    });

    const response = result.response;
    console.log('[Transform] Gemini response:', JSON.stringify(response, null, 2));
    let output = response.text();
    console.log('[Transform] Extracted output:', output);

    // Ensure Source URL is appended
    if (!output.includes("Source:")) {
      output += `\n\nSource: ${url}`;
    }

    return {
      output,
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
preserving the original meaning and facts. Always append the source URL as:
"\\n\\nSource: <URL>".

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
- If source URL is missing, return an error message instead of content.
- If unsafe content is requested, soften per policy or refuse with short reason.

Output:
- Final text only; ending with "Source: <URL>".
`.trim();
}
