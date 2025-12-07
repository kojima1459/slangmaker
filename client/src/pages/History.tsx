import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Clock, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useState } from "react";

export default function History() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const { data: history, isLoading } = trpc.history.list.useQuery(
    { limit: 50 },
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>
              履歴を表示するにはログインしてください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
              ログイン
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
            戻る
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">変換履歴</h1>
            <p className="text-sm text-gray-600">過去の変換結果を確認できます</p>
          </div>
        </div>

        {/* History List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : history && history.length > 0 ? (
          <div className="space-y-4">
            {history.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleString("ja-JP")}
                        <span className="mx-2">•</span>
                        {item.site}
                        <span className="mx-2">•</span>
                        スキン: {item.skin}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 mb-4">{item.snippet}...</p>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowOutput(true);
                      }}
                    >
                      👀 変換結果を見る
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowOriginal(true);
                      }}
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      元記事
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">まだ変換履歴がありません</p>
              <Button
                variant="link"
                onClick={() => setLocation("/")}
                className="mt-4"
              >
                記事を変換する
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 変換結果表示モーダル */}
      <Dialog open={showOutput} onOpenChange={setShowOutput}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>変換結果</DialogTitle>
            <DialogDescription>
              {selectedItem?.title} - {selectedItem?.site} - スキン: {selectedItem?.skin}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedItem?.output || "変換結果が見つかりません"}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 元記事表示モーダル */}
      <Dialog open={showOriginal} onOpenChange={setShowOriginal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>元記事</DialogTitle>
            <DialogDescription>
              {selectedItem?.title} - {selectedItem?.site}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{selectedItem?.extracted || "元記事が見つかりません"}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
