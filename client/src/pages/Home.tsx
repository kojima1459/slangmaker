import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { SKINS } from "../../../shared/skins";
import { Loader2, Sparkles, History as HistoryIcon, Settings as SettingsIcon } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedSkin, setSelectedSkin] = useState("kansai_banter");
  const [temperature, setTemperature] = useState(1.3);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(220);
  const [lengthRatio, setLengthRatio] = useState(1.0);
  const [addCore3, setAddCore3] = useState(false);
  const [addGlossary, setAddGlossary] = useState(false);
  const [addQuestions, setAddQuestions] = useState(false);

  const extractMutation = trpc.extract.useMutation();
  const transformMutation = trpc.transform.useMutation();

  const handleTransform = async () => {
    if (!url) {
      toast.error("URLを入力してください");
      return;
    }

    if (!apiKey) {
      toast.error("Gemini APIキーを入力してください");
      return;
    }

    try {
      // Extract article
      toast.info("記事を抽出中...");
      const article = await extractMutation.mutateAsync({ url });

      // Transform with selected skin
      toast.info("変換中...");
      const result = await transformMutation.mutateAsync({
        url: article.url,
        title: article.title,
        site: article.site,
        lang: article.lang,
        extracted: article.contentText,
        skin: selectedSkin,
        params: {
          temperature,
          topP,
          maxOutputTokens: maxTokens,
          lengthRatio,
          humor: 0.6,
          insightLevel: 0.7,
        },
        extras: {
          addCore3,
          addGlossary,
          addQuestions,
        },
        apiKey,
      });

      toast.success("変換完了！");
      
      // Store result in sessionStorage and navigate
      sessionStorage.setItem('readerData', JSON.stringify({
        article,
        result,
        skin: selectedSkin,
      }));
      setLocation("/reader");
    } catch (error) {
      console.error("Transform error:", error);
      toast.error(error instanceof Error ? error.message : "変換に失敗しました");
    }
  };

  const isLoading = extractMutation.isPending || transformMutation.isPending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-4xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              NewsSkins
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            ニュースをスキンで読む - 記事を様々な文体で楽しむ
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>記事を変換</CardTitle>
            <CardDescription>
              URLを入力して、お好みのスキン（文体）で記事を読み直しましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input */}
            <div className="space-y-2">
              <Label htmlFor="url">記事URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com/news/article"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">Gemini API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="AIza..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                APIキーはローカルに保存され、サーバーには送信されません
              </p>
            </div>

            {/* Skin Selection */}
            <div className="space-y-2">
              <Label htmlFor="skin">スキン（文体）</Label>
              <Select value={selectedSkin} onValueChange={setSelectedSkin} disabled={isLoading}>
                <SelectTrigger id="skin">
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
              <p className="text-sm text-gray-600">
                {SKINS[selectedSkin]?.description}
              </p>
            </div>

            {/* Advanced Settings */}
            <details className="space-y-4">
              <summary className="cursor-pointer text-sm font-medium text-gray-700">
                詳細設定
              </summary>
              <div className="space-y-4 pt-4">
                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>温度 (Temperature)</Label>
                    <span className="text-sm text-gray-500">{temperature.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={([v]) => setTemperature(v!)}
                    min={0.1}
                    max={1.6}
                    step={0.1}
                    disabled={isLoading}
                  />
                </div>

                {/* Top-P */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Top-P</Label>
                    <span className="text-sm text-gray-500">{topP.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[topP]}
                    onValueChange={([v]) => setTopP(v!)}
                    min={0.1}
                    max={1.0}
                    step={0.1}
                    disabled={isLoading}
                  />
                </div>

                {/* Length Ratio */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>出力長倍率</Label>
                    <span className="text-sm text-gray-500">{lengthRatio.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[lengthRatio]}
                    onValueChange={([v]) => setLengthRatio(v!)}
                    min={0.6}
                    max={1.6}
                    step={0.1}
                    disabled={isLoading}
                  />
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>最大トークン数</Label>
                    <span className="text-sm text-gray-500">{maxTokens}</span>
                  </div>
                  <Slider
                    value={[maxTokens]}
                    onValueChange={([v]) => setMaxTokens(v!)}
                    min={100}
                    max={2000}
                    step={50}
                    disabled={isLoading}
                  />
                </div>

                {/* Extras */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="core3">本質3点を追加</Label>
                    <Switch
                      id="core3"
                      checked={addCore3}
                      onCheckedChange={setAddCore3}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="glossary">用語ミニ辞典を追加</Label>
                    <Switch
                      id="glossary"
                      checked={addGlossary}
                      onCheckedChange={setAddGlossary}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="questions">素朴な疑問を追加</Label>
                    <Switch
                      id="questions"
                      checked={addQuestions}
                      onCheckedChange={setAddQuestions}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </details>

            {/* Transform Button */}
            <Button
              onClick={handleTransform}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  処理中...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  変換する
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Navigation Links */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            variant="outline"
            onClick={() => setLocation("/history")}
          >
            <HistoryIcon className="mr-2 h-4 w-4" />
            履歴
          </Button>
          <Button
            variant="outline"
            onClick={() => setLocation("/settings")}
          >
            <SettingsIcon className="mr-2 h-4 w-4" />
            設定
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>記事を様々な文体で楽しむPWAアプリ</p>
        </div>
      </div>
    </div>
  );
}
