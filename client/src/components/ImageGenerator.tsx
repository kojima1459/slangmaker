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
        className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 p-8 rounded-lg"
        style={{ width: '1200px', minHeight: '630px' }}
      >
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            AI言い換えメーカー
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {skinName}で変換
          </p>
        </div>

        {/* 2カラムレイアウト */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* 変換前 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b-2 border-purple-500 pb-2">
              変換前
            </h2>
            <p className={`text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed ${getFontSize(originalText)}`}>
              {truncateText(originalText, 800)}
            </p>
          </div>

          {/* 変換後 */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 border-b-2 border-pink-500 pb-2">
              変換後
            </h2>
            <p className={`text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed ${getFontSize(transformedText)}`}>
              {truncateText(transformedText, 800)}
            </p>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            iikae-maker.manus.space で今すぐ試す
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
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        {t('imageGenerator.note') || '※ 長文の場合、一部が省略されます。画像は1200x630pxで生成されます。'}
      </p>
    </div>
  );
}
