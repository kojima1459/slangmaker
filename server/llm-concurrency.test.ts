import { describe, it, expect, beforeEach } from 'vitest';
import {
  limitedLLMCall,
  getActiveLLMCalls,
  getPendingLLMCalls,
  getLLMConcurrencyStats,
  clearLLMConcurrencyLimit,
} from './_core/llm-concurrency';

describe('LLM Concurrency Control', () => {
  beforeEach(() => {
    clearLLMConcurrencyLimit();
  });

  describe('limitedLLMCall', () => {
    it('should execute single call successfully', async () => {
      const operation = async () => 'success';
      const result = await limitedLLMCall(operation);
      expect(result).toBe('success');
    });

    it('should limit concurrent executions to 5', async () => {
      let maxConcurrent = 0;
      let currentConcurrent = 0;

      const operation = async () => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        await new Promise(resolve => setTimeout(resolve, 100));
        currentConcurrent--;
        return 'success';
      };

      // Start 10 concurrent operations
      const promises = Array.from({ length: 10 }, () => limitedLLMCall(operation));
      await Promise.all(promises);

      // Max concurrent should be 5 or less
      expect(maxConcurrent).toBeLessThanOrEqual(5);
    }, 10000);

    it('should queue requests beyond limit', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'success';
      };

      // Start 10 concurrent operations
      const promises = Array.from({ length: 10 }, () => limitedLLMCall(operation));

      // Check stats immediately after starting
      await new Promise(resolve => setTimeout(resolve, 10));
      const stats = getLLMConcurrencyStats();

      // Should have active + pending = 10 (or close to it)
      expect(stats.active + stats.pending).toBeGreaterThan(0);
      expect(stats.limit).toBe(5);

      await Promise.all(promises);
    }, 10000);
  });

  describe('getActiveLLMCalls', () => {
    it('should return 0 when no calls are active', () => {
      expect(getActiveLLMCalls()).toBe(0);
    });

    it('should return active count during execution', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return 'success';
      };

      const promise = limitedLLMCall(operation);
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(getActiveLLMCalls()).toBeGreaterThan(0);
      await promise;
    });
  });

  describe('getPendingLLMCalls', () => {
    it('should return 0 when no calls are pending', () => {
      expect(getPendingLLMCalls()).toBe(0);
    });

    it('should return pending count when queue is full', async () => {
      const operation = async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return 'success';
      };

      // Start 10 operations (5 active, 5 pending)
      const promises = Array.from({ length: 10 }, () => limitedLLMCall(operation));
      await new Promise(resolve => setTimeout(resolve, 50));

      const pending = getPendingLLMCalls();
      expect(pending).toBeGreaterThan(0);

      await Promise.all(promises);
    }, 10000);
  });

  describe('getLLMConcurrencyStats', () => {
    it('should return correct stats', () => {
      const stats = getLLMConcurrencyStats();

      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('limit');
      expect(stats.limit).toBe(5);
    });
  });
});
