/**
 * CSRF（クロスサイトリクエストフォージェリ）対策
 * - トークン生成
 * - トークン検証
 * - タイミング攻撃対策
 */

import crypto from 'crypto';
import { TRPCError } from '@trpc/server';

/**
 * CSRFトークンを生成
 * - 32バイトのランダムトークン（64文字の16進数）
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * CSRFトークンを検証
 * - タイミング攻撃対策（crypto.timingSafeEqual使用）
 */
export function verifyCsrfToken(token: string, expectedToken: string): boolean {
  if (!token || !expectedToken) {
    return false;
  }

  // 長さが異なる場合は即座に拒否
  if (token.length !== expectedToken.length) {
    return false;
  }

  try {
    // タイミング攻撃対策：常に同じ時間で比較
    const tokenBuffer = Buffer.from(token, 'utf8');
    const expectedBuffer = Buffer.from(expectedToken, 'utf8');
    
    return crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
  } catch (error) {
    return false;
  }
}

/**
 * CSRFトークンをセッションに保存
 */
export function setCsrfTokenInSession(session: any): string {
  const token = generateCsrfToken();
  session.csrfToken = token;
  return token;
}

/**
 * CSRFトークンをセッションから取得
 */
export function getCsrfTokenFromSession(session: any): string | null {
  return session?.csrfToken || null;
}

/**
 * CSRFトークンをリクエストヘッダーから取得
 */
export function getCsrfTokenFromHeader(headers: any): string | null {
  return headers['x-csrf-token'] || headers['X-CSRF-Token'] || null;
}

/**
 * CSRFトークンを検証してエラーをスロー
 */
export function validateCsrfToken(
  headerToken: string | null,
  sessionToken: string | null
): void {
  if (!sessionToken) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'CSRF token not found in session',
    });
  }

  if (!headerToken) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'CSRF token not found in request',
    });
  }

  if (!verifyCsrfToken(headerToken, sessionToken)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Invalid CSRF token',
    });
  }
}
