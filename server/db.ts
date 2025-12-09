import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  userSettings, 
  InsertUserSettings,
  transformHistory,
  InsertTransformHistory,
  shareLinks,
  InsertShareLink,
  feedback,
  InsertFeedback,
  favoriteSkins,
  InsertFavoriteSkin,
  rateLimits,
  InsertRateLimit,
  customSkins,
  InsertCustomSkin
} from "../drizzle/schema";
import { ENV } from './_core/env';
import { DAILY_LIMIT, MINUTE_LIMIT, MINUTE_WINDOW_MS, SNIPPET_LENGTH, DEFAULT_HISTORY_LIMIT, MAX_HISTORY_LIMIT } from '@shared/constants';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// User Settings
export async function getUserSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userSettings).where(eq(userSettings.userId, userId)).limit(1);
  if (result.length === 0) return undefined;
  
  // Normalize values: database stores values * 100 to avoid floating point issues
  const settings = result[0];
  return {
    ...settings,
    defaultTemperature: settings.defaultTemperature !== null && settings.defaultTemperature !== undefined ? settings.defaultTemperature / 100 : undefined,
    defaultTopP: settings.defaultTopP !== null && settings.defaultTopP !== undefined ? settings.defaultTopP / 100 : undefined,
    defaultMaxTokens: settings.defaultMaxTokens !== null && settings.defaultMaxTokens !== undefined ? settings.defaultMaxTokens : undefined,
    defaultLengthRatio: settings.defaultLengthRatio !== null && settings.defaultLengthRatio !== undefined ? settings.defaultLengthRatio / 100 : undefined,
  };
}

export async function upsertUserSettings(settings: InsertUserSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  console.log('[upsertUserSettings] Original settings:', JSON.stringify(settings, null, 2));

  // Remove undefined fields to avoid overwriting existing values
  const cleanedSettings = Object.fromEntries(
    Object.entries(settings).filter(([_, value]) => value !== undefined)
  ) as InsertUserSettings;

  console.log('[upsertUserSettings] Cleaned settings:', JSON.stringify(cleanedSettings, null, 2));

  await db.insert(userSettings).values(cleanedSettings).onDuplicateKeyUpdate({
    set: cleanedSettings,
  });
  
  console.log('[upsertUserSettings] Database update completed');
}

// Transform History
export async function createTransformHistory(history: InsertTransformHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(transformHistory).values(history);
  return result;
}

export async function getUserTransformHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(transformHistory)
    .where(eq(transformHistory.userId, userId))
    .orderBy(desc(transformHistory.createdAt))
    .limit(limit);

  return result;
}

// Share Links
export async function createShareLink(link: InsertShareLink) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(shareLinks).values(link);
}

export async function getShareLink(id: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(shareLinks).where(eq(shareLinks.id, id)).limit(1);
  
  if (result.length === 0) return undefined;
  
  const link = result[0];
  // Check if expired
  if (link && new Date() > new Date(link.expiresAt)) {
    return undefined;
  }
  
  return link;
}

export async function deleteExpiredShareLinks() {
  const db = await getDb();
  if (!db) return;

  await db.delete(shareLinks).where(eq(shareLinks.expiresAt, new Date()));
}

