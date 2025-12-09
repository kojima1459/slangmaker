import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { 
  addFavoriteSkin,
  removeFavoriteSkin,
  getFavoriteSkins,
  isFavoriteSkin,
  reorderFavoriteSkins
} from "../db";

/**
 * Favorites router
 * Handles favorite skins management
 */
export const favoritesRouter = router({
  /**
   * List user's favorite skins
   */
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const favorites = await getFavoriteSkins(ctx.user.id);
      return { favorites };
    }),

  /**
   * Add a skin to favorites
   */
  add: protectedProcedure
    .input(z.object({
      skinKey: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await addFavoriteSkin(ctx.user.id, input.skinKey);
      if (!result) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "データベースエラー" });
      }
      if (!result.success) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "すでにお気に入りに追加されています" });
      }
      return { success: true, message: "お気に入りに追加しました" };
    }),

  /**
   * Remove a skin from favorites
   */
  remove: protectedProcedure
    .input(z.object({
      skinKey: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await removeFavoriteSkin(ctx.user.id, input.skinKey);
      return { success: true, message: "お気に入りから削除しました" };
    }),

  /**
   * Check if a skin is in favorites
   */
  check: protectedProcedure
    .input(z.object({
      skinKey: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const isFavorite = await isFavoriteSkin(ctx.user.id, input.skinKey);
      return { isFavorite };
    }),

  /**
   * Reorder favorite skins
   */
  reorder: protectedProcedure
    .input(z.object({
      orderedSkinKeys: z.array(z.string()),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await reorderFavoriteSkins(ctx.user.id, input.orderedSkinKeys);
      if (!result.success) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "並び替えに失敗しました" });
      }
      return { success: true, message: "並び替えを保存しました" };
    }),
});
