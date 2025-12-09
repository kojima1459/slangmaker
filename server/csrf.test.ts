import { describe, it, expect } from 'vitest';
import {
  generateCsrfToken,
  verifyCsrfToken,
  setCsrfTokenInSession,
  getCsrfTokenFromSession,
  getCsrfTokenFromHeader,
  validateCsrfToken,
} from './_core/csrf';

describe('CSRF Protection', () => {
  describe('generateCsrfToken', () => {
    it('should generate a 64-character hex string', () => {
      const token = generateCsrfToken();
      expect(token).toHaveLength(64);
      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('verifyCsrfToken', () => {
    it('should verify matching tokens', () => {
      const token = generateCsrfToken();
      expect(verifyCsrfToken(token, token)).toBe(true);
    });

    it('should reject non-matching tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(verifyCsrfToken(token1, token2)).toBe(false);
    });

    it('should reject empty tokens', () => {
      expect(verifyCsrfToken('', 'token')).toBe(false);
      expect(verifyCsrfToken('token', '')).toBe(false);
    });

    it('should reject tokens with different lengths', () => {
      expect(verifyCsrfToken('short', 'verylongtoken')).toBe(false);
    });
  });

  describe('setCsrfTokenInSession', () => {
    it('should set CSRF token in session', () => {
      const session: any = {};
      const token = setCsrfTokenInSession(session);

      expect(session.csrfToken).toBe(token);
      expect(token).toHaveLength(64);
    });
  });

  describe('getCsrfTokenFromSession', () => {
    it('should get CSRF token from session', () => {
      const token = generateCsrfToken();
      const session = { csrfToken: token };

      expect(getCsrfTokenFromSession(session)).toBe(token);
    });

    it('should return null if token not in session', () => {
      const session = {};
      expect(getCsrfTokenFromSession(session)).toBeNull();
    });
  });

  describe('getCsrfTokenFromHeader', () => {
    it('should get CSRF token from lowercase header', () => {
      const token = generateCsrfToken();
      const headers = { 'x-csrf-token': token };

      expect(getCsrfTokenFromHeader(headers)).toBe(token);
    });

    it('should get CSRF token from capitalized header', () => {
      const token = generateCsrfToken();
      const headers = { 'X-CSRF-Token': token };

      expect(getCsrfTokenFromHeader(headers)).toBe(token);
    });

    it('should return null if token not in headers', () => {
      const headers = {};
      expect(getCsrfTokenFromHeader(headers)).toBeNull();
    });
  });

  describe('validateCsrfToken', () => {
    it('should validate matching tokens', () => {
      const token = generateCsrfToken();
      expect(() => validateCsrfToken(token, token)).not.toThrow();
    });

    it('should throw error for missing session token', () => {
      const token = generateCsrfToken();
      expect(() => validateCsrfToken(token, null)).toThrow('not found in session');
    });

    it('should throw error for missing header token', () => {
      const token = generateCsrfToken();
      expect(() => validateCsrfToken(null, token)).toThrow('not found in request');
    });

    it('should throw error for non-matching tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(() => validateCsrfToken(token1, token2)).toThrow('Invalid CSRF token');
    });
  });
});
