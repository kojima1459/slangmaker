/**
 * LLMプロンプトインジェクション攻撃を防止するためのサニタイズ関数
 */

/**
 * ユーザー入力をLLMプロンプト用にサニタイズ
 * - システムプロンプトの埋め込みを防止
 * - 制御文字を削除
 * - 長さを制限
 */
export function sanitizeForLLM(input: string, maxLength: number = 10000): string {
  // 1. 長さチェック
  if (input.length > maxLength) {
    throw new Error(`Input exceeds maximum length of ${maxLength} characters`);
  }

  // 2. 空文字列チェック
  if (input.trim().length === 0) {
    throw new Error('Input cannot be empty');
  }

  // 3. 制御文字を削除（\x00-\x1F、\x7F）ただし改行（\n）は保持
  let sanitized = input.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');

  // 4. 危険なパターンを検出・削除
  // - "[システムプロンプト]" や "System:" などのパターン
  const dangerousPatterns = [
    /\[システムプロンプト\]/gi,
    /\[system prompt\]/gi,
    /\[system\]/gi,
    /^system:/gim,
    /ignore previous instructions/gi,
    /forget everything/gi,
    /you are now/gi,
  ];

  for (const pattern of dangerousPatterns) {
    sanitized = sanitized.replace(pattern, '');
  }

  // 5. 連続した改行を1つに統一（最大3つまで許可）
  sanitized = sanitized.replace(/\n{4,}/g, '\n\n\n');

  // 6. 先頭・末尾の空白を削除
  sanitized = sanitized.trim();

  // 7. 再度長さチェック
  if (sanitized.length === 0) {
    throw new Error('Input is empty after sanitization');
  }

  return sanitized;
}

/**
 * スキン名をサニタイズ（ホワイトリスト方式）
 */
export function validateSkinName(skin: string): string {
  const validSkins = [
    'kansai_banter',
    'z_gen_slang',
    'rap_style',
    'academic_paper',
    'old_man_syntax',
    'formal_business',
    'casual_friendly',
    'detached_literary',
    'poetic_emo',
    'cryptic_safe_adult',
    'gyaru_slang',
    'excessive_politeness',
    'cryptic_code',
    'philo_lecture',
    'aphorism',
    'speech_poem',
    'debate_politico',
  ];

  if (!validSkins.includes(skin.toLowerCase())) {
    throw new Error(`Invalid skin: ${skin}`);
  }

  return skin.toLowerCase();
}

/**
 * LLM用のセーフなプロンプトを構築
 */
export function buildSafePrompt(
  userInput: string,
  skin: string,
  systemInstruction: string
): string {
  // 入力をサニタイズ
  const sanitizedInput = sanitizeForLLM(userInput);
  const validatedSkin = validateSkinName(skin);

  // プロンプトテンプレート（ユーザー入力は明確に分離）
  const prompt = `${systemInstruction}

【入力テキスト】
${sanitizedInput}

【変換スタイル】
${validatedSkin}`;

  return prompt;
}

/**
 * LLMレスポンスをサニタイズ（出力検証）
 */
export function sanitizeLLMOutput(output: string): string {
  // 1. 長さチェック（出力が異常に長い場合）
  const maxOutputLength = 10000;
  if (output.length > maxOutputLength) {
    return output.substring(0, maxOutputLength) + '...';
  }

  // 2. 危険なコンテンツパターンを検出
  const dangerousOutputPatterns = [
    /api[_-]?key/gi,
    /secret[_-]?key/gi,
    /password/gi,
    /token/gi,
    /database[_-]?url/gi,
  ];

  let hasDangerousContent = false;
  for (const pattern of dangerousOutputPatterns) {
    if (pattern.test(output)) {
      hasDangerousContent = true;
      break;
    }
  }

  if (hasDangerousContent) {
    throw new Error('LLM output contains potentially sensitive information');
  }

  return output;
}
