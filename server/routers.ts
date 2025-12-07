import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { extractArticle } from "./extract";
import { transformArticle } from "./transform";
import { 
  getUserSettings, 
  upsertUserSettings, 
  createTransformHistory,
  getUserTransformHistory,
  createShareLink,
  getShareLink
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

  // Extract article from URL
  extract: publicProcedure
    .input(z.object({
      url: z.string().url(),
    }))
    .mutation(async ({ input }) => {
      const article = await extractArticle(input.url);
      return article;
    }),

  // Transform article with Gemini
  transform: publicProcedure
    .input(z.object({
      url: z.string().url(),
      title: z.string(),
      site: z.string(),
      lang: z.string(),
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
      if (ctx.user) {
        const snippet = result.output.substring(0, 200);
        await createTransformHistory({
          userId: ctx.user.id,
          url: input.url,
          title: input.title,
          site: input.site,
          lang: input.lang,
          skin: input.skin,
          params: JSON.stringify(input.params),
          snippet,
          outputHash: undefined,
        });
      }

      return result;
    }),

  // User settings
  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const settings = await getUserSettings(ctx.user.id);
      return settings;
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
});

export type AppRouter = typeof appRouter;
