import { router } from "../_core/trpc";
import { systemRouter } from "../_core/systemRouter";
import { authRouter } from "./auth.router";
import { transformProcedure } from "./transform.router";
import { settingsRouter } from "./settings.router";
import { historyRouter } from "./history.router";
import { shareRouter } from "./share.router";
import { feedbackRouter } from "./feedback.router";
import { favoritesRouter } from "./favorites.router";
import { customSkinsRouter } from "./customSkins.router";
import { rateLimitRouter } from "./rateLimit.router";
import { statsRouter } from "./stats.router";

/**
 * Main application router
 * Combines all feature routers into a single router
 */
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  transform: transformProcedure,
  settings: settingsRouter,
  history: historyRouter,
  share: shareRouter,
  feedback: feedbackRouter,
  favorites: favoritesRouter,
  customSkins: customSkinsRouter,
  rateLimit: rateLimitRouter,
  stats: statsRouter,
});

export type AppRouter = typeof appRouter;
