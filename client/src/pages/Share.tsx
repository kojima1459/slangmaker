import { useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";

export default function Share() {
  const [, params] = useRoute("/share/:id");
  const [, setLocation] = useLocation();
  const shareId = params?.id || "";

  const { data, isLoading, error } = trpc.share.get.useQuery(
    { id: shareId },
    { enabled: !!shareId }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-600">エラー</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              共有リンクが見つからないか、有効期限が切れています。
            </p>
            <Button onClick={() => setLocation("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-4xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            ホームに戻る
          </Button>
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              スキン: {data.skin}
            </p>
          </div>
        </div>

        {/* Shared Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>共有された変換結果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              <Streamdown>{data.content}</Streamdown>
            </div>
            
            {data.sourceUrl && data.sourceUrl !== "https://example.com" && (
              <>
                <Separator className="my-6" />
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ExternalLink className="h-4 w-4" />
                  <a
                    href={data.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    元記事を開く
                  </a>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-4">
            この共有リンクは24時間有効です
          </p>
          <Button onClick={() => setLocation("/")}>
            NewsSkins で記事を変換する
          </Button>
        </div>
      </div>
    </div>
  );
}
