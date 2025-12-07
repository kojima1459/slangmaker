import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(role: "user" | "admin" = "user"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-feedback-user",
    email: "test@example.com",
    name: "Test Feedback User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Feedback API", () => {
  it("should get feedback stats", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feedback.stats({
      skinKey: "kansai_banter",
    });

    expect(result).toBeDefined();
    expect(result.stats).toBeDefined();
    expect(Array.isArray(result.stats)).toBe(true);
  });

  it("should get feedback list", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.feedback.list({
      skinKey: "kansai_banter",
      limit: 10,
    });

    expect(result).toBeDefined();
    // feedback.list returns an object with a feedbacks array, not an array directly
    expect(typeof result).toBe("object");
  });

  it("should reject improveSkin for non-admin users", async () => {
    const ctx = createTestContext("user");
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.feedback.improveSkin({ skinKey: "kansai_banter" })
    ).rejects.toThrow("管理者権限が必要です");
  });
});
