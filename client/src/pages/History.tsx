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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-gray-700 hover:text-purple-700 hover:bg-purple-50"
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
      <div className="container max-w-5xl mx-auto px-4 pt-24 pb-12">
        {/* Storage Info */}
        <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                <span className="text-sm text-gray-700">
                  保存件数: <span className="font-bold text-purple-700">{historyItems.length}</span> / 100件
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">
                  使用容量: <span className="font-bold text-purple-700">{storageInfo.percentage.toFixed(1)}%</span>
                </span>
              </div>
              {historyItems.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-1.5" />
                      全て削除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
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
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">履歴がありません</p>
              <p className="text-gray-400 text-sm mb-6">テキストを変換すると、ここに履歴が表示されます</p>
              <Button onClick={() => setLocation("/")} className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
                テキストを変換する
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {historyItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Tag className="h-4 w-4 text-purple-600" />
                        <CardTitle className="text-lg text-purple-700">{item.skinName}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{formatDate(item.timestamp)}</span>
                      </div>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
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
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.originalText}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewOriginal(item)}
                      className="flex-1"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedItem.skinName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{formatDate(selectedItem.timestamp)}</p>
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
                  <Button variant="ghost" size="sm" onClick={() => setShowViewModal(false)}>
                    ✕
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
              {compareMode ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      元のテキスト
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedItem.originalText}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Columns className="h-4 w-4 text-purple-600" />
                      変換結果
                    </h3>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{selectedItem.transformedText}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">変換結果</h3>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                    <p className="text-gray-800 whitespace-pre-wrap">{selectedItem.transformedText}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200">
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
