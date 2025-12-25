import React, { useRef, useState } from 'react';
import * as htmlToImage from 'html-to-image';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ImageGeneratorProps {
  originalText: string;
  transformedText: string;
  skinName: string;
}

type SnsSize = {
  name: string;
  width: number;
  height: number;
  description: string;
};

const SNS_SIZES: Record<string, SnsSize> = {
  x: { name: 'X (Twitter)', width: 1200, height: 675, description: '横長・タイムライン最適' },
  instagram: { name: 'Instagram', width: 1080, height: 1080, description: '正方形・フィード最適' },
  facebook: { name: 'Facebook', width: 1200, height: 630, description: '横長・シェア最適' },
  line: { name: 'LINE', width: 1200, height: 630, description: '横長・トーク最適' },
  linkedin: { name: 'LinkedIn', width: 1200, height: 627, description: '横長・ビジネス最適' },
  custom: { name: 'カスタム', width: 1600, height: 1200, description: '高解像度・汎用' },
};

// Design templates
type DesignTemplate = {
  name: string;
  description: string;
  bgStyle: string;
  headerBg: string;
  headerText: string;
  beforeBg: string;
  beforeBorder: string;
  beforeTitle: string;
  afterBg: string;
  afterBorder: string;
  afterTitle: string;
  footerText: string;
  watermarkStyle: string;
};

const TEMPLATES: Record<string, DesignTemplate> = {
  simple: {
    name: 'シンプル',
    description: '白背景でクリーン',
    bgStyle: 'bg-white',
    headerBg: '',
    headerText: 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
    beforeBg: 'bg-gray-50',
    beforeBorder: 'border-gray-200',
    beforeTitle: 'text-gray-700',
    afterBg: 'bg-gray-50',
    afterBorder: 'border-gray-200',
    afterTitle: 'text-gray-700',
    footerText: 'text-gray-600',
    watermarkStyle: 'text-gray-400',
  },
  dark: {
    name: 'ダーク',
    description: '黒背景でシック',
    bgStyle: 'bg-gray-900',
    headerBg: '',
    headerText: 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent',
    beforeBg: 'bg-gray-800',
    beforeBorder: 'border-purple-500',
    beforeTitle: 'text-purple-300',
    afterBg: 'bg-gray-800',
    afterBorder: 'border-pink-500',
    afterTitle: 'text-pink-300',
    footerText: 'text-gray-400',
    watermarkStyle: 'text-gray-600',
  },
  gradient: {
    name: 'グラデーション',
    description: '華やかで目を引く',
    bgStyle: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    headerBg: '',
    headerText: 'text-white drop-shadow-lg',
    beforeBg: 'bg-white/90 backdrop-blur-sm',
    beforeBorder: 'border-white/50',
    beforeTitle: 'text-purple-700',
    afterBg: 'bg-white/90 backdrop-blur-sm',
    afterBorder: 'border-white/50',
    afterTitle: 'text-pink-700',
    footerText: 'text-white',
    watermarkStyle: 'text-white/70',
  },
  pop: {
    name: 'ポップ',
    description: '明るくカラフル',
    bgStyle: 'bg-gradient-to-br from-yellow-200 via-pink-200 to-cyan-200',
    headerBg: '',
    headerText: 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
    beforeBg: 'bg-purple-100',
    beforeBorder: 'border-purple-400',
    beforeTitle: 'text-purple-800',
    afterBg: 'bg-pink-100',
    afterBorder: 'border-pink-400',
    afterTitle: 'text-pink-800',
    footerText: 'text-gray-700',
    watermarkStyle: 'text-gray-600',
  },
};

