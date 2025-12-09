import { protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { transformArticle } from "../transform";
import { 
  checkRateLimit,
  getCustomSkinById,
  createTransformHistory
} from "../db";
import { SNIPPET_LENGTH } from "@shared/constants";

/**
 * Transform router
 * Handles article transformation with various skins
 */
export const transformProcedure = protectedProcedure
  .input(z.object({
    url: z.string().optional(),
    title: z.string().optional(),
    site: z.string().optional(),
    lang: z.string().optional(),
    extracted: z.string(),
    skin: z.string(),
    params: z.object({
      temperature: z.number().min(0).max(2),
      topP: z.number().min(0).max(1),
      maxOutputTokens: z.number().min(50).max(8000),
      lengthRatio: z.number().min(0.5).max(1.5),
      humor: z.number().min(0).max(1).optional(),
      insightLevel: z.number().min(0).max(1).optional(),
    }),
    extras: z.object({
      addGlossary: z.boolean().optional(),
      addCore3: z.boolean().optional(),
      addQuestions: z.boolean().optional(),
    }).optional(),
  }))
  .mutation(async ({ input, ctx }) => {
    // Check rate limit
    const rateLimit = await checkRateLimit(ctx.user.id);
    if (!rateLimit.allowed) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: rateLimit.message || 'レート制限に達しました。',
      });
    }

    // Check if it's a custom skin
    let customSkinPrompt: string | undefined;
    if (input.skin.startsWith('custom_')) {
      const customSkinId = parseInt(input.skin.replace('custom_', ''));
      const customSkin = await getCustomSkinById(customSkinId, ctx.user.id);
      if (!customSkin) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'カスタムスキンが見つかりません',
        });
      }
      customSkinPrompt = customSkin.prompt;
    }

    const result = await transformArticle({
      ...input,
      apiKey: '', // Not needed - using Manus Built-in LLM API
    }, customSkinPrompt);

    // Save to history if user is authenticated
    if (ctx.user) {
      const snippet = result.output.substring(0, SNIPPET_LENGTH);
      await createTransformHistory({
        userId: ctx.user.id,
        url: input.url || "",
        title: input.title || "記事",
        site: input.site || "AI言い換えメーカー",
        lang: input.lang || "ja",
        skin: input.skin,
        params: JSON.stringify(input.params),
        snippet,
        output: result.output,
        outputHash: undefined,
      });
    }

    return result;
  });
