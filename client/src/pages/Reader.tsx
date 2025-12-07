import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Copy, ExternalLink, FileText, Share2 } from "lucide-react";
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-lg max-w-none">
                <Streamdown>{data.result.output}</Streamdown>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
