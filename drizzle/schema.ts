import { int, mysqlEnum, mysqlTable, text, timestamp, unique, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User settings for 言い換えメーカー
 * Stores user preferences, default skin, API key reference, etc.
 */
export const userSettings = mysqlTable("user_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** Encrypted Gemini API key (client-side encryption, stored as reference) */
  encryptedApiKey: text("encryptedApiKey"),
  defaultSkin: varchar("defaultSkin", { length: 64 }).default("kansai_banter"),
  defaultTemperature: int("defaultTemperature").default(130), // 1.3 * 100
  defaultTopP: int("defaultTopP").default(90), // 0.9 * 100
  defaultMaxTokens: int("defaultMaxTokens").default(220),
  defaultLengthRatio: int("defaultLengthRatio").default(100), // 1.0 * 100
  safetyLevel: varchar("safetyLevel", { length: 32 }).default("moderate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = typeof userSettings.$inferInsert;

/**
 * Rate limiting table
 * Tracks API usage per user per day
 */
export const rateLimits = mysqlTable("rate_limits", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD format
  count: int("count").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RateLimit = typeof rateLimits.$inferSelect;
export type InsertRateLimit = typeof rateLimits.$inferInsert;

/**
 * Favorite skins
 * Stores user's favorite skins for quick access
 */
export const favoriteSkins = mysqlTable("favorite_skins", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  skinKey: varchar("skinKey", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: one user can only favorite a skin once
  uniqueUserSkin: unique().on(table.userId, table.skinKey),
}));

export type FavoriteSkin = typeof favoriteSkins.$inferSelect;
export type InsertFavoriteSkin = typeof favoriteSkins.$inferInsert;

/**
 * Transformation history
 * Stores metadata about each transformation (URL, title, skin, params, snippet)
 * Full output text is NOT stored on server (client-side only via IndexedDB)
 */
export const transformHistory = mysqlTable("transform_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  title: text("title"),
  site: varchar("site", { length: 255 }),
  lang: varchar("lang", { length: 10 }).default("ja"),
  skin: varchar("skin", { length: 64 }).notNull(),
  /** JSON string of transformation parameters */
  params: text("params").notNull(),
  /** Short snippet of output for preview (max 200 chars) */
  snippet: text("snippet"),
  /** Hash of output for deduplication (optional) */
  outputHash: varchar("outputHash", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TransformHistory = typeof transformHistory.$inferSelect;
export type InsertTransformHistory = typeof transformHistory.$inferInsert;

/**
 * Share links (temporary signed URLs for sharing transformed content)
 * 24h TTL, stores the transformed text for read-only access
 */
export const shareLinks = mysqlTable("share_links", {
  id: varchar("id", { length: 32 }).primaryKey(), // nanoid
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  /** The transformed output text */
  content: text("content").notNull(),
  /** Source URL */
  sourceUrl: text("sourceUrl").notNull(),
  /** Skin used */
  skin: varchar("skin", { length: 64 }).notNull(),
  /** Expiration timestamp (24h from creation) */
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShareLink = typeof shareLinks.$inferSelect;
export type InsertShareLink = typeof shareLinks.$inferInsert;

/**
 * Feedback table
 * Stores user feedback (good/bad) for transformation results
 */
export const feedback = mysqlTable("feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  historyId: int("historyId").notNull().references(() => transformHistory.id, { onDelete: "cascade" }),
  rating: mysqlEnum("rating", ["good", "bad"]).notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  // Unique constraint: one feedback per user per history
  uniqueUserHistory: {
    columns: [table.userId, table.historyId],
    name: "unique_user_history"
  }
}));

export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;
