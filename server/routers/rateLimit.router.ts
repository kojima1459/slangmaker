import { protectedProcedure, router } from "../_core/trpc";
import { getRateLimitStatus } from "../db";

/**
 * Rate limit router
 * Handles rate limit status queries
 */
export const rateLimitRouter = router({
  /**
   * Get current rate limit status for the user
   */
  status: protectedProcedure
    .query(async ({ ctx }) => {
      const status = await getRateLimitStatus(ctx.user.id);
      return status;
    }),
});
