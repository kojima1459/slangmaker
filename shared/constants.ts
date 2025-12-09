/**
 * Application-wide constants
 * 
 * This file contains all magic numbers and configuration values
 * used throughout the application for better maintainability.
 */

// ============================================================
// Rate Limiting
// ============================================================

/**
 * Maximum number of transformations allowed per day per user
 */
export const DAILY_LIMIT = 100;

/**
 * Maximum number of transformations allowed per minute per user
 */
export const MINUTE_LIMIT = 10;

/**
 * Time window for minute-based rate limiting (in milliseconds)
 */
export const MINUTE_WINDOW_MS = 60 * 1000; // 1 minute

// ============================================================
// Share Links
// ============================================================

/**
 * Expiry time for share links (in milliseconds)
 */
export const SHARE_LINK_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Length of share link ID (nanoid)
 */
export const SHARE_LINK_ID_LENGTH = 12;

// ============================================================
// Transform History
// ============================================================

/**
 * Maximum length of snippet saved in transform history
 */
export const SNIPPET_LENGTH = 200;

/**
 * Default number of history items to fetch
 */
export const DEFAULT_HISTORY_LIMIT = 50;

/**
 * Maximum number of history items that can be fetched at once
 */
export const MAX_HISTORY_LIMIT = 100;

// ============================================================
// LLM Configuration
// ============================================================

/**
 * Default maximum number of retries for LLM API calls
 */
export const LLM_MAX_RETRIES = 3;

/**
 * Default timeout for LLM API calls (in milliseconds)
 */
export const LLM_TIMEOUT_MS = 30000; // 30 seconds

/**
 * Base delay for exponential backoff (in milliseconds)
 */
export const LLM_BACKOFF_BASE_DELAY_MS = 1000; // 1 second

/**
 * Maximum delay for exponential backoff (in milliseconds)
 */
export const LLM_BACKOFF_MAX_DELAY_MS = 30000; // 30 seconds

// ============================================================
// Custom Skins
// ============================================================

/**
 * Maximum length of custom skin key
 */
export const CUSTOM_SKIN_KEY_MAX_LENGTH = 64;

/**
 * Maximum length of custom skin name
 */
export const CUSTOM_SKIN_NAME_MAX_LENGTH = 100;

// ============================================================
// Feedback
// ============================================================

/**
 * Default number of feedback items to fetch
 */
export const DEFAULT_FEEDBACK_LIMIT = 50;

/**
 * Default offset for feedback pagination
 */
export const DEFAULT_FEEDBACK_OFFSET = 0;
