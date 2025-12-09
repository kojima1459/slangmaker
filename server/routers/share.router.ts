import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { createShareLink, getShareLink } from "../db";
import { nanoid } from "nanoid";
import { SHARE_LINK_EXPIRY_MS, SHARE_LINK_ID_LENGTH } from "@shared/constants";

/**
 * Share router
 * Handles share link creation and retrieval
 */
export const shareRouter = router({
  /**
   * Create a new share link
   */
  create: protectedProcedure
    .input(z.object({
      content: z.string(),
      sourceUrl: z.preprocess(
        (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
        z.string().optional()
      ),
      skin: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const id = nanoid(SHARE_LINK_ID_LENGTH);
      const expiresAt = new Date(Date.now() + SHARE_LINK_EXPIRY_MS);

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

  /**
   * Get a share link by ID
   */
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
});
