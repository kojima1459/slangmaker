import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  logger,
  logRequest,
  logDatabase,
  logLLM,
  logSecurity,
  logPerformance,
} from './_core/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logger', () => {
    it('should have correct log methods', () => {
      expect(logger).toHaveProperty('trace');
      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
      expect(logger).toHaveProperty('fatal');
    });

    it('should log info messages', () => {
      const spy = vi.spyOn(logger, 'info');
      logger.info('Test info message');
      expect(spy).toHaveBeenCalledWith('Test info message');
    });

    it('should log error messages', () => {
      const spy = vi.spyOn(logger, 'error');
      logger.error('Test error message');
      expect(spy).toHaveBeenCalledWith('Test error message');
    });
  });

  describe('logRequest', () => {
    it('should log successful request', () => {
      const spy = vi.spyOn(logger, 'info');
      logRequest({
        path: '/api/transform',
        type: 'mutation',
        userId: 1,
        duration: 100,
      });

      expect(spy).toHaveBeenCalled();
    });

    it('should log failed request', () => {
      const spy = vi.spyOn(logger, 'error');
      logRequest({
        path: '/api/transform',
        type: 'mutation',
        userId: 1,
        duration: 100,
        error: new Error('Test error'),
      });

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('logDatabase', () => {
    it('should log successful database operation', () => {
      const spy = vi.spyOn(logger, 'debug');
      logDatabase({
        operation: 'select',
        table: 'users',
        userId: 1,
        duration: 50,
      });

      expect(spy).toHaveBeenCalled();
    });

    it('should log failed database operation', () => {
      const spy = vi.spyOn(logger, 'error');
      logDatabase({
        operation: 'insert',
        table: 'users',
        userId: 1,
        duration: 50,
        error: new Error('Database error'),
      });

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('logLLM', () => {
    it('should log successful LLM operation', () => {
      const spy = vi.spyOn(logger, 'info');
      logLLM({
        operation: 'transform',
        model: 'gemini-2.5-flash',
        userId: 1,
        tokensIn: 100,
        tokensOut: 200,
        duration: 2000,
      });

      expect(spy).toHaveBeenCalled();
    });

    it('should log failed LLM operation', () => {
      const spy = vi.spyOn(logger, 'error');
      logLLM({
        operation: 'transform',
        model: 'gemini-2.5-flash',
        userId: 1,
        duration: 2000,
        error: new Error('LLM error'),
      });

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('logSecurity', () => {
    it('should log security event', () => {
      const spy = vi.spyOn(logger, 'warn');
      logSecurity({
        event: 'rate_limit_exceeded',
        userId: 1,
        ip: '192.168.1.1',
        details: { limit: 100 },
      });

      expect(spy).toHaveBeenCalled();
    });
  });

  describe('logPerformance', () => {
    it('should log slow operation', () => {
      const spy = vi.spyOn(logger, 'warn');
      logPerformance({
        operation: 'transform',
        duration: 5000,
        threshold: 1000,
      });

      expect(spy).toHaveBeenCalled();
    });

    it('should log fast operation', () => {
      const spy = vi.spyOn(logger, 'debug');
      logPerformance({
        operation: 'transform',
        duration: 500,
        threshold: 1000,
      });

      expect(spy).toHaveBeenCalled();
    });
  });
});
