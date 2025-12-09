import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getUserSettings, upsertUserSettings } from "../db";

/**
 * Settings router
 * Handles user settings management
 */
export const settingsRouter = router({
  /**
   * Get user settings
   */
  get: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getUserSettings(ctx.user.id);
    // Return default values if settings don't exist
    return settings || {
      userId: ctx.user.id,
      encryptedApiKey: null,
      defaultSkin: "kansai_banter",
      defaultTemperature: null,
      defaultTopP: null,
      defaultMaxTokens: null,
      defaultLengthRatio: null,
      safetyLevel: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }),
  
  /**
   * Update user settings
   */
  update: protectedProcedure
    .input(z.object({
      encryptedApiKey: z.string().optional(),
      defaultSkin: z.string().optional(),
      defaultTemperature: z.number().optional(),
      defaultTopP: z.number().optional(),
      defaultMaxTokens: z.number().optional(),
      defaultLengthRatio: z.number().optional(),
      safetyLevel: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      console.log('[settings.update] Received input:', JSON.stringify(input, null, 2));
      console.log('[settings.update] User ID:', ctx.user.id);
      
      await upsertUserSettings({
        userId: ctx.user.id,
        ...input,
      });
      
      console.log('[settings.update] Settings saved successfully');
      return { success: true };
    }),
});
