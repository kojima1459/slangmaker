/**
 * TransformService - 変換機能のビジネスロジックを管理
 * 責務分離により、テスト性・保守性・拡張性を向上
 */

import { TRPCError } from '@trpc/server';
import { sanitizeForLLM, validateSkinName } from '../_core/llm-safety';
import { invokeLLM } from '../_core/llm';
import { createTransformHistory } from '../db';
import { SKINS } from '../../shared/skins';

function getSkinById(skinId: string) {
  return SKINS[skinId] || null;
}

export interface TransformInput {
  extracted: string;
  skin: string;
  params?: {
    temperature?: number;
    topP?: number;
    lengthRatio?: number;
    maxOutputTokens?: number;
  };
}

export interface TransformResult {
  output: string;
  skin: string;
  params: {
    temperature: number;
    topP: number;
    lengthRatio: number;
    maxOutputTokens: number;
  };
}

export class TransformService {
  /**
   * 入力を検証
   */
  validateInput(input: TransformInput): void {
    if (!input.extracted || input.extracted.trim().length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Extracted text is required',
      });
    }

    if (!input.skin || input.skin.trim().length === 0) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Skin is required',
      });
    }
  }

  /**
   * 入力をサニタイズ
   */
  sanitizeInput(extracted: string): string {
    try {
      return sanitizeForLLM(extracted, 10000);
    } catch (error: any) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: error.message || 'Invalid input',
      });
    }
  }

  /**
   * スキンを検証
   */
  validateSkin(skinId: string): void {
    try {
      validateSkinName(skinId);
    } catch (error: any) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: error.message || 'Invalid skin',
      });
    }

    const skin = getSkinById(skinId);
    if (!skin) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Skin not found: ${skinId}`,
      });
    }
  }

  /**
   * LLMを呼び出して変換
   */
  async callLLM(
    sanitizedText: string,
    skinId: string,
    params: {
      temperature: number;
      topP: number;
      lengthRatio: number;
      maxOutputTokens: number;
    }
  ): Promise<string> {
    const skin = getSkinById(skinId);
    if (!skin) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: `Skin not found: ${skinId}`,
      });
    }

    // システムプロンプトを構築
    let systemInstruction = `あなたは文章の言い換え専門家です。以下のルールに従って、入力テキストを指定されたスタイルに変換してください。

【変換ルール】
${skin.rules}

【必須事項】
${skin.doList.join('\n')}

【禁止事項】
${skin.dontList.join('\n')}

【出力長の調整】
- lengthRatio=${params.lengthRatio}に基づいて出力の長さを調整してください
- lengthRatio=1.0: 元の文章と同じ長さ
- lengthRatio>1.0: 元の文章より長く（例: 1.5倍）
- lengthRatio<1.0: 元の文章より短く（例: 0.5倍）

【Few-Shot Examples】
${skin.fewShots.map((fs: any, i: number) => `例${i + 1}:\n入力: ${fs.input}\n出力: ${fs.output}`).join('\n\n')}`;

    try {
      const response = await invokeLLM({
        messages: [
          {
            role: 'system',
            content: systemInstruction,
          },
          {
            role: 'user',
            content: sanitizedText,
          },
        ],
        max_tokens: params.maxOutputTokens,
      });

      let output: string | undefined;
      if (response.choices && response.choices[0]?.message?.content) {
        const content = response.choices[0].message.content;
        output = typeof content === 'string' ? content : undefined;
      }
      
      output = output?.trim();
      if (!output) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'LLM returned empty response',
        });
      }

      return output + '\n\n[AI言い換えメーカー]';
    } catch (error: any) {
      console.error('LLM invocation error:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to transform text',
      });
    }
  }

  /**
   * 変換結果をデータベースに保存
   */
  async saveTransform(
    userId: number,
    extracted: string,
    output: string,
    skin: string,
    params: any
  ): Promise<void> {
    try {
      await createTransformHistory({
        userId,
        url: '', // URLは任意項目なので空文字列
        skin,
        params: JSON.stringify(params),
        snippet: output.substring(0, 200), // 最初の200文字をスニペットとして保存
        output, // 全文を保存
      });
    } catch (error: any) {
      console.error('Failed to save transform history:', error);
      // 保存失敗はエラーをスローせず、ログのみ記録
    }
  }

  /**
   * 変換処理のログを記録
   */
  logTransform(userId: number, skin: string, success: boolean, error?: string): void {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    const message = `[${timestamp}] Transform ${status}: userId=${userId}, skin=${skin}`;
    
    if (error) {
      console.error(message, error);
    } else {
      console.log(message);
    }
  }

  /**
   * 変換処理を実行（オーケストレーション）
   */
  async execute(userId: number, input: TransformInput): Promise<TransformResult> {
    try {
      // 1. 入力検証
      this.validateInput(input);

      // 2. 入力サニタイズ
      const sanitizedText = this.sanitizeInput(input.extracted);

      // 3. スキン検証
      this.validateSkin(input.skin);

      // 4. パラメータのデフォルト値設定
      const params = {
        temperature: input.params?.temperature ?? 1.0,
        topP: input.params?.topP ?? 0.95,
        lengthRatio: input.params?.lengthRatio ?? 1.0,
        maxOutputTokens: input.params?.maxOutputTokens ?? 4000,
      };

      // 5. LLM呼び出し
      const output = await this.callLLM(sanitizedText, input.skin, params);

      // 6. データベースに保存
      await this.saveTransform(userId, input.extracted, output, input.skin, params);

      // 7. ログ記録
      this.logTransform(userId, input.skin, true);

      // 8. 結果を返す
      return {
        output,
        skin: input.skin,
        params,
      };
    } catch (error: any) {
      // エラーログ記録
      this.logTransform(userId, input.skin, false, error.message);
      throw error;
    }
  }
}
