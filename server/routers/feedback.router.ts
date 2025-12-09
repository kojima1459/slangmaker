import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { submitFeedback, getFeedbackStats, getFeedbackList } from "../db";
import { DEFAULT_FEEDBACK_LIMIT, DEFAULT_FEEDBACK_OFFSET } from "@shared/constants";

/**
 * Feedback router
 * Handles user feedback submission and statistics
 */
export const feedbackRouter = router({
  /**
   * Submit feedback for a transformation
   */
  submit: protectedProcedure
    .input(z.object({
      historyId: z.number(),
      rating: z.enum(["good", "bad"]),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await submitFeedback({
        userId: ctx.user.id,
        historyId: input.historyId,
        rating: input.rating,
        comment: input.comment,
      });
      return { success: true, message: "フィードバックありがとうございました！" };
    }),

  /**
   * Get feedback statistics
   */
  stats: protectedProcedure
    .input(z.object({
      skinKey: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const stats = await getFeedbackStats(input || {});
      return { stats };
    }),

  /**
   * List feedback entries
   */
  list: protectedProcedure
    .input(z.object({
      skinKey: z.string().optional(),
      rating: z.enum(["good", "bad"]).optional(),
      limit: z.number().default(DEFAULT_FEEDBACK_LIMIT),
      offset: z.number().default(DEFAULT_FEEDBACK_OFFSET),
    }).optional())
    .query(async ({ input }) => {
      const result = await getFeedbackList(input || {});
      return result;
    }),
});
