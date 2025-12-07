import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Save, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { SKINS } from "../../../shared/skins";
import { getLoginUrl } from "@/const";

export default function Settings() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { data: settings } = trpc.settings.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const updateMutation = trpc.settings.update.useMutation();

  const [apiKey, setApiKey] = useState("");
  const [defaultSkin, setDefaultSkin] = useState("kansai_banter");

  useEffect(() => {
    if (settings) {
      setDefaultSkin(settings.defaultSkin || "kansai_banter");
    }
  }, [settings]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>ログインが必要です</CardTitle>
            <CardDescription>
              設定を保存するにはログインしてください
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

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        defaultSkin,
        encryptedApiKey: apiKey || undefined,
      });
      toast.success("設定を保存しました");
    } catch (error) {
      toast.error("設定の保存に失敗しました");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-2xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">設定</h1>
            <p className="text-sm text-gray-600">アプリの設定を管理</p>
          </div>
        </div>

        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle>基本設定</CardTitle>
            <CardDescription>
              デフォルトのスキンやAPIキーを設定できます
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">Gemini API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                APIキーはローカルに暗号化して保存されます
              </p>
            </div>

            {/* Default Skin */}
            <div className="space-y-2">
              <Label htmlFor="defaultSkin">デフォルトスキン</Label>
              <Select value={defaultSkin} onValueChange={setDefaultSkin}>
                <SelectTrigger id="defaultSkin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SKINS).map((skin) => (
                    <SelectItem key={skin.key} value={skin.key}>
                      {skin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="w-full"
            >
              <Save className="mr-2 h-4 w-4" />
              {updateMutation.isPending ? "保存中..." : "設定を保存"}
            </Button>
          </CardContent>
        </Card>

        {/* Admin Section */}
        {user?.role === "admin" && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                管理者ツール
              </CardTitle>
              <CardDescription>
                管理者専用の機能と分析ツール
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setLocation("/feedback")}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                フィードバック分析ダッシュボード
              </Button>
              <p className="text-xs text-gray-500">
                ユーザーからのフィードバックを分析し、スキンの評価を確認できます。
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
