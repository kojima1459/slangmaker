import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { transformHistory } from "../../drizzle/schema";
import { sql } from "drizzle-orm";
import { z } from "zod";

/**
 * Stats router
 * Provides anonymous statistics for community engagement
 */
export const statsRouter = router({
  /**
   * Get global statistics (anonymous, cached)
   * Returns total transformations, popular skins (24h), etc.
   */
  getGlobalStats: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      
      // Calculate 24 hours ago timestamp
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      // Get total transformation count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(transformHistory);
      const totalTransformations = totalResult[0]?.count || 0;

      // Get skin usage statistics for last 24 hours (top 5)
      const skinStatsResult = await db
        .select({
          skin: transformHistory.skin,
          count: sql<number>`count(*)`,
        })
        .from(transformHistory)
        .where(sql`${transformHistory.createdAt} >= ${oneDayAgo}`)
        .groupBy(transformHistory.skin)
        .orderBy(sql`count(*) desc`)
        .limit(5);

      // Get recent activity (last 24 hours)
      const recentResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(transformHistory)
        .where(sql`${transformHistory.createdAt} >= ${oneDayAgo}`);
      const recentTransformations = recentResult[0]?.count || 0;

      return {
        totalTransformations,
        recentTransformations,
        popularSkins: skinStatsResult.map((row: { skin: string; count: number }) => ({
          skin: row.skin,
          count: row.count,
        })),
      };
    } catch (error) {
      console.error("Failed to fetch global stats:", error);
      // Return default values on error
      return {
        totalTransformations: 0,
        recentTransformations: 0,
        popularSkins: [],
      };
    }
  }),

  /**
   * Get popular skins by time period
   * Supports 24h, 7d, 30d periods
   */
  getPopularSkinsByPeriod: publicProcedure
    .input(
      z.object({
        period: z.enum(["24h", "7d", "30d"]),
        limit: z.number().min(1).max(20).default(5),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Calculate timestamp based on period
        let periodAgo: Date;
        switch (input.period) {
          case "24h":
            periodAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            break;
          case "7d":
            periodAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            break;
          case "30d":
            periodAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            break;
        }

        // Get skin usage statistics for the period
        const skinStatsResult = await db
          .select({
            skin: transformHistory.skin,
            count: sql<number>`count(*)`,
          })
          .from(transformHistory)
          .where(sql`${transformHistory.createdAt} >= ${periodAgo}`)
          .groupBy(transformHistory.skin)
          .orderBy(sql`count(*) desc`)
          .limit(input.limit);

        return skinStatsResult.map((row: { skin: string; count: number }) => ({
          skin: row.skin,
          count: row.count,
        }));
      } catch (error) {
        console.error(`Failed to fetch popular skins for period ${input.period}:`, error);
        return [];
      }
    }),
});
