/**
 * データベース接続エラーハンドリング
 * - 指数バックオフ再接続
 * - リトライロジック
 */

/**
 * Sleep for a given number of milliseconds
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate exponential backoff delay
 * @param attempt - Current attempt number (0-indexed)
 * @param baseDelay - Base delay in milliseconds (default: 1000ms)
 * @param maxDelay - Maximum delay in milliseconds (default: 30000ms)
 * @returns Delay in milliseconds with jitter
 */
export function calculateBackoffDelay(
  attempt: number,
  baseDelay = 1000,
  maxDelay = 30000
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelay * Math.pow(2, attempt);

  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Add jitter (±25%)
  const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);

  return Math.floor(cappedDelay + jitter);
}

/**
 * Check if an error is retryable (connection errors, timeouts)
 */
export function isRetryableDbError(error: any): boolean {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';

  // Connection errors
  if (
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('enotfound') ||
    errorMessage.includes('etimedout') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout')
  ) {
    return true;
  }

  // MySQL specific error codes
  if (
    errorCode === 'er_lock_wait_timeout' ||
    errorCode === 'er_lock_deadlock' ||
    errorCode === 'protocol_connection_lost' ||
    errorCode === 'econnreset'
  ) {
    return true;
  }

  return false;
}

/**
 * Retry a database operation with exponential backoff
 * @param operation - Async function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param operationName - Name of the operation for logging
 * @returns Result of the operation
 */
export async function retryDbOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  operationName = 'Database operation'
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Check if error is retryable
      if (!isRetryableDbError(error) || attempt >= maxRetries) {
        console.error(`[DB] ${operationName} failed (non-retryable or max retries):`, error);
        throw error;
      }

      // Calculate delay and retry
      const delay = calculateBackoffDelay(attempt);
      console.warn(
        `[DB] ${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}. ` +
        `Retrying in ${delay}ms...`
      );
      await sleep(delay);
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error(`${operationName} failed after all retries`);
}
