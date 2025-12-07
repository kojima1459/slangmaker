import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy, ExternalLink, FileText, Share2, Twitter, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

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
  historyId?: number;
}

export default function Reader() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<ReaderData | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  
  // Hooks must be called at the top level, before any early returns
  const { isAuthenticated } = useAuth();
  const createShareMutation = trpc.share.create.useMutation();
  const submitFeedbackMutation = trpc.feedback.submit.useMutation();
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<'positive' | 'negative' | null>(null);

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

  const getSiteUrl = () => {
    return import.meta.env.VITE_SITE_URL || window.location.origin;
  };

  const handleTwitterShare = () => {
    const siteUrl = getSiteUrl();
    const text = `言い換えメーカーで変換しました！\n\n${data.result.output.substring(0, 100)}...\n\n${siteUrl}`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleLineShare = () => {
    const siteUrl = getSiteUrl();
    const text = `言い換えメーカーで変換しました！\n\n${data.result.output.substring(0, 200)}...\n\n${siteUrl}`;
    const url = `https://line.me/R/msg/text/?${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleFacebookShare = () => {
    const siteUrl = getSiteUrl();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleLinkedInShare = () => {
    const siteUrl = getSiteUrl();
    const text = `言い換えメーカーで変換しました！\n\n${data.result.output.substring(0, 100)}...`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleBack = () => {
    sessionStorage.removeItem('readerData');
    setLocation("/");
  };

  const handleFeedback = async (isPositive: boolean) => {
    if (!isAuthenticated) {
      toast.error("フィードバックを送信するにはログインが必要です");
      return;
    }

    if (!data.historyId) {
      toast.error("履歴IDが見つかりませんでした");
      return;
    }

    try {
      await submitFeedbackMutation.mutateAsync({
        historyId: data.historyId,
        rating: isPositive ? "good" : "bad",
        comment: undefined,
      });
      setFeedbackSubmitted(isPositive ? 'positive' : 'negative');
      toast.success("フィードバックを送信しました！ありがとうございます。");
    } catch (error) {
      console.error("Feedback error:", error);
      toast.error("フィードバックの送信に失敗しました");
    }
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleFacebookShare}
                    className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                  >
                    <svg className="mr-2 h-4 w-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLinkedInShare}
                    className="bg-blue-50 hover:bg-blue-100 border-blue-300"
                  >
                    <svg className="mr-2 h-4 w-4 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <Streamdown>{data.result.output}</Streamdown>
              </div>
              
              <Separator className="my-6" />
              
              {/* Feedback Section */}
              <div className="flex items-center justify-center gap-4 mt-6">
                <p className="text-sm text-gray-600">この変換結果はいかがでしたか？</p>
                <div className="flex gap-2">
                  <Button
                    variant={feedbackSubmitted === 'positive' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFeedback(true)}
                    disabled={feedbackSubmitted !== null || submitFeedbackMutation.isPending}
                    className={feedbackSubmitted === 'positive' ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    良い
                  </Button>
                  <Button
                    variant={feedbackSubmitted === 'negative' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFeedback(false)}
                    disabled={feedbackSubmitted !== null || submitFeedbackMutation.isPending}
                    className={feedbackSubmitted === 'negative' ? 'bg-red-500 hover:bg-red-600' : ''}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    悪い
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