// Feedback
export async function submitFeedback(data: Omit<InsertFeedback, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if feedback already exists
  const existing = await db
    .select()
    .from(feedback)
    .where(
      and(
        eq(feedback.userId, data.userId),
        eq(feedback.historyId, data.historyId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing feedback
    await db
      .update(feedback)
      .set({ rating: data.rating, comment: data.comment })
      .where(eq(feedback.id, existing[0].id));
  } else {
    // Insert new feedback
    await db.insert(feedback).values(data);
  }
}

export async function getFeedbackStats(params: {
  skinKey?: string;
  startDate?: string;
  endDate?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (params.skinKey) {
    conditions.push(eq(transformHistory.skin, params.skinKey));
  }
  if (params.startDate) {
    conditions.push(gte(feedback.createdAt, new Date(params.startDate)));
  }
  if (params.endDate) {
    conditions.push(lte(feedback.createdAt, new Date(params.endDate)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const result = await db
    .select({
      skinKey: transformHistory.skin,
      goodCount: sql<number>`SUM(CASE WHEN ${feedback.rating} = 'good' THEN 1 ELSE 0 END)`,
      badCount: sql<number>`SUM(CASE WHEN ${feedback.rating} = 'bad' THEN 1 ELSE 0 END)`,
      totalCount: sql<number>`COUNT(*)`,
    })
    .from(feedback)
    .innerJoin(transformHistory, eq(feedback.historyId, transformHistory.id))
    .where(whereClause)
    .groupBy(transformHistory.skin);

  return result.map((row) => ({
    skinKey: row.skinKey,
    goodCount: Number(row.goodCount),
    badCount: Number(row.badCount),
    totalCount: Number(row.totalCount),
    goodPercentage: Number(row.totalCount) > 0
      ? Math.round((Number(row.goodCount) / Number(row.totalCount)) * 100 * 100) / 100
      : 0,
  }));
}

export async function getFeedbackList(params: {
  skinKey?: string;
  rating?: "good" | "bad";
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { feedbacks: [], total: 0 };

  const conditions = [];
  if (params.skinKey) {
    conditions.push(eq(transformHistory.skin, params.skinKey));
  }
  if (params.rating) {
    conditions.push(eq(feedback.rating, params.rating));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const feedbacks = await db
    .select({
      id: feedback.id,
      userId: feedback.userId,
      historyId: feedback.historyId,
      rating: feedback.rating,
      comment: feedback.comment,
      createdAt: feedback.createdAt,
      skinKey: transformHistory.skin,
      inputText: transformHistory.url,
      outputText: transformHistory.snippet,
    })
    .from(feedback)
    .innerJoin(transformHistory, eq(feedback.historyId, transformHistory.id))
    .where(whereClause)
    .orderBy(desc(feedback.createdAt))
    .limit(params.limit || 50)
    .offset(params.offset || 0);

  const totalResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(feedback)
    .innerJoin(transformHistory, eq(feedback.historyId, transformHistory.id))
    .where(whereClause);

  return {
    feedbacks,
    total: Number(totalResult[0]?.count || 0),
  };
}

// ============================================================
// Favorite Skins
// ============================================================

export async function addFavoriteSkin(userId: number, skinKey: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(favoriteSkins).values({
      userId,
      skinKey,
    });
    return { success: true };
  } catch (error) {
    // Unique constraint violation (already favorited)
    // Unique constraint violation (already favorited)
    // Drizzle wraps the error, so we need to check both the error itself and its cause
    const err = error as any;
    const cause = err.cause || err;
    if (cause.errno === 1062 || cause.code === 'ER_DUP_ENTRY' || err.errno === 1062 || err.code === 'ER_DUP_ENTRY') {
      return { success: false, error: 'Already favorited' };
    }
    throw error;
  }
}

export async function removeFavoriteSkin(userId: number, skinKey: string) {
  const db = await getDb();
  if (!db) return null;

  await db.delete(favoriteSkins).where(
    and(
      eq(favoriteSkins.userId, userId),
      eq(favoriteSkins.skinKey, skinKey)
    )
  );
  return { success: true };
}

export async function getFavoriteSkins(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const favorites = await db
    .select({
      skinKey: favoriteSkins.skinKey,
      createdAt: favoriteSkins.createdAt,
    })
    .from(favoriteSkins)
    .where(eq(favoriteSkins.userId, userId))
    .orderBy(favoriteSkins.createdAt);

  return favorites;
}

export async function isFavoriteSkin(userId: number, skinKey: string) {
  const db = await getDb();
  if (!db) return false;

  const result = await db
    .select({ id: favoriteSkins.id })
    .from(favoriteSkins)
    .where(
      and(
        eq(favoriteSkins.userId, userId),
        eq(favoriteSkins.skinKey, skinKey)
      )
    )
    .limit(1);

  return result.length > 0;
}

export async function reorderFavoriteSkins(userId: number, orderedSkinKeys: string[]) {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    // Note: orderIndex is not currently implemented
    // Favorites are ordered by creation date
    return { success: true };
  } catch (error) {
    console.error('[reorderFavoriteSkins] Error:', error);
    return { success: false };
  }
}

// ============================================================
// Rate Limiting
// ============================================================

// Rate limit constants are imported from @shared/constants

// In-memory cache for minute-based rate limiting
// Structure: Map<userId, Array<timestamp>>
const minuteRateLimitCache = new Map<number, number[]>();

/**
 * Clean up old entries from the minute rate limit cache
 */
function cleanupMinuteCache() {
  const now = Date.now();
  const cutoff = now - MINUTE_WINDOW_MS;
  
  for (const [userId, timestamps] of Array.from(minuteRateLimitCache.entries())) {
    const validTimestamps = timestamps.filter((ts: number) => ts > cutoff);
    if (validTimestamps.length === 0) {
      minuteRateLimitCache.delete(userId);
    } else {
      minuteRateLimitCache.set(userId, validTimestamps);
    }
  }
}

// Clean up cache every minute
setInterval(cleanupMinuteCache, MINUTE_WINDOW_MS);

/**
 * Check minute-based rate limit (in-memory)
 * @param userId - User ID
 * @returns Whether the request is allowed and remaining requests
 */
function checkMinuteRateLimit(userId: number): { allowed: boolean; remaining: number; message?: string } {
  const now = Date.now();
  const cutoff = now - MINUTE_WINDOW_MS;
  
  // Get user's recent requests
  const timestamps = minuteRateLimitCache.get(userId) || [];
  
  // Filter out old timestamps
  const recentTimestamps = timestamps.filter(ts => ts > cutoff);
  
  // Check if limit exceeded
  if (recentTimestamps.length >= MINUTE_LIMIT) {
    return { 
      allowed: false, 
      remaining: 0,
      message: `1分間のリクエスト上限（${MINUTE_LIMIT}回）に達しました。少し待ってから再試行してください。`
    };
  }
  
  // Add current timestamp
  recentTimestamps.push(now);
  minuteRateLimitCache.set(userId, recentTimestamps);
  
  return { 
    allowed: true, 
    remaining: MINUTE_LIMIT - recentTimestamps.length 
  };
}

/**
 * Check rate limit (both daily and minute-based)
 * @param userId - User ID
 * @returns Whether the request is allowed, remaining requests, and optional message
 */
export async function checkRateLimit(userId: number): Promise<{ allowed: boolean; remaining: number; message?: string }> {
  // First check minute-based rate limit (fast, in-memory)
  const minuteCheck = checkMinuteRateLimit(userId);
  if (!minuteCheck.allowed) {
    return minuteCheck;
  }
  
  // Then check daily rate limit (slower, database)
  const db = await getDb();
  if (!db) return { allowed: true, remaining: DAILY_LIMIT }; // Allow if DB is unavailable

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  try {
    // Get or create today's rate limit record
    const [record] = await db
      .select()
      .from(rateLimits)
      .where(
        and(
          eq(rateLimits.userId, userId),
          eq(rateLimits.date, today)
        )
      )
      .limit(1);

    if (!record) {
      // Create new record for today
      await db.insert(rateLimits).values({
        userId,
        date: today,
        count: 1,
      });
      return { allowed: true, remaining: DAILY_LIMIT - 1 };
    }

    if (record.count >= DAILY_LIMIT) {
      return { 
        allowed: false, 
        remaining: 0,
        message: `一日の変換回数上限（${DAILY_LIMIT}回）に達しました。明日またお試しください。`
      };
    }

    // Increment count
    await db
      .update(rateLimits)
      .set({ count: record.count + 1 })
      .where(eq(rateLimits.id, record.id));

    return { allowed: true, remaining: DAILY_LIMIT - record.count - 1 };
  } catch (error) {
    console.error('[RateLimit] Error checking rate limit:', error);
    return { allowed: true, remaining: DAILY_LIMIT }; // Allow on error
  }
}

export async function getRateLimitStatus(userId: number): Promise<{ count: number; limit: number; remaining: number }> {
  const db = await getDb();
  if (!db) return { count: 0, limit: DAILY_LIMIT, remaining: DAILY_LIMIT };

  const today = new Date().toISOString().split('T')[0];

  const [record] = await db
    .select()
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.userId, userId),
        eq(rateLimits.date, today)
      )
    )
    .limit(1);

  const count = record?.count || 0;
  return {
    count,
    limit: DAILY_LIMIT,
    remaining: Math.max(0, DAILY_LIMIT - count),
  };
}

// ============================================================
// Custom Skins
// ============================================================

export async function createCustomSkin(data: InsertCustomSkin) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const [result] = await db.insert(customSkins).values(data);
  return result.insertId;
}

export async function getCustomSkinsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(customSkins)
    .where(
      and(
        eq(customSkins.userId, userId),
        eq(customSkins.isActive, 1)
      )
    )
    .orderBy(desc(customSkins.createdAt));
}

export async function getCustomSkinById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const [skin] = await db
    .select()
    .from(customSkins)
    .where(
      and(
        eq(customSkins.id, id),
        eq(customSkins.userId, userId)
      )
    )
    .limit(1);

  return skin || null;
}

export async function updateCustomSkin(id: number, userId: number, data: Partial<InsertCustomSkin>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(customSkins)
    .set(data)
    .where(
      and(
        eq(customSkins.id, id),
        eq(customSkins.userId, userId)
      )
    );
}

export async function deleteCustomSkin(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(customSkins)
    .where(
      and(
        eq(customSkins.id, id),
        eq(customSkins.userId, userId)
      )
    );
}
