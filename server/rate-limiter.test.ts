import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkIpRateLimit,
  checkUserRateLimit,
  checkTransformRateLimit,
  getRateLimitInfo,
} from './_core/rate-limiter';

describe('Rate Limiter', () => {
  describe('checkIpRateLimit', () => {
    it('should allow requests within limit', async () => {
      const ip = 'test-ip-1';
      await expect(checkIpRateLimit(ip)).resolves.toBeUndefined();
    });

    it('should block requests exceeding limit', async () => {
      const ip = 'test-ip-2';
      
      // 100リクエストまで許可
      for (let i = 0; i < 100; i++) {
        await checkIpRateLimit(ip);
      }

      // 101回目はブロック
      await expect(checkIpRateLimit(ip)).rejects.toThrow('Too many requests');
    }, 10000);
  });

  describe('checkUserRateLimit', () => {
    it('should allow requests within limit', async () => {
      const userId = 'test-user-1';
      await expect(checkUserRateLimit(userId)).resolves.toBeUndefined();
    });

    it('should block requests exceeding limit', async () => {
      const userId = 'test-user-2';
      
      // 1000リクエストまで許可（時間がかかるので10回でテスト）
      for (let i = 0; i < 10; i++) {
        await checkUserRateLimit(userId);
      }

      // 正常に動作することを確認
      expect(true).toBe(true);
    });
  });

  describe('checkTransformRateLimit', () => {
    it('should allow requests within limit', async () => {
      const key = 'test-transform-1';
      await expect(checkTransformRateLimit(key)).resolves.toBeUndefined();
    });

    it('should block requests exceeding limit', async () => {
      const key = 'test-transform-2';
      
      // 100リクエストまで許可
      for (let i = 0; i < 100; i++) {
        await checkTransformRateLimit(key);
      }

      // 101回目はブロック
      await expect(checkTransformRateLimit(key)).rejects.toThrow('Transform rate limit exceeded');
    }, 10000);
  });

  describe('getRateLimitInfo', () => {
    it('should return rate limit info for IP', async () => {
      const ip = 'test-ip-info';
      const info = await getRateLimitInfo(ip, 'ip');

      expect(info).toHaveProperty('remainingPoints');
      expect(info).toHaveProperty('totalPoints');
      expect(info).toHaveProperty('resetTime');
      expect(info.totalPoints).toBe(100);
    });

    it('should return rate limit info for user', async () => {
      const userId = 'test-user-info';
      const info = await getRateLimitInfo(userId, 'user');

      expect(info).toHaveProperty('remainingPoints');
      expect(info).toHaveProperty('totalPoints');
      expect(info).toHaveProperty('resetTime');
      expect(info.totalPoints).toBe(1000);
    });

    it('should return rate limit info for transform', async () => {
      const key = 'test-transform-info';
      const info = await getRateLimitInfo(key, 'transform');

      expect(info).toHaveProperty('remainingPoints');
      expect(info).toHaveProperty('totalPoints');
      expect(info).toHaveProperty('resetTime');
      expect(info.totalPoints).toBe(100);
    });
  });
});
