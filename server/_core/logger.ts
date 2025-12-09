/**
 * 構造化ロギング（pino）
 * - ログレベル管理（trace, debug, info, warn, error, fatal）
 * - JSON形式ログ
 * - エラートレース
 */

import pino from 'pino';

/**
 * ログレベルの設定
 * - development: debug
 * - production: info
 */
const logLevel = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

/**
 * Pinoロガーの設定
 */
export const logger = pino({
  level: logLevel,
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'yyyy-mm-dd HH:MM:ss',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * リクエストロガー（tRPCミドルウェア用）
 */
export function logRequest(params: {
  path: string;
  type: string;
  userId?: number;
  duration?: number;
  error?: Error;
}) {
  const { path, type, userId, duration, error } = params;

  if (error) {
    logger.error({
      path,
      type,
      userId,
      duration,
      error: {
        message: error.message,
        stack: error.stack,
      },
    }, `Request failed: ${path}`);
  } else {
    logger.info({
      path,
      type,
      userId,
      duration,
    }, `Request completed: ${path}`);
  }
}

/**
 * データベースロガー
 */
export function logDatabase(params: {
  operation: string;
  table?: string;
  userId?: number;
  duration?: number;
  error?: Error;
}) {
  const { operation, table, userId, duration, error } = params;

  if (error) {
    logger.error({
      operation,
      table,
      userId,
      duration,
      error: {
        message: error.message,
        stack: error.stack,
      },
    }, `Database operation failed: ${operation}`);
  } else {
    logger.debug({
      operation,
      table,
      userId,
      duration,
    }, `Database operation completed: ${operation}`);
  }
}

/**
 * LLMロガー
 */
export function logLLM(params: {
  operation: string;
  model?: string;
  userId?: number;
  tokensIn?: number;
  tokensOut?: number;
  duration?: number;
  error?: Error;
}) {
  const { operation, model, userId, tokensIn, tokensOut, duration, error } = params;

  if (error) {
    logger.error({
      operation,
      model,
      userId,
      tokensIn,
      tokensOut,
      duration,
      error: {
        message: error.message,
        stack: error.stack,
      },
    }, `LLM operation failed: ${operation}`);
  } else {
    logger.info({
      operation,
      model,
      userId,
      tokensIn,
      tokensOut,
      duration,
    }, `LLM operation completed: ${operation}`);
  }
}

/**
 * セキュリティロガー
 */
export function logSecurity(params: {
  event: string;
  userId?: number;
  ip?: string;
  details?: Record<string, any>;
}) {
  const { event, userId, ip, details } = params;

  logger.warn({
    event,
    userId,
    ip,
    details,
  }, `Security event: ${event}`);
}

/**
 * パフォーマンスロガー
 */
export function logPerformance(params: {
  operation: string;
  duration: number;
  threshold?: number;
}) {
  const { operation, duration, threshold = 1000 } = params;

  if (duration > threshold) {
    logger.warn({
      operation,
      duration,
      threshold,
    }, `Slow operation detected: ${operation} (${duration}ms)`);
  } else {
    logger.debug({
      operation,
      duration,
    }, `Performance: ${operation} (${duration}ms)`);
  }
}
