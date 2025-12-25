import { useEffect, useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy, ExternalLink, FileText, Share2, Twitter, Facebook, Linkedin, Instagram, Columns, Image as ImageIcon, SkipForward, Send } from "lucide-react";
import { toast } from "sonner";
import { ShareToGalleryModal } from "@/components/ShareToGalleryModal";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DOMPurify from "isomorphic-dompurify";
import { ImageGenerator } from "@/components/ImageGenerator";
import { getThemeForSkin } from "@/lib/skinThemes";
import { AdBanner } from "@/components/AdBanner";
import { SEO } from "@/components/SEO";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ReaderData {
  article: {
    title: string;
    site: string;
    url: string;
    contentText: string;
  };
  result: {
    output: string;
    meta: {
      skin: string;
    };
  };
  skin: string;
}

// Typewriter effect hook
function useTypewriter(text: string, speed: number = 20) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) return;
    
    setDisplayText('');
    setIsComplete(false);
    
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);
    
    return () => clearInterval(timer);
  }, [text, speed]);

  const skipToEnd = () => {
    setDisplayText(text);
    setIsComplete(true);
  };

  return { displayText, isComplete, skipToEnd };
}

export default function Reader() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<ReaderData | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Hooks must be called at the top level, before any early returns
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const stored = sessionStorage.getItem('readerData');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      // No data, redirect to home
      setLocation("/");
    }
  }, [setLocation]);

  // Get theme based on skin
  const currentTheme = useMemo(() => {
    if (!data?.skin) return getThemeForSkin('');
    return getThemeForSkin(data.skin);
  }, [data?.skin]);

  // Typewriter effect for the output
  const { displayText, isComplete, skipToEnd } = useTypewriter(
    data?.result?.output || '',
    15 // Speed: 15ms per character (faster for long texts)
  );

  if (!data) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data.result.output);
    toast.success("コピーしました");
  };

  // handleShare function removed - short URL feature has been removed

  const handleTwitterShare = () => {
    const siteUrl = 'https://slang-maker.manus.space';
    const text = `AIスラングメーカーで変換しました！\n\n${data.result.output.substring(0, 100)}...\n\n${siteUrl}\n\n#BuiltwithManus`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(tweetUrl, '_blank', 'width=550,height=420');
  };

  const handleLineShare = () => {
    const siteUrl = 'https://slang-maker.manus.space';
    const text = `AIスラングメーカーで変換しました！\n\n${data.result.output.substring(0, 180)}...\n\n${siteUrl}\n\n#BuiltwithManus`;
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    const siteUrl = 'https://slang-maker.manus.space';
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}&quote=${encodeURIComponent(`AIスラングメーカーで変換しました！\n\n${data.result.output.substring(0, 180)}...\n\n#BuiltwithManus`)}`;
    window.open(shareUrl, '_blank', 'width=550,height=420');
  };

  const handleLinkedInShare = () => {
    const siteUrl = 'https://slang-maker.manus.space';
    const text = `AIスラングメーカーで変換しました！\n\n${data.result.output.substring(0, 180)}...\n\n#BuiltwithManus`;
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}&summary=${encodeURIComponent(text)}`;
    window.open(shareUrl, '_blank', 'width=550,height=420');
  };

  const handleInstagramShare = () => {
    // Instagram does not support direct web sharing with text
    // Show a toast message to guide users to use the image generation feature
    toast.info('Instagramへのシェアは「画像化」ボタンから画像を生成し、#BuiltwithManusタグを追加してご利用ください');
  };

  const handleBack = () => {
    sessionStorage.removeItem('readerData');
    setLocation("/");
  };

  return (
    <>
      <SEO 
        title={`変換結果: ${data.skin} - AIスラングメーカー`}
        description={data.result.output.substring(0, 100) + '...'}
        path="/reader"
        type="article"
      />
      <div className={`min-h-screen bg-gradient-to-br ${currentTheme.bgGradient} transition-all duration-500`}>
      <div className="container max-w-6xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{data.article.title}</h1>
            <p className="text-sm text-gray-600">
              {data.article.site} • スキン: {data.skin}
            </p>
          </div>
        </div>

        {/* Content Grid */}
        <div className={`grid gap-6 ${compareMode ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Original Article (Compare Mode) */}
          {compareMode && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  原文
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {data.article.contentText}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transformed Output */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="mb-4">AISlang Maker • スキン: {data.skin}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={compareMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCompareMode(!compareMode)}
                  className={compareMode ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600" : ""}
                >
                  <Columns className="mr-2 h-4 w-4" />
                  {compareMode ? "比較表示中" : "原文と比較"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  コピー
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTwitterShare}
                  className="bg-sky-50 hover:bg-sky-100 border-sky-200"
                >
                  <Twitter className="mr-2 h-4 w-4 text-sky-500" />
                  X
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLineShare}
                  className="bg-green-50 hover:bg-green-100 border-green-200"
                >
                  <svg className="mr-2 h-4 w-4 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.771.039 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                  </svg>
                  LINE
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFacebookShare}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                >
                  <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLinkedInShare}
                  className="bg-blue-50 hover:bg-blue-100 border-blue-300"
                >
                  <Linkedin className="mr-2 h-4 w-4 text-blue-700" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleInstagramShare}
                  className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border-pink-200"
                >
                  <Instagram className="mr-2 h-4 w-4 text-pink-600" />
                  Instagram
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowShareModal(true)}
                  className="bg-gradient-to-r from-green-50 to-teal-50 hover:from-green-100 hover:to-teal-100 border-green-300"
                >
                  <Send className="mr-2 h-4 w-4 text-green-600" />
                  ギャラリー投稿
                </Button>
                <Dialog open={showImageGenerator} onOpenChange={setShowImageGenerator}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-gradient-to-r from-orange-50 to-pink-50 hover:from-orange-100 hover:to-pink-100 border-orange-200"
                    >
                      <ImageIcon className="mr-2 h-4 w-4 text-orange-600" />
                      画像化
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>画像として保存</DialogTitle>
                      <DialogDescription>
                        変換前後のテキストを画像として保存できます。SNSでシェアしてみましょう！
                      </DialogDescription>
                    </DialogHeader>
                    <ImageGenerator
                      originalText={data.article.contentText}
                      transformedText={data.result.output}
                      skinName={data.skin}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {displayText}
                  {!isComplete && <span className="animate-pulse">|</span>}
                </p>
              </div>
              {/* Skip button */}
              {!isComplete && (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={skipToEnd}
                    className="gap-2"
                  >
                    <SkipForward className="h-4 w-4" />
                    スキップ
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ad Banner */}
      <div className="container max-w-6xl pb-8">
        <div className="flex justify-center">
          <AdBanner />
        </div>
      </div>

      {/* Share to Gallery Modal */}
      <ShareToGalleryModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        originalText={data.article.contentText}
        transformedText={data.result.output}
        skinKey={data.result.meta.skin}
        skinName={data.skin}
      />
    </div>
    </>
  );
}

