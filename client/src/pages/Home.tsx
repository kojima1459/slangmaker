import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { SKINS } from "../../../shared/skins";
import { Loader2, Sparkles, ChevronDown, BookOpen, ExternalLink } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Tutorial } from "@/components/Tutorial";
import confetti from "canvas-confetti";

export default function Home() {
  const [, setLocation] = useLocation();
  const [apiKey, setApiKey] = useState("");
  const [articleText, setArticleText] = useState("");
  const [selectedSkin, setSelectedSkin] = useState("kansai_banter");
  const [temperature, setTemperature] = useState(1.3);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(4000);
  const [lengthRatio, setLengthRatio] = useState(1.0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const transformMutation = trpc.transform.useMutation();
  const { t } = useTranslation();

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Check if first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setShowTutorial(true);
    }
  }, []);

  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasVisited', 'true');
  };

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('geminiApiKey', apiKey.trim());
      toast.success(t('apiKeySaved') || "APIキーを保存しました");
    } else {
      toast.error(t('apiKeyRequired') || "APIキーを入力してください");
    }
  };

  const handleTransform = async () => {
    // Validate inputs
    if (!articleText.trim()) {
      toast.error(t('articleTextRequired') || "テキストを入力してください");
      return;
    }

    if (articleText.length > 10000) {
      toast.error(t('characterLimitExceeded') || "文字数が上限を超えています");
      return;
    }

    setIsLoading(true);

    try {
      const result = await transformMutation.mutateAsync({
        extracted: articleText,
        skin: selectedSkin,
        params: {
          temperature,
          topP,
          maxOutputTokens: maxTokens,
          lengthRatio,
        },
      });

      // Show confetti animation
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Save result to sessionStorage for Reader page
      const readerData = {
        result: {
          output: result.output,
          meta: {
            skin: selectedSkin,
          }
        },
        article: {
          title: "変換結果",
          site: "AISlang Maker",
          url: "",
          contentText: articleText,
        },
        skin: selectedSkin,
      };
      sessionStorage.setItem('readerData', JSON.stringify(readerData));

      // Navigate to reader page
      setLocation("/reader");

      toast.success(t('transformSuccess') || "変換が完了しました！");
    } catch (error: any) {
      console.error("Transform error:", error);
      
      if (error.message?.includes('timeout')) {
        toast.error(t('transformTimeout') || "変換がタイムアウトしました。もう一度お試しください。");
      } else if (error.message?.includes('rate limit')) {
        toast.error(t('rateLimitExceeded') || "1日の変換回数の上限に達しました。");
      } else {
        toast.error(error.message || t('transformError') || "変換に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Tutorial Modal */}
      {showTutorial && (
        <Tutorial onClose={handleCloseTutorial} />
      )}

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/guide")}
              className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
            >
              <BookOpen className="h-4 w-4 mr-1.5" />
              <span>{t('howToUse')}</span>
            </Button>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="relative">
              <Sparkles className="w-12 h-12 text-purple-600 animate-pulse" />
              <div className="absolute inset-0 w-12 h-12 bg-purple-400 blur-xl opacity-50 animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              {t('appTitle')}
            </h1>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-gray-800">
              {t('tagline1') || "3秒で文体マジック✨"}
            </p>
            <p className="text-lg text-gray-600">
              {t('tagline2') || "言葉を着せ替え、表現を楽しむ"}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-orange-50">
            <CardTitle className="text-2xl">{t('transformArticle') || "テキストを変換"}</CardTitle>
            <CardDescription className="text-base">
              {t('pasteArticle') || "テキストを貼り付けて、好きなスタイルに変換しましょう"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {/* API Key Info - Using Manus Built-in LLM API */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                ✨ <strong>Manus Built-in LLM APIを使用しています</strong>
              </p>
              <p className="text-xs text-blue-700">
                APIキーの設定は不要です。Manusのサーバー側で自動的に処理されます。
              </p>
            </div>

            {/* Article Text Input */}
            <div className="space-y-3">
              <Label htmlFor="articleText" className="text-lg font-semibold">
                {t('articleText') || "テキスト"} *
              </Label>
              <textarea
                id="articleText"
                className="w-full min-h-[200px] p-4 border-2 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder={t('articlePlaceholder') || "変換したいテキストを貼り付けてください..."}
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                disabled={isLoading}
                maxLength={10000}
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {t('characterWarning') || "最大10,000文字まで"}
                </p>
                <p className={`text-sm font-medium ${
                  articleText.length > 10000 ? 'text-red-600' :
                  articleText.length > 5000 ? 'text-orange-600' :
                  'text-gray-500'
                }`}>
                  {articleText.length} / 10000{t('characters') || "文字"}
                </p>
              </div>
            </div>

            {/* Skin Selection */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">{t('skinStyle') || "スタイル選択"}</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(SKINS).map(([key, skin]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedSkin(key)}
                    disabled={isLoading}
                    className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-lg transform hover:scale-105 ${
                      selectedSkin === key
                        ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200'
                        : 'border-gray-200 hover:border-purple-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="font-semibold text-sm mb-1">{t(`skin.${key}`) || skin.name}</div>
                    <div className="text-xs text-gray-600 line-clamp-2">
                      {t(`skin.${key}.desc`) || skin.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Settings */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full">
                  <ChevronDown className="h-4 w-4 mr-2" />
                  {t('advancedSettings') || "詳細設定"}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-6 mt-4 p-4 border rounded-xl bg-gray-50">
                {/* Temperature */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>{t('temperature') || "Temperature"}</Label>
                    <span className="text-sm font-medium text-gray-600">{temperature.toFixed(1)}</span>
                  </div>
                  <Slider
                    value={[temperature]}
                    onValueChange={([v]) => setTemperature(v)}
                    min={0}
                    max={2}
                    step={0.1}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    {t('temperatureDescription') || "高いほど創造的、低いほど安定的"}
                  </p>
                </div>

                {/* Top-p */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>{t('topP') || "Top-p"}</Label>
                    <span className="text-sm font-medium text-gray-600">{topP.toFixed(2)}</span>
                  </div>
                  <Slider
                    value={[topP]}
                    onValueChange={([v]) => setTopP(v)}
                    min={0}
                    max={1}
                    step={0.01}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    {t('topPDescription') || "多様性のコントロール"}
                  </p>
                </div>

                {/* Max Tokens */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>{t('maxTokens') || "最大トークン数"}</Label>
                    <span className="text-sm font-medium text-gray-600">{maxTokens}</span>
                  </div>
                  <Slider
                    value={[maxTokens]}
                    onValueChange={([v]) => setMaxTokens(v)}
                    min={50}
                    max={8000}
                    step={50}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    {t('maxTokensDescription') || "出力の最大長"}
                  </p>
                </div>

                {/* Length Ratio */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>{t('lengthRatio') || "長さ比率"}</Label>
                    <span className="text-sm font-medium text-gray-600">{lengthRatio.toFixed(1)}x</span>
                  </div>
                  <Slider
                    value={[lengthRatio]}
                    onValueChange={([v]) => setLengthRatio(v)}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    {t('lengthRatioDescription') || "元のテキストに対する出力の長さ"}
                  </p>
                </div>
              </CollapsibleContent>
            </Collapsible>

            {/* Transform Button */}
            <Button
              onClick={handleTransform}
              disabled={isLoading || !articleText.trim()}
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  {t('transforming') || "変換中..."}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-6 w-6" />
                  {t('transformButton') || "変換する"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
