import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoryStorage, HistoryItem } from "@/types/history";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Eye, FileText, Calendar, Tag, Columns } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function History() {
  const [, setLocation] = useLocation();
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [compareMode, setCompareMode] = useState(true); // Default to compare mode
  const { t } = useTranslation();

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const items = HistoryStorage.getAll();
    setHistoryItems(items);
  };

  const handleDelete = (id: string) => {
    try {
      HistoryStorage.remove(id);
      loadHistory();
      toast.success("履歴を削除しました");
    } catch (error) {
      console.error("Failed to delete history:", error);
      toast.error("履歴の削除に失敗しました");
    }
  };

  const handleClearAll = () => {
    try {
      HistoryStorage.clear();
      loadHistory();
      toast.success("全ての履歴を削除しました");
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast.error("履歴のクリアに失敗しました");
    }
  };

  const handleViewResult = (item: HistoryItem) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const handleViewOriginal = (item: HistoryItem) => {
    setSelectedItem(item);
    setShowViewModal(true);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const storageInfo = HistoryStorage.checkStorage();

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-black/40 backdrop-blur-md border-b border-white/5 z-50">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-gray-300 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span>トップに戻る</span>
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              変換履歴
            </h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container max-w-5xl mx-auto px-4 pt-24 pb-12">
        {/* Storage Info */}
        <Card className="mb-6 bg-purple-500/10 border border-purple-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-300">
                  保存件数: <span className="font-bold text-purple-400">{historyItems.length}</span> / 100件
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-300">
                  使用容量: <span className="font-bold text-purple-400">{storageInfo.percentage.toFixed(1)}%</span>
                </span>
              </div>
              {historyItems.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-400 hover:bg-red-500/10 hover:text-red-300 border-red-500/30">
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      全て削除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#1a1a23] border border-white/10 text-white">
                    <AlertDialogHeader>
                      <AlertDialogTitle>全ての履歴を削除しますか？</AlertDialogTitle>
                      <AlertDialogDescription>
                        この操作は取り消せません。全ての変換履歴が完全に削除されます。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearAll} className="bg-red-600 hover:bg-red-700">
                        削除する
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        {historyItems.length === 0 ? (
          <Card className="text-center py-12 bg-[#1a1a23]/80 border border-white/10">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">履歴がありません</p>
              <p className="text-gray-500 text-sm mb-6">テキストを変換すると、ここに履歴が表示されます</p>
              <Button onClick={() => setLocation("/")} className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
                テキストを変換する
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {historyItems.map((item) => (
              <Card key={item.id} className="bg-[#1a1a23]/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-purple-400" />
                        <CardTitle className="text-lg text-purple-400">{item.skinName}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10 hover:text-red-300">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#1a1a23] border border-white/10 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>この履歴を削除しますか？</AlertDialogTitle>
                          <AlertDialogDescription>
                            この操作は取り消せません。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>キャンセル</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-600 hover:bg-red-700">
                            削除する
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {item.originalText}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOriginal(item)}
                      className="flex-1 border-white/10 text-gray-300 hover:bg-white/5"
                    >
                      <FileText className="h-4 w-4 mr-1.5" />
                      元のテキスト
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleViewResult(item)}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                    >
                      <Eye className="h-4 w-4 mr-1.5" />
                      変換結果を見る
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-[#1a1a23] border border-white/10 rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedItem.skinName}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">{formatDate(selectedItem.timestamp)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={compareMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCompareMode(!compareMode)}
                    className={compareMode ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600" : ""}
                  >
                    <Columns className="h-4 w-4 mr-1.5" />
                    {compareMode ? "比較" : "変換結果のみ"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-white">
                    ✕
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {compareMode ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      元のテキスト
                    </h3>
                    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                      <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{selectedItem.originalText}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                      <Columns className="h-4 w-4 text-purple-400" />
                      変換結果
                    </h3>
                    <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                      <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{selectedItem.transformedText}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">変換結果</h3>
                  <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/20">
                    <p className="text-gray-200 whitespace-pre-wrap">{selectedItem.transformedText}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-white/10">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(selectedItem.transformedText);
                  toast.success("変換結果をコピーしました");
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              >
                変換結果をコピー
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
