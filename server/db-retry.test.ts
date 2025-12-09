import { describe, it, expect, vi } from 'vitest';
import {
  calculateBackoffDelay,
  isRetryableDbError,
  retryDbOperation,
} from './_core/db-retry';

describe('DB Retry Logic', () => {
  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff', () => {
      const delay0 = calculateBackoffDelay(0, 1000, 30000);
      const delay1 = calculateBackoffDelay(1, 1000, 30000);
      const delay2 = calculateBackoffDelay(2, 1000, 30000);

      // Delay should increase exponentially (with jitter)
      expect(delay0).toBeGreaterThanOrEqual(750); // 1000 - 25%
      expect(delay0).toBeLessThanOrEqual(1250); // 1000 + 25%

      expect(delay1).toBeGreaterThanOrEqual(1500); // 2000 - 25%
      expect(delay1).toBeLessThanOrEqual(2500); // 2000 + 25%

      expect(delay2).toBeGreaterThanOrEqual(3000); // 4000 - 25%
      expect(delay2).toBeLessThanOrEqual(5000); // 4000 + 25%
    });

    it('should cap at maxDelay', () => {
      const delay = calculateBackoffDelay(10, 1000, 5000);
      expect(delay).toBeLessThanOrEqual(6250); // 5000 + 25%
    });
  });

  describe('isRetryableDbError', () => {
    it('should identify connection errors', () => {
      const error1 = new Error('ECONNREFUSED');
      const error2 = new Error('Connection timeout');
      const error3 = new Error('ETIMEDOUT');

      expect(isRetryableDbError(error1)).toBe(true);
      expect(isRetryableDbError(error2)).toBe(true);
      expect(isRetryableDbError(error3)).toBe(true);
    });

    it('should identify MySQL specific errors', () => {
      const error1 = { code: 'ER_LOCK_WAIT_TIMEOUT', message: 'Lock wait timeout' };
      const error2 = { code: 'ER_LOCK_DEADLOCK', message: 'Deadlock found' };
      const error3 = { code: 'PROTOCOL_CONNECTION_LOST', message: 'Connection lost' };

      expect(isRetryableDbError(error1)).toBe(true);
      expect(isRetryableDbError(error2)).toBe(true);
      expect(isRetryableDbError(error3)).toBe(true);
    });

    it('should reject non-retryable errors', () => {
      const error1 = new Error('Syntax error');
      const error2 = new Error('Invalid query');
      const error3 = { code: 'ER_NO_SUCH_TABLE', message: 'Table not found' };

      expect(isRetryableDbError(error1)).toBe(false);
      expect(isRetryableDbError(error2)).toBe(false);
      expect(isRetryableDbError(error3)).toBe(false);
    });
  });

  describe('retryDbOperation', () => {
    it('should succeed on first attempt', async () => {
      const operation = vi.fn(async () => 'success');
      const result = await retryDbOperation(operation, 3, 'Test operation');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors', async () => {
      let attempts = 0;
      const operation = vi.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('ECONNREFUSED');
        }
        return 'success';
      });

      const result = await retryDbOperation(operation, 3, 'Test operation');

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    }, 10000);

    it('should throw error after max retries', async () => {
      const operation = vi.fn(async () => {
        throw new Error('ECONNREFUSED');
      });

      await expect(retryDbOperation(operation, 2, 'Test operation')).rejects.toThrow('ECONNREFUSED');
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    }, 10000);

    it('should not retry non-retryable errors', async () => {
      const operation = vi.fn(async () => {
        throw new Error('Syntax error');
      });

      await expect(retryDbOperation(operation, 3, 'Test operation')).rejects.toThrow('Syntax error');
      expect(operation).toHaveBeenCalledTimes(1); // No retries
    });
  });
});
