import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getUserTransformHistory } from "../db";
import { DEFAULT_HISTORY_LIMIT, MAX_HISTORY_LIMIT } from "@shared/constants";

/**
 * History router
 * Handles transformation history management
 */
export const historyRouter = router({
  /**
   * List user's transformation history
   */
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(MAX_HISTORY_LIMIT).default(DEFAULT_HISTORY_LIMIT),
    }))
    .query(async ({ input, ctx }) => {
      const history = await getUserTransformHistory(ctx.user.id, input.limit);
      return history;
    }),
});
