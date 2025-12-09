/**
 * レート制限機能
 * - IPベースのレート制限（未認証ユーザー）
 * - ユーザーベースのレート制限（認証済みユーザー）
 * - 変換操作別のレート制限
 */

import { RateLimiterMemory } from 'rate-limiter-flexible';
import { TRPCError } from '@trpc/server';

/**
 * IPベースのレート制限（未認証ユーザー）
 * - 1分あたり100リクエスト
 */
const ipRateLimiter = new RateLimiterMemory({
  points: 100, // 100リクエスト
  duration: 60, // 1分
  blockDuration: 60, // ブロック期間: 1分
});

/**
 * ユーザーベースのレート制限（認証済みユーザー）
 * - 1日あたり1000リクエスト
 */
const userRateLimiter = new RateLimiterMemory({
  points: 1000, // 1000リクエスト
  duration: 86400, // 1日（24時間）
  blockDuration: 3600, // ブロック期間: 1時間
});

/**
 * 変換操作別のレート制限
 * - 1時間あたり100リクエスト
 */
const transformRateLimiter = new RateLimiterMemory({
  points: 100, // 100リクエスト
  duration: 3600, // 1時間
  blockDuration: 1800, // ブロック期間: 30分
});

/**
 * IPベースのレート制限をチェック
 */
export async function checkIpRateLimit(ip: string): Promise<void> {
  try {
    await ipRateLimiter.consume(ip);
  } catch (error: any) {
    const retryAfter = Math.ceil(error.msBeforeNext / 1000) || 60;
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Too many requests from this IP. Please try again in ${retryAfter} seconds.`,
      cause: { retryAfter },
    });
  }
}

/**
 * ユーザーベースのレート制限をチェック
 */
export async function checkUserRateLimit(userId: string): Promise<void> {
  try {
    await userRateLimiter.consume(userId);
  } catch (error: any) {
    const retryAfter = Math.ceil(error.msBeforeNext / 1000) || 3600;
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Daily request limit exceeded. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      cause: { retryAfter },
    });
  }
}

/**
 * 変換操作別のレート制限をチェック
 */
export async function checkTransformRateLimit(key: string): Promise<void> {
  try {
    await transformRateLimiter.consume(key);
  } catch (error: any) {
    const retryAfter = Math.ceil(error.msBeforeNext / 1000) || 1800;
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: `Transform rate limit exceeded. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      cause: { retryAfter },
    });
  }
}

/**
 * レート制限の残りポイントを取得
 */
export async function getRateLimitInfo(key: string, type: 'ip' | 'user' | 'transform') {
  let limiter: RateLimiterMemory;
  
  switch (type) {
    case 'ip':
      limiter = ipRateLimiter;
      break;
    case 'user':
      limiter = userRateLimiter;
      break;
    case 'transform':
      limiter = transformRateLimiter;
      break;
  }

  try {
    const res = await limiter.get(key);
    if (!res) {
      return {
        remainingPoints: limiter.points,
        totalPoints: limiter.points,
        resetTime: new Date(Date.now() + limiter.duration * 1000),
      };
    }

    return {
      remainingPoints: res.remainingPoints,
      totalPoints: limiter.points,
      resetTime: new Date(res.msBeforeNext + Date.now()),
    };
  } catch (error) {
    return {
      remainingPoints: 0,
      totalPoints: limiter.points,
      resetTime: new Date(),
    };
  }
}
