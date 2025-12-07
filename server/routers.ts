import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
// extractArticle is no longer needed - users paste text directly
import { transformArticle } from "./transform";
import { invokeLLM } from "./_core/llm";
import { SKINS } from "../shared/skins";
import { 
  getUserSettings, 
  upsertUserSettings, 
  createTransformHistory,
  getUserTransformHistory,
  createShareLink,
  getShareLink,
  submitFeedback,
  getFeedbackStats,
  getFeedbackList,
  addFavoriteSkin,
  removeFavoriteSkin,
  getFavoriteSkins,
  isFavoriteSkin
} from "./db";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // extract endpoint removed - users paste text directly

  // Transform article with Gemini
  transform: publicProcedure
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
        maxOutputTokens: z.number().min(50).max(2000),
        lengthRatio: z.number().min(0.6).max(1.6),
        humor: z.number().min(0).max(1).optional(),
        insightLevel: z.number().min(0).max(1).optional(),
      }),
      extras: z.object({
        addGlossary: z.boolean().optional(),
        addCore3: z.boolean().optional(),
        addQuestions: z.boolean().optional(),
      }).optional(),
      apiKey: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await transformArticle(input);

      // Save to history if user is authenticated
      let historyId: number | undefined;
      if (ctx.user) {
        const snippet = result.output.substring(0, 200);
        historyId = await createTransformHistory({
          userId: ctx.user.id,
          url: input.url || "",
          title: input.title || "記事",
          site: input.site || "NewsSkins",
          lang: input.lang || "ja",
          skin: input.skin,
          params: JSON.stringify(input.params),
          snippet,
          outputHash: undefined,
        });
      }

      return {
        ...result,
        historyId,
      };
    }),

  // User settings
  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const settings = await getUserSettings(ctx.user.id);
      // Return default values if settings don't exist
      return settings || {
        userId: ctx.user.id,
        encryptedApiKey: null,
        defaultSkin: "kansai_banter",
        defaultTemperature: null,
        defaultTopP: null,
        defaultMaxTokens: null,
        defaultLengthRatio: null,
        safetyLevel: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
    
    update: protectedProcedure
      .input(z.object({
        encryptedApiKey: z.string().optional(),
        defaultSkin: z.string().optional(),
        defaultTemperature: z.number().optional(),
        defaultTopP: z.number().optional(),
        defaultMaxTokens: z.number().optional(),
        defaultLengthRatio: z.number().optional(),
        safetyLevel: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await upsertUserSettings({
          userId: ctx.user.id,
          ...input,
        });
        return { success: true };
      }),
  }),

  // History
  history: router({
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ input, ctx }) => {
        const history = await getUserTransformHistory(ctx.user.id, input.limit);
        return history;
      }),
  }),

  // Share
  share: router({
    create: protectedProcedure
      .input(z.object({
        content: z.string(),
        sourceUrl: z.string().url(),
        skin: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = nanoid(12);
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

        await createShareLink({
          id,
          userId: ctx.user.id,
          content: input.content,
          sourceUrl: input.sourceUrl,
          skin: input.skin,
          expiresAt,
        });

        return { id, url: `/share/${id}` };
      }),

    get: publicProcedure
      .input(z.object({
        id: z.string(),
      }))
      .query(async ({ input }) => {
        const link = await getShareLink(input.id);
        if (!link) {
          throw new Error("Share link not found or expired");
        }
        return link;
      }),
  }),

  // Feedback endpoints
  feedback: router({
    submit: protectedProcedure
      .input(z.object({
        historyId: z.number(),
        rating: z.enum(["good", "bad"]),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await submitFeedback({
          userId: ctx.user.id,
          historyId: input.historyId,
          rating: input.rating,
          comment: input.comment,
        });
        return { success: true, message: "フィードバックありがとうございました！" };
      }),

    stats: protectedProcedure
      .input(z.object({
        skinKey: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        const stats = await getFeedbackStats(input || {});
        return { stats };
      }),

    list: protectedProcedure
      .input(z.object({
        skinKey: z.string().optional(),
        rating: z.enum(["good", "bad"]).optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional())
      .query(async ({ input }) => {
        const result = await getFeedbackList(input || {});
        return result;
      }),

    improveSkin: protectedProcedure
      .input(z.object({
        skinKey: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Admin only
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN", message: "管理者権限が必要です" });
        }

        const skin = SKINS[input.skinKey as keyof typeof SKINS];
        if (!skin) {
          throw new TRPCError({ code: "NOT_FOUND", message: "スキンが見つかりません" });
        }

        // Get feedback stats
        const stats = await getFeedbackStats({ skinKey: input.skinKey });
        const skinStats = stats.find(s => s.skinKey === input.skinKey);

        if (!skinStats || skinStats.totalCount < 5) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "フィードバックが不足しています（5件以上必要）" });
        }

        // Get negative feedback comments
        const feedbackList = await getFeedbackList({ skinKey: input.skinKey, rating: "bad", limit: 20 });

        // Generate improvement suggestions using LLM
        const prompt = `あなたは文体変換スキンの改善エキスパートです。以下のスキンに対して、ユーザーからのネガティブフィードバックを考慮して改善提案を作成してください。

**現在のスキン:**
名前: ${skin.name}
説明: ${skin.description}
ルール: ${skin.rules}
DOリスト: ${skin.doList.join(", ")}
DON'Tリスト: ${skin.dontList.join(", ")}

**フィードバック統計:**
総フィードバック数: ${skinStats.totalCount}
良い評価: ${skinStats.goodCount} (${skinStats.goodPercentage.toFixed(1)}%)
悪い評価: ${skinStats.badCount} (${(100 - skinStats.goodPercentage).toFixed(1)}%)

**改善提案を以下のJSON形式で出力してください:**
{
  "improvedRules": "改善されたルール",
  "improvedDoList": ["改善されたDOリスト"],
  "improvedDontList": ["改善されたDON'Tリスト"],
  "improvedFewShots": ["改善された例文"],
  "reasoning": "改善理由の説明"
}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "あなたは文体変換スキンの改善エキスパートです。" },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "skin_improvement",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  improvedRules: { type: "string" },
                  improvedDoList: { type: "array", items: { type: "string" } },
                  improvedDontList: { type: "array", items: { type: "string" } },
                  improvedFewShots: { type: "array", items: { type: "string" } },
                  reasoning: { type: "string" },
                },
                required: ["improvedRules", "improvedDoList", "improvedDontList", "improvedFewShots", "reasoning"],
                additionalProperties: false,
              },
            },
          },
        });

        const improvement = JSON.parse(response.choices[0].message.content || "{}");

        return {
          original: skin,
          improved: improvement,
          stats: skinStats,
        };
      }),
  }),

  // Favorite skins endpoints
  favorites: router({
    list: protectedProcedure
      .query(async ({ ctx }) => {
        const favorites = await getFavoriteSkins(ctx.user.id);
        return { favorites };
      }),

    add: protectedProcedure
      .input(z.object({
        skinKey: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await addFavoriteSkin(ctx.user.id, input.skinKey);
        if (!result) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "データベースエラー" });
        }
        if (!result.success) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "すでにお気に入りに追加されています" });
        }
        return { success: true, message: "お気に入りに追加しました" };
      }),

    remove: protectedProcedure
      .input(z.object({
        skinKey: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await removeFavoriteSkin(ctx.user.id, input.skinKey);
        return { success: true, message: "お気に入りから削除しました" };
      }),

    check: protectedProcedure
      .input(z.object({
        skinKey: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        const isFavorite = await isFavoriteSkin(ctx.user.id, input.skinKey);
        return { isFavorite };
      }),
  }),
});

export type AppRouter = typeof appRouter;
