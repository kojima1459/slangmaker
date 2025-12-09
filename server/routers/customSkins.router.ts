import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { 
  createCustomSkin,
  getCustomSkinsByUserId,
  getCustomSkinById,
  updateCustomSkin,
  deleteCustomSkin
} from "../db";
import { CUSTOM_SKIN_KEY_MAX_LENGTH, CUSTOM_SKIN_NAME_MAX_LENGTH } from "@shared/constants";

/**
 * Custom skins router
 * Handles user-created custom skins
 */
export const customSkinsRouter = router({
  /**
   * List user's custom skins
   */
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const skins = await getCustomSkinsByUserId(ctx.user.id);
      return { skins };
    }),

  /**
   * Get a custom skin by ID
   */
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const skin = await getCustomSkinById(input.id, ctx.user.id);
      if (!skin) {
        throw new TRPCError({ code: "NOT_FOUND", message: "カスタムスキンが見つかりません" });
      }
      return { skin };
    }),

  /**
   * Create a new custom skin
   */
  create: protectedProcedure
    .input(z.object({
      key: z.string().min(1).max(CUSTOM_SKIN_KEY_MAX_LENGTH),
      name: z.string().min(1).max(CUSTOM_SKIN_NAME_MAX_LENGTH),
      description: z.string().optional(),
      prompt: z.string().min(1),
      example: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await createCustomSkin({
        userId: ctx.user.id,
        key: input.key,
        name: input.name,
        description: input.description,
        prompt: input.prompt,
        example: input.example,
        isActive: 1,
      });
      return { success: true, id, message: "カスタムスキンを作成しました" };
    }),

  /**
   * Update a custom skin
   */
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(CUSTOM_SKIN_NAME_MAX_LENGTH).optional(),
      description: z.string().optional(),
      prompt: z.string().min(1).optional(),
      example: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateCustomSkin(id, ctx.user.id, data);
      return { success: true, message: "カスタムスキンを更新しました" };
    }),

  /**
   * Delete a custom skin
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteCustomSkin(input.id, ctx.user.id);
      return { success: true, message: "カスタムスキンを削除しました" };
    }),
});
