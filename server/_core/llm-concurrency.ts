/**
 * LLM API同時実行数制限
 * - p-limitを使用して同時実行数を5に制限
 * - API負荷を管理し、コスト爆発を防止
 */

import pLimit from 'p-limit';

/**
 * LLM API同時実行数制限（5並列）
 */
const llmConcurrencyLimit = pLimit(5);

/**
 * LLM APIを同時実行数制限付きで呼び出す
 * @param operation - LLM API呼び出し関数
 * @returns LLM APIのレスポンス
 */
export async function limitedLLMCall<T>(operation: () => Promise<T>): Promise<T> {
  return llmConcurrencyLimit(operation);
}

/**
 * 現在のアクティブな実行数を取得
 */
export function getActiveLLMCalls(): number {
  return llmConcurrencyLimit.activeCount;
}

/**
 * 待機中のリクエスト数を取得
 */
export function getPendingLLMCalls(): number {
  return llmConcurrencyLimit.pendingCount;
}

/**
 * 同時実行数制限の統計情報を取得
 */
export function getLLMConcurrencyStats() {
  return {
    active: llmConcurrencyLimit.activeCount,
    pending: llmConcurrencyLimit.pendingCount,
    limit: 5,
  };
}

/**
 * 同時実行数制限をクリア（テスト用）
 */
export function clearLLMConcurrencyLimit() {
  llmConcurrencyLimit.clearQueue();
}