export function ImageGenerator({ originalText, transformedText, skinName }: ImageGeneratorProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>('x');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('gradient');
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const { t } = useTranslation();

  const currentSize = SNS_SIZES[selectedSize];
  const currentTemplate = TEMPLATES[selectedTemplate];

  const generateImage = async (format: 'png' | 'jpeg') => {
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
          skipFonts: true, // CORSエラー回避（外部フォントをスキップ）
        });
      } else {
        dataUrl = await htmlToImage.toJpeg(contentRef.current, {
          quality: 0.95,
          pixelRatio: 2,
          cacheBust: true,
          skipFonts: true, // CORSエラー回避（外部フォントをスキップ）
        });
      }
      console.log('Image generated successfully, dataUrl length:', dataUrl.length);

      // 生成した画像を表示用に保存
      setGeneratedImageUrl(dataUrl);
      console.log('Image generated and displayed successfully');

      toast.success('画像を生成しました', {
        description: 'スマホの方は画像を長押しして保存してください',
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
      {/* サイズ選択 */}
      <div className="space-y-2">
        <Label htmlFor="sns-size" className="text-base font-semibold">
          SNS別サイズ
        </Label>
        <Select value={selectedSize} onValueChange={setSelectedSize}>
          <SelectTrigger id="sns-size" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SNS_SIZES).map(([key, size]) => (
              <SelectItem key={key} value={key}>
                {size.name} ({size.width}x{size.height}px)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* テンプレート選択 */}
      <div className="space-y-2">
        <Label className="text-base font-semibold">デザインテンプレート</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedTemplate(key)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                selectedTemplate === key
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <div className="font-semibold text-sm">{template.name}</div>
              <div className="text-xs text-gray-500">{template.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* プレビュー */}
      <div
        ref={contentRef}
        className={`${currentTemplate.bgStyle} p-8 rounded-lg overflow-hidden`}
        style={{ 
          width: `${currentSize.width}px`, 
          height: `${currentSize.height}px`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        {/* ヘッダー */}
        <div className="text-center mb-6">
          <h1 className={`font-bold ${currentTemplate.headerText} mb-2 ${
            currentSize.height < 800 ? 'text-3xl' : 'text-5xl'
          }`}>
            AIスラングメーカー
          </h1>
          <p className={`font-semibold ${currentTemplate.footerText} ${
            currentSize.height < 800 ? 'text-lg' : 'text-2xl'
          }`}>
            {skinName}で変換
          </p>
        </div>

        {/* レイアウト：サイズに応じて調整 */}
        <div className={`flex-1 ${
          currentSize.width / currentSize.height > 1.3 
            ? 'grid grid-cols-2 gap-4' 
            : 'space-y-4'
        } mb-4`}>
          {/* 変換前 */}
          <div className={`${currentTemplate.beforeBg} p-4 rounded-lg shadow-lg border-2 ${currentTemplate.beforeBorder} overflow-hidden`}>
            <h2 className={`font-bold ${currentTemplate.beforeTitle} mb-3 border-b-2 ${currentTemplate.beforeBorder} pb-2 ${
              currentSize.height < 800 ? 'text-xl' : 'text-3xl'
            }`}>
              変換前
            </h2>
            <p className={`text-gray-900 whitespace-pre-wrap leading-relaxed font-medium overflow-y-auto ${
              currentSize.height < 800 ? 'text-sm' : 'text-lg'
            }`} style={{ maxHeight: `${currentSize.height * 0.35}px` }}>
              {truncateText(originalText, currentSize.height < 800 ? 400 : 800)}
            </p>
          </div>

          {/* 変換後 */}
          <div className={`${currentTemplate.afterBg} p-4 rounded-lg shadow-lg border-2 ${currentTemplate.afterBorder} overflow-hidden`}>
            <h2 className={`font-bold ${currentTemplate.afterTitle} mb-3 border-b-2 ${currentTemplate.afterBorder} pb-2 ${
              currentSize.height < 800 ? 'text-xl' : 'text-3xl'
            }`}>
              変換後
            </h2>
            <p className={`text-gray-900 whitespace-pre-wrap leading-relaxed font-medium overflow-y-auto ${
              currentSize.height < 800 ? 'text-sm' : 'text-lg'
            }`} style={{ maxHeight: `${currentSize.height * 0.35}px` }}>
              {truncateText(transformedText, currentSize.height < 800 ? 400 : 800)}
            </p>
          </div>
        </div>

        {/* フッター：透かしロゴを右下に配置 */}
        <div className="relative">
          <div className="text-center space-y-2">
            <p className={`font-semibold ${currentTemplate.footerText} ${
              currentSize.height < 800 ? 'text-base' : 'text-xl'
            }`}>
              slangmaker-11c54.web.app で今すぐ試す
            </p>
            <p className={`${currentTemplate.watermarkStyle} ${
              currentSize.height < 800 ? 'text-xs' : 'text-base'
            }`}>
              Made with ❤️ by MasahideKojima
            </p>
          </div>
          {/* 透かしロゴ：右下に固定 */}
          <div className="absolute bottom-0 right-0 flex items-center gap-2 opacity-60">
            <span className={`font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent ${
              currentSize.height < 800 ? 'text-xs' : 'text-sm'
            }`}>
              AIスラングメーカー
            </span>
            <span className={`text-gray-500 dark:text-gray-400 ${
              currentSize.height < 800 ? 'text-xs' : 'text-sm'
            }`}>
              slang-maker.manus.space
            </span>
          </div>
        </div>
      </div>

      {/* 生成された画像の表示 */}
      {generatedImageUrl && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-6 rounded-lg border-2 border-purple-300 dark:border-purple-600">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl">📱</span>
              <p className="text-lg font-semibold text-purple-800 dark:text-purple-100 animate-pulse">
                画像を長押しして保存できます
              </p>
            </div>
            <p className="text-sm text-center text-gray-600 dark:text-gray-300 mb-4">
              スマホの方：画像を長押し→「画像を保存」でカメラロールに保存<br />
              PCの方：画像を右クリック→「名前を付けて画像を保存」
            </p>
            <img
              src={generatedImageUrl}
              alt="生成された画像"
              className="w-full rounded-lg shadow-lg border-2 border-white dark:border-gray-700"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>
      )}

      {/* 画像生成ボタン */}
      {!generatedImageUrl && (
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => generateImage('png')}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            画像を生成
          </Button>
        </div>
      )}

      {/* 再生成ボタン */}
      {generatedImageUrl && (
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => {
              setGeneratedImageUrl(null);
              toast.info('サイズを変更して再生成できます');
            }}
            variant="outline"
          >
            別のサイズで再生成
          </Button>
        </div>
      )}

      {/* 注意事項 */}
      <p className="text-sm text-center text-gray-500 dark:text-gray-400">
        ※ 長文の場合、一部が省略されます。画像は{currentSize.width}x{currentSize.height}pxで生成されます。
      </p>
    </div>
  );
}
