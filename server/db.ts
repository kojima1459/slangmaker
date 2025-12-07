import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  userSettings, 
  InsertUserSettings,
  transformHistory,
  InsertTransformHistory,
  shareLinks,
  InsertShareLink
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
