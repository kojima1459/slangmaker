import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy, ExternalLink, FileText, Share2, Twitter } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DOMPurify from "isomorphic-dompurify";

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

export default function Reader() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<ReaderData | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  
  // Hooks must be called at the top level, before any early returns
  const { isAuthenticated } = useAuth();
  const createShareMutation = trpc.share.create.useMutation();

  useEffect(() => {
    const stored = sessionStorage.getItem('readerData');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      // No data, redirect to home
      setLocation("/");
    }
  }, [setLocation]);

  if (!data) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(data.result.output);
    toast.success("コピーしました");
  };

  const handleShare = async () => {
    if (!isAuthenticated) {
      toast.error("シェア機能を使用するにはログインが必要です");
      return;
    }

    try {
      const result = await createShareMutation.mutateAsync({
        content: data.result.output,
        sourceUrl: data.article.url,
        skin: data.skin,
      });

      const shareUrl = `${window.location.origin}${result.url}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success("共有URLをコピーしました（24時間有効）");
    } catch (error) {
      console.error("Share error:", error);
      toast.error("共有URLの生成に失敗しました");
    }
  };

  const handleTwitterShare = () => {
    const siteUrl = window.location.origin;
    const skinName = data.skin;
    const text = `【${skinName}】で変換しました！\n\n${data.result.output.substring(0, 120)}...\n\n#言い換えメーカー #文体変換 #${skinName.replace(/[\s・]/g, '')}`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(siteUrl)}`;
    window.open(tweetUrl, '_blank', 'width=550,height=420');
  };

  const handleLineShare = () => {
    const text = `言い換えメーカーで変換しました！\n\n${data.result.output.substring(0, 200)}...`;
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleBack = () => {
    sessionStorage.removeItem('readerData');
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Original Article (Optional) */}
          {showOriginal && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  原文
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">
                    {data.article.contentText}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transformed Output */}
          <Card className={`shadow-lg ${!showOriginal ? 'lg:col-span-2' : ''}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>変換結果</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOriginal(!showOriginal)}
                  >
                    {showOriginal ? "原文を隠す" : "原文を表示"}
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
                    onClick={handleShare}
                    disabled={createShareMutation.isPending}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    共有
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <Streamdown>{DOMPurify.sanitize(data.result.output)}</Streamdown>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
