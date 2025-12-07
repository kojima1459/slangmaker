import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { SKINS } from "../../../shared/skins";
import { Loader2, Sparkles, History as HistoryIcon, Settings as SettingsIcon, ChevronDown } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [articleText, setArticleText] = useState("");
  const [articleTitle, setArticleTitle] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedSkin, setSelectedSkin] = useState("kansai_banter");
  const [temperature, setTemperature] = useState(1.3);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(1500);
  const [lengthRatio, setLengthRatio] = useState(1.0);
  const [addCore3, setAddCore3] = useState(false);
  const [addGlossary, setAddGlossary] = useState(false);
  const [addQuestions, setAddQuestions] = useState(false);

  const transformMutation = trpc.transform.useMutation();

  const handleTransform = async () => {
    // Validate inputs
    if (!articleText.trim()) {
      toast.error("記事テキストを入力してください");
      return;
    }

    if (!sourceUrl.trim()) {
      toast.error("元記事URLを入力してください");
      return;
    }

    if (!apiKey) {
      toast.error("Gemini APIキーを入力してください");
      return;
    }

    try {
      // Create article object from user input
      const article = {
        title: articleTitle.trim() || "無題",
        site: new URL(sourceUrl).hostname,
        url: sourceUrl,
        contentText: articleText.trim(),
        lang: "ja", // Default to Japanese
      };

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

  const isLoading = transformMutation.isPending;

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
              記事本文を貼り付けて、お好みのスキン（文体）で読み直しましょう
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Article Text Input */}
            <div className="space-y-2">
              <Label htmlFor="articleText">記事本文 *</Label>
              <textarea
                id="articleText"
                className="w-full min-h-[200px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="記事の本文をここに貼り付けてください..."
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                変換したい記事の本文をコピー&ペーストしてください
              </p>
            </div>

            {/* Article Title Input (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="articleTitle">記事タイトル（任意）</Label>
              <Input
                id="articleTitle"
                type="text"
                placeholder="例: インフルエンザ患者数 前週の2倍以上"
                value={articleTitle}
                onChange={(e) => setArticleTitle(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Source URL Input */}
            <div className="space-y-2">
              <Label htmlFor="sourceUrl">元記事URL *</Label>
              <Input
                id="sourceUrl"
                type="url"
                placeholder="https://www3.nhk.or.jp/news/..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                元記事へのリンクを表示するために必要です
              </p>
            </div>

            {/* API Key Input */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">Gemini API Key *</Label>
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
                  {Object.entries(SKINS).map(([key, skin]) => (
                    <SelectItem key={key} value={key}>
                      {skin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600">
                {SKINS[selectedSkin as keyof typeof SKINS]?.description}
              </p>
            </div>

            {/* Advanced Settings */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span>詳細設定</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>温度 (Temperature)</Label>
                    <span className="text-sm text-gray-600">{temperature.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={([v]) => setTemperature(v)}
                    min={0}
                    max={2}
                    step={0.1}
                    disabled={isLoading}
                  />
                </div>

                {/* Top-p */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Top-p</Label>
                    <span className="text-sm text-gray-600">{topP.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[topP]}
                    onValueChange={([v]) => setTopP(v)}
                    min={0}
                    max={1}
                    step={0.1}
                    disabled={isLoading}
                  />
                </div>

                {/* Max Tokens */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>最大出力トークン</Label>
                    <span className="text-sm text-gray-600">{maxTokens}</span>
                  </div>
                  <Slider
                    value={[maxTokens]}
                    onValueChange={([v]) => setMaxTokens(v)}
                    min={500}
                    max={8000}
                    step={100}
                    disabled={isLoading}
                  />
                </div>

                {/* Length Ratio */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>長さ比率</Label>
                    <span className="text-sm text-gray-600">{lengthRatio.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[lengthRatio]}
                    onValueChange={([v]) => setLengthRatio(v)}
                    min={0.5}
                    max={2}
                    step={0.1}
                    disabled={isLoading}
                  />
                </div>

                {/* Extras */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="addCore3">コア3行を追加</Label>
                    <Switch
                      id="addCore3"
                      checked={addCore3}
                      onCheckedChange={setAddCore3}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="addGlossary">用語解説を追加</Label>
                    <Switch
                      id="addGlossary"
                      checked={addGlossary}
                      onCheckedChange={setAddGlossary}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="addQuestions">考察質問を追加</Label>
                    <Switch
                      id="addQuestions"
                      checked={addQuestions}
                      onCheckedChange={setAddQuestions}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Transform Button */}
            <Button
              onClick={handleTransform}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
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

        {/* Footer Links */}
        <div className="flex justify-center gap-4 mt-8">
          <Button variant="ghost" onClick={() => setLocation("/history")}>
            <HistoryIcon className="mr-2 h-4 w-4" />
            履歴
          </Button>
          <Button variant="ghost" onClick={() => setLocation("/settings")}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            設定
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          記事を様々な文体で楽しむPWAアプリ
        </p>
      </div>
    </div>
  );
}
