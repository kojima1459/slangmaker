import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ThumbsUp, ThumbsDown, TrendingUp, TrendingDown, BarChart3, Sparkles, Copy, X } from "lucide-react";
import { SKINS } from "@/../../shared/skins";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

export default function FeedbackDashboard() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [selectedSkin, setSelectedSkin] = useState<string | undefined>(undefined);
  const [improvementModalOpen, setImprovementModalOpen] = useState(false);
  const [improvementData, setImprovementData] = useState<any>(null);
  
  const improveSkinMutation = trpc.feedback.improveSkin.useMutation();

  const handleImprove = async (skinKey: string) => {
    try {
      const result = await improveSkinMutation.mutateAsync({ skinKey });
      setImprovementData(result);
      setImprovementModalOpen(true);
    } catch (error: any) {
      toast.error(error.message || "改善提案の生成に失敗しました");
    }
  };

  const handleCopyImprovement = () => {
    if (!improvementData) return;
    const text = JSON.stringify(improvementData.improved, null, 2);
    navigator.clipboard.writeText(text);
    toast.success("改善内容をコピーしました");
  };
  
  const { data: stats, isLoading } = trpc.feedback.stats.useQuery({
    skinKey: selectedSkin,
  }, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              フィードバック分析ダッシュボードを表示するにはログインしてください。
            </p>
            <Button onClick={() => setLocation("/")}>
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>アクセス権限がありません</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              このページは管理者のみアクセスできます。
            </p>
            <Button onClick={() => setLocation("/")}>
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-7xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">フィードバック分析</h1>
            <p className="text-gray-600">スキンの評価と改善提案</p>
          </div>
          <Button variant="outline" onClick={() => setLocation("/")}>
            ホームに戻る
          </Button>
        </div>

        {/* Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              フィルター
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <label className="text-sm font-medium">スキン:</label>
              <Select value={selectedSkin || "all"} onValueChange={(v) => setSelectedSkin(v === "all" ? undefined : v)}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="すべてのスキン" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべてのスキン</SelectItem>
                  {Object.entries(SKINS).map(([key, skin]) => (
                    <SelectItem key={key} value={key}>
                      {skin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : stats && stats.stats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.stats.map((stat: { skinKey: string; goodCount: number; badCount: number; totalCount: number; goodPercentage: number }) => {
              const skin = SKINS[stat.skinKey as keyof typeof SKINS];
              const total = stat.totalCount;
              const positiveRate = stat.goodPercentage;
              const negativeRate = 100 - stat.goodPercentage;
              const isLowRated = positiveRate < 50 && total >= 5;

              return (
                <Card key={stat.skinKey} className={`shadow-lg ${isLowRated ? 'border-red-300 bg-red-50' : ''}`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{skin?.name || stat.skinKey}</span>
                      {isLowRated && (
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                          要改善
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Total Count */}
                      <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">{total}</p>
                        <p className="text-sm text-gray-600">総フィードバック数</p>
                      </div>

                      {/* Positive/Negative Breakdown */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm">良い</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{stat.goodCount}</span>
                            <span className="text-xs text-gray-500">({positiveRate.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all"
                            style={{ width: `${positiveRate}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ThumbsDown className="h-4 w-4 text-red-500" />
                            <span className="text-sm">悪い</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{stat.badCount}</span>
                            <span className="text-xs text-gray-500">({negativeRate.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all"
                            style={{ width: `${negativeRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Improve Button */}
                      {isLowRated && (
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full mt-4 bg-purple-500 hover:bg-purple-600"
                          onClick={() => handleImprove(stat.skinKey)}
                          disabled={improveSkinMutation.isPending}
                        >
                          <Sparkles className="mr-2 h-4 w-4" />
                          改善提案を生成
                        </Button>
                      )}

                      {/* Trend Indicator */}
                      {total >= 5 && (
                        <div className="flex items-center justify-center gap-2 pt-2 border-t">
                          {positiveRate >= 70 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-600 font-medium">高評価</span>
                            </>
                          ) : positiveRate >= 50 ? (
                            <>
                              <BarChart3 className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm text-yellow-600 font-medium">普通</span>
                            </>
                          ) : (
                            <>
                              <TrendingDown className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-600 font-medium">低評価</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600">フィードバックデータがありません</p>
              <p className="text-sm text-gray-500 mt-2">
                ユーザーからのフィードバックが送信されると、ここに統計が表示されます。
              </p>
            </CardContent>
          </Card>
        )}

        {/* Improvement Modal */}
        <Dialog open={improvementModalOpen} onOpenChange={setImprovementModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                スキン改善提案
              </DialogTitle>
              <DialogDescription>
                AIが生成した改善提案です。以下の内容をshared/skins.tsにコピーして適用してください。
              </DialogDescription>
            </DialogHeader>

            {improvementData && (
              <div className="space-y-6">
                {/* Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">フィードバック統計</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold">{improvementData.stats.totalCount}</p>
                        <p className="text-xs text-gray-600">総数</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{improvementData.stats.goodCount}</p>
                        <p className="text-xs text-gray-600">良い</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-600">{improvementData.stats.badCount}</p>
                        <p className="text-xs text-gray-600">悪い</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Reasoning */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">改善理由</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{improvementData.improved.reasoning}</p>
                  </CardContent>
                </Card>

                {/* Improved Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center justify-between">
                      改善された内容
                      <Button size="sm" variant="outline" onClick={handleCopyImprovement}>
                        <Copy className="mr-2 h-4 w-4" />
                        コピー
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">ルール:</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{improvementData.improved.improvedRules}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">DOリスト:</h4>
                      <ul className="text-sm text-gray-700 bg-gray-50 p-3 rounded space-y-1">
                        {improvementData.improved.improvedDoList.map((item: string, i: number) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">DON'Tリスト:</h4>
                      <ul className="text-sm text-gray-700 bg-gray-50 p-3 rounded space-y-1">
                        {improvementData.improved.improvedDontList.map((item: string, i: number) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">例文:</h4>
                      <ul className="text-sm text-gray-700 bg-gray-50 p-3 rounded space-y-2">
                        {improvementData.improved.improvedFewShots.map((item: string, i: number) => (
                          <li key={i} className="border-b pb-2 last:border-b-0">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
