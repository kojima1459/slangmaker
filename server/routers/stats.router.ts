import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { transformHistory } from "../../drizzle/schema";
import { sql } from "drizzle-orm";

/**
 * Stats router
 * Provides anonymous statistics for community engagement
 */
export const statsRouter = router({
  /**
   * Get global statistics (anonymous, cached)
   * Returns total transformations, popular skins, etc.
   */
  getGlobalStats: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }
      
      // Get total transformation count
      const totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(transformHistory);
      const totalTransformations = totalResult[0]?.count || 0;

      // Get skin usage statistics (top 5)
      const skinStatsResult = await db
        .select({
          skin: transformHistory.skin,
          count: sql<number>`count(*)`,
        })
        .from(transformHistory)
        .groupBy(transformHistory.skin)
        .orderBy(sql`count(*) desc`)
        .limit(5);

      // Get recent activity (last 24 hours)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
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
});
