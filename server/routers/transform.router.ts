import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { transformArticle } from "../transform";
import { 
  checkRateLimit,
  getCustomSkinById,
  createTransformHistory
} from "../db";
import { SNIPPET_LENGTH } from "@shared/constants";
import { TransformService } from "../services/TransformService";
import { limitedLLMCall } from "../_core/llm-concurrency";
import { logger, logRequest, logLLM, logSecurity } from "../_core/logger";
import { checkIpRateLimit } from "../_core/rate-limiter";
import { sanitizeForLLM } from "../_core/llm-safety";

/**
 * Transform router
 * Handles article transformation with various skins
 */
export const transformProcedure = publicProcedure
  .input(z.object({
    url: z.string().optional(),
    title: z.string().optional(),
    site: z.string().optional(),
    lang: z.string().optional(),
    extracted: z.string(),
    skin: z.string(),
    customPrompt: z.string().optional(), // For localStorage-based custom skins
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
    const startTime = Date.now();
    const userId = ctx.user?.id;
    const ip = ctx.req?.ip || 'unknown';

    try {
      // 1. Input sanitization (LLM safety)
      let sanitizedExtracted: string;
      try {
        sanitizedExtracted = sanitizeForLLM(input.extracted, 10000);
      } catch (error: any) {
        logSecurity({
          event: 'llm_injection_attempt',
          userId,
          ip,
          details: { error: error.message },
        });
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '入力テキストに不正な内容が含まれています',
        });
      }

      // 2. Rate limiting (IP-based and user-based)
      if (userId) {
        // User-based rate limit (existing DB check)
        const rateLimit = await checkRateLimit(userId);
        if (!rateLimit.allowed) {
          logSecurity({
            event: 'rate_limit_exceeded',
            userId,
            ip,
            details: { limit: 'user' },
          });
          throw new TRPCError({
            code: 'TOO_MANY_REQUESTS',
            message: rateLimit.message || 'レート制限に達しました。',
          });
        }
      } else {
        // IP-based rate limit for anonymous users
        try {
          await checkIpRateLimit(ip);
        } catch (error) {
          logSecurity({
            event: 'rate_limit_exceeded',
            ip,
            details: { limit: 'ip' },
          });
          throw error;
        }
      }

      // 3. Check if it's a custom skin
      let customSkinPrompt: string | undefined;
      
      // Handle localStorage-based custom skin (skin === 'custom')
      if (input.skin === 'custom') {
        if (!input.customPrompt) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'カスタムスキンのプロンプトが指定されていません',
          });
        }
        customSkinPrompt = sanitizeForLLM(input.customPrompt, 5000);
      }
      // Handle database-based custom skin (skin === 'custom_1', 'custom_2', etc.)
      else if (input.skin.startsWith('custom_')) {
        const customSkinId = parseInt(input.skin.replace('custom_', ''));
        const customSkin = await getCustomSkinById(customSkinId, userId || 0);
        if (!customSkin) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'カスタムスキンが見つかりません',
          });
        }
        customSkinPrompt = customSkin.prompt;
      }

      // 4. Transform with LLM (with concurrency limit)
      const llmStartTime = Date.now();
      const result = await limitedLLMCall(async () => {
        return await transformArticle({
          ...input,
          extracted: sanitizedExtracted,
          apiKey: '', // Not needed - using Manus Built-in LLM API
        }, customSkinPrompt);
      });
      const llmDuration = Date.now() - llmStartTime;

      // Log LLM operation
      logLLM({
        operation: 'transform',
        model: 'gemini-2.5-flash',
        userId,
        tokensIn: result.meta?.tokensIn,
        tokensOut: result.meta?.tokensOut,
        duration: llmDuration,
      });

      // 5. Save to history if user is authenticated
      if (userId) {
        const snippet = result.output.substring(0, SNIPPET_LENGTH);
        await createTransformHistory({
          userId,
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

      // Log successful request
      const duration = Date.now() - startTime;
      logRequest({
        path: 'transform',
        type: 'mutation',
        userId,
        duration,
      });

      return result;
    } catch (error: any) {
      // Log failed request
      const duration = Date.now() - startTime;
      logRequest({
        path: 'transform',
        type: 'mutation',
        userId,
        duration,
        error,
      });
      throw error;
    }
  });
