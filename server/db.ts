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
  InsertFeedback
} from "../drizzle/schema";
import { ENV } from './_core/env';

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
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserSettings(settings: InsertUserSettings) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(userSettings).values(settings).onDuplicateKeyUpdate({
    set: settings,
  });
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
