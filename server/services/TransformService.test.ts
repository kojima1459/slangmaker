import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransformService } from './TransformService';
import { TRPCError } from '@trpc/server';

// Mock dependencies
vi.mock('../_core/llm-safety', () => ({
  sanitizeForLLM: vi.fn((input: string) => input.trim()),
  validateSkinName: vi.fn((skin: string) => {
    if (skin === 'invalid_skin') throw new Error('Invalid skin');
    return skin;
  }),
}));

vi.mock('../_core/llm', () => ({
  invokeLLM: vi.fn(async () => ({
    choices: [
      {
        message: {
          content: 'Transformed text output',
        },
      },
    ],
  })),
}));

vi.mock('../db', () => ({
  createTransformHistory: vi.fn(async () => {}),
}));

describe('TransformService', () => {
  let service: TransformService;

  beforeEach(() => {
    service = new TransformService();
    vi.clearAllMocks();
  });

  describe('validateInput', () => {
    it('should accept valid input', () => {
      const input = {
        extracted: 'Test text',
        skin: 'kansai_banter',
      };

      expect(() => service.validateInput(input)).not.toThrow();
    });

    it('should reject empty extracted text', () => {
      const input = {
        extracted: '',
        skin: 'kansai_banter',
      };

      expect(() => service.validateInput(input)).toThrow(TRPCError);
    });

    it('should reject empty skin', () => {
      const input = {
        extracted: 'Test text',
        skin: '',
      };

      expect(() => service.validateInput(input)).toThrow(TRPCError);
    });
  });

  describe('sanitizeInput', () => {
    it('should sanitize input text', () => {
      const text = '  Test text  ';
      const result = service.sanitizeInput(text);
      expect(result).toBe('Test text');
    });
  });

  describe('validateSkin', () => {
    it('should accept valid skin', () => {
      expect(() => service.validateSkin('kansai_banter')).not.toThrow();
    });

    it('should reject invalid skin', () => {
      expect(() => service.validateSkin('invalid_skin')).toThrow(TRPCError);
    });
  });

  describe('logTransform', () => {
    it('should log successful transform', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      service.logTransform(1, 'kansai_banter', true);
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should log failed transform', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      service.logTransform(1, 'kansai_banter', false, 'Error message');
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('execute', () => {
    it('should execute transform successfully', async () => {
      const input = {
        extracted: 'Test text for transformation',
        skin: 'kansai_banter',
        params: {
          temperature: 1.0,
          topP: 0.95,
          lengthRatio: 1.0,
          maxOutputTokens: 4000,
        },
      };

      const result = await service.execute(1, input);

      expect(result).toHaveProperty('output');
      expect(result).toHaveProperty('skin');
      expect(result).toHaveProperty('params');
      expect(result.output).toContain('Transformed text output');
    });

    it('should use default params if not provided', async () => {
      const input = {
        extracted: 'Test text',
        skin: 'kansai_banter',
      };

      const result = await service.execute(1, input);

      expect(result.params).toEqual({
        temperature: 1.0,
        topP: 0.95,
        lengthRatio: 1.0,
        maxOutputTokens: 4000,
      });
    });

    it('should throw error for invalid input', async () => {
      const input = {
        extracted: '',
        skin: 'kansai_banter',
      };

      await expect(service.execute(1, input)).rejects.toThrow(TRPCError);
    });
  });
});
