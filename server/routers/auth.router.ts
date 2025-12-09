import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";
import { publicProcedure, router } from "../_core/trpc";

/**
 * Authentication router
 * Handles user authentication and session management
 */
export const authRouter = router({
  /**
   * Get current user information
   */
  me: publicProcedure.query(opts => opts.ctx.user),

  /**
   * Logout current user
   */
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return {
      success: true,
    } as const;
  }),
});
