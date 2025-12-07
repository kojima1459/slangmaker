import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { users, favoriteSkins } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("favorites.reorder", () => {
  let testUserId: number;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    // Create a test user
    const [result] = await db.insert(users).values({
      openId: `test-reorder-${Date.now()}`,
      name: "Test Reorder User",
      email: "test-reorder@example.com",
    });
    testUserId = result.insertId;

    // Create caller with test user context
    const mockContext: TrpcContext = {
      user: {
        id: testUserId,
        openId: `test-reorder-${Date.now()}`,
        name: "Test Reorder User",
        email: "test-reorder@example.com",
        loginMethod: "test",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    caller = appRouter.createCaller(mockContext);

    // Add some favorite skins
    await caller.favorites.add({ skinKey: "kansai_banter" });
    await caller.favorites.add({ skinKey: "detached_literary" });
    await caller.favorites.add({ skinKey: "poetic_emo" });
  });

  it("should reorder favorite skins successfully", async () => {
    // Get initial order
    const initialList = await caller.favorites.list();
    expect(initialList.favorites).toHaveLength(3);
    expect(initialList.favorites[0].skinKey).toBe("kansai_banter");
    expect(initialList.favorites[1].skinKey).toBe("detached_literary");
    expect(initialList.favorites[2].skinKey).toBe("poetic_emo");

    // Reorder: move last item to first
    const newOrder = ["poetic_emo", "kansai_banter", "detached_literary"];
    const result = await caller.favorites.reorder({ orderedSkinKeys: newOrder });
    expect(result.success).toBe(true);

    // Verify new order
    const updatedList = await caller.favorites.list();
    expect(updatedList.favorites).toHaveLength(3);
    expect(updatedList.favorites[0].skinKey).toBe("poetic_emo");
    expect(updatedList.favorites[1].skinKey).toBe("kansai_banter");
    expect(updatedList.favorites[2].skinKey).toBe("detached_literary");
  });

  it("should persist order after multiple reorders", async () => {
    // First reorder
    await caller.favorites.reorder({ 
      orderedSkinKeys: ["detached_literary", "poetic_emo", "kansai_banter"] 
    });

    // Second reorder
    await caller.favorites.reorder({ 
      orderedSkinKeys: ["kansai_banter", "detached_literary", "poetic_emo"] 
    });

    // Verify final order
    const finalList = await caller.favorites.list();
    expect(finalList.favorites[0].skinKey).toBe("kansai_banter");
    expect(finalList.favorites[1].skinKey).toBe("detached_literary");
    expect(finalList.favorites[2].skinKey).toBe("poetic_emo");
  });

  it("should handle partial reorder (subset of favorites)", async () => {
    // Reorder only first two items
    const partialOrder = ["detached_literary", "kansai_banter"];
    await caller.favorites.reorder({ orderedSkinKeys: partialOrder });

    // Verify that reordered items are at the beginning
    const list = await caller.favorites.list();
    expect(list.favorites[0].skinKey).toBe("detached_literary");
    expect(list.favorites[1].skinKey).toBe("kansai_banter");
    // Third item should still exist
    expect(list.favorites[2].skinKey).toBe("poetic_emo");
  });

  it("should return correct orderIndex values", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Reorder to a known state
    await caller.favorites.reorder({ 
      orderedSkinKeys: ["poetic_emo", "kansai_banter", "detached_literary"] 
    });

    // Query database directly to check orderIndex
    const favorites = await db
      .select()
      .from(favoriteSkins)
      .where(eq(favoriteSkins.userId, testUserId))
      .orderBy(favoriteSkins.orderIndex);

    expect(favorites[0].skinKey).toBe("poetic_emo");
    expect(favorites[0].orderIndex).toBe(0);
    expect(favorites[1].skinKey).toBe("kansai_banter");
    expect(favorites[1].orderIndex).toBe(1);
    expect(favorites[2].skinKey).toBe("detached_literary");
    expect(favorites[2].orderIndex).toBe(2);
  });
});
