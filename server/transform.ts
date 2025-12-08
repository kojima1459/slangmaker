import { SKINS } from "../shared/skins";
import { invokeLLM } from "./_core/llm";

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
 * Transform article content using Manus Built-in LLM API
 */
export async function transformArticle(request: TransformRequest, customSkinPrompt?: string): Promise<TransformResponse> {
  const { url, title, extracted, skin, params, extras } = request;

  // Get skin definition (either from default skins or use custom prompt)
  let systemPrompt: string;
  let skinName: string;
  
  if (customSkinPrompt) {
    // Use custom prompt directly as system instruction
    systemPrompt = customSkinPrompt;
    skinName = "Custom Style";
  } else {
    // Use default skin definition
    const skinDef = SKINS[skin];
    if (!skinDef) {
      throw new Error(`Unknown skin: ${skin}`);
    }
    systemPrompt = buildSystemPrompt(skinDef, params, extras);
    skinName = skinDef.name;
  }

  // Use Manus Built-in LLM API (no need to initialize with API key)

  // Build user prompt (URL and title are now optional)
  const userPrompt = `
${title ? `Title: ${title}` : ''}
Content:
${extracted}

Please rewrite this article in the "${skinName}" style.
`.trim();

  try {
    // Set timeout for API call (30 seconds)
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('API request timed out after 30 seconds')), 30000);
    });

    const apiPromise = invokeLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: params.maxOutputTokens,
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);

    console.log('[Transform] LLM response:', JSON.stringify(response, null, 2));
    
    // Extract text from response
    let output: string | undefined;
    if (response.choices && response.choices[0]?.message?.content) {
      const content = response.choices[0].message.content;
      output = typeof content === 'string' ? content : undefined;
    }
    
    console.log('[Transform] Extracted output:', output);

    if (!output) {
      console.error('[Transform] Response structure:', response);
      throw new Error('LLM API returned empty response');
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
        tokensIn: response.usage?.prompt_tokens,
        tokensOut: response.usage?.completion_tokens,
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
