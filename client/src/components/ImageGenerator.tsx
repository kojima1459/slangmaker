import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface ImageGeneratorProps {
  originalText: string;
  transformedText: string;
  skinName: string;
}

export function ImageGenerator({ originalText, transformedText, skinName }: ImageGeneratorProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { t } = useTranslation();

  const downloadImage = async (format: 'png' | 'jpeg') => {
    if (!contentRef.current) {
      console.error('contentRef.current is null');
      toast.error('画像生成に失敗しました', {
        description: 'ページを再読み込みしてください',
      });
      return;
    }

    console.log('Starting image generation...', { format, element: contentRef.current });
    setIsGenerating(true);
    try {
      // メモリ使用量チェック（長文の場合）
      const textLength = originalText.length + transformedText.length;
      if (textLength > 5000) {
        toast.info('長文を処理中です。少々お待ちください...');
      }

      let dataUrl: string;
      
      console.log('Generating image with html-to-image...');
      if (format === 'png') {
        dataUrl = await htmlToImage.toPng(contentRef.current, {
          quality: 1.0,
          pixelRatio: 2, // 高解像度
          cacheBust: true, // キャッシュバスティング
        });
      } else {
        dataUrl = await htmlToImage.toJpeg(contentRef.current, {
          quality: 0.95,
          pixelRatio: 2,
          cacheBust: true,
        });
      }
      console.log('Image generated successfully, dataUrl length:', dataUrl.length);

      // ダウンロード
      console.log('Creating download link...');
      const link = document.createElement('a');
      link.download = `iikae-maker-${Date.now()}.${format}`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Download triggered successfully');

      toast.success(t('imageGenerator.downloadSuccess') || '画像をダウンロードしました', {
        description: t('imageGenerator.downloadSuccessDesc') || 'SNSで共有してみましょう！',
      });
    } catch (error) {
      console.error('画像生成エラー:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // エラーの種類に応じたメッセージ
      let errorMessage = t('imageGenerator.downloadError') || '画像生成に失敗しました';
      let errorDescription = t('imageGenerator.downloadErrorDesc') || 'もう一度お試しください';
      
      if (error instanceof Error) {
        if (error.message.includes('memory') || error.message.includes('quota')) {
          errorDescription = 'テキストが長すぎます。短いテキストでお試しください。';
        } else if (error.message.includes('timeout')) {
          errorDescription = 'タイムアウトしました。もう一度お試しください。';
        }
      }
      
      toast.error(errorMessage, {
        description: errorDescription,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // テキストを適切な長さで分割（長文対応）
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // 文字数に応じてフォントサイズを調整
  const getFontSize = (text: string) => {
    if (text.length > 1500) return 'text-xs';
    if (text.length > 1000) return 'text-sm';
    return 'text-base';
  };

  return (
    <div className="space-y-4">
      {/* プレビュー */}
      <div
        ref={contentRef}
        className="bg-white dark:bg-gray-900 p-12 rounded-lg"
        style={{ width: '1600px', minHeight: '1200px' }}
      >
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            AI言い換えメーカー
          </h1>
          <p className="text-3xl font-semibold text-gray-700 dark:text-gray-200">
            {skinName}で変換
          </p>
        </div>

        {/* 1カラムレイアウト */}
        <div className="space-y-8 mb-12">
          {/* 変換前 */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-8 rounded-xl shadow-xl border-4 border-purple-300 dark:border-purple-600">
            <h2 className="text-4xl font-bold text-purple-800 dark:text-purple-100 mb-6 border-b-4 border-purple-500 pb-4">
              変換前
            </h2>
            <p className="text-2xl text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed font-medium">
              {truncateText(originalText, 1200)}
            </p>
          </div>

          {/* 変換後 */}
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900 dark:to-pink-800 p-8 rounded-xl shadow-xl border-4 border-pink-300 dark:border-pink-600">
            <h2 className="text-4xl font-bold text-pink-800 dark:text-pink-100 mb-6 border-b-4 border-pink-500 pb-4">
              変換後
            </h2>
            <p className="text-2xl text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed font-medium">
              {truncateText(transformedText, 1200)}
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
            slang-maker.manus.space で今すぐ試す
          </p>
        </div>
      </div>

      {/* ダウンロードボタン */}
      <div className="flex gap-3 justify-center">
        <Button
          onClick={() => downloadImage('png')}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {t('imageGenerator.downloadPNG') || 'PNG形式でダウンロード'}
        </Button>
        <Button
          onClick={() => downloadImage('jpeg')}
          disabled={isGenerating}
          variant="outline"
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          {t('imageGenerator.downloadJPEG') || 'JPEG形式でダウンロード'}
        </Button>
      </div>

      {/* 注意事項 */}
      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
        {t('imageGenerator.note') || '※ 長文の場合、一部が省略されます。画像は1600x1200pxで生成されます。'}
      </p>
    </div>
  );
}
