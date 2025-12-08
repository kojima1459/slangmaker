import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { SKINS } from "../../../shared/skins";
import { Loader2, Sparkles, ChevronDown, BookOpen, ExternalLink, Heart } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Tutorial } from "@/components/Tutorial";
import { Footer } from "@/components/Footer";
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
  const [favoriteSkins, setFavoriteSkins] = useState<string[]>([]);

  const transformMutation = trpc.transform.useMutation();
  const { t } = useTranslation();

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Load favorite skins from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteSkins');
    if (savedFavorites) {
      setFavoriteSkins(JSON.parse(savedFavorites));
    }
  }, []);

  // Toggle favorite skin
  const toggleFavorite = (skinKey: string) => {
    setFavoriteSkins(prev => {
      const newFavorites = prev.includes(skinKey)
        ? prev.filter(key => key !== skinKey)
        : [...prev, skinKey];
      localStorage.setItem('favoriteSkins', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

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

    // API key check removed - server will use environment variable if user key is not set

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

      // Save data to sessionStorage for Reader page
      sessionStorage.setItem('readerData', JSON.stringify({
        result: {
          output: result.output,
          meta: {
            skin: selectedSkin,
          },
        },
        skin: selectedSkin,
        article: {
          title: '',
          site: '',
          url: '',
          contentText: articleText,
        },
      }));

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
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Sparkles className="w-16 h-16 text-purple-600 animate-pulse" />
              <div className="absolute inset-0 w-16 h-16 bg-purple-400 blur-xl opacity-50 animate-pulse"></div>
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent leading-tight">
              {t('appTitle')}
            </h1>
          </div>
          <div className="space-y-3 max-w-3xl mx-auto">
            <p className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">
              {t('tagline1')}
            </p>
            <p className="text-xl md:text-2xl text-gray-600 font-medium">
              {t('tagline2')}
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
            {/* API Key Input */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <Label htmlFor="apiKey" className="text-lg font-semibold text-blue-900">
                  {t('geminiApiKey') || "Gemini APIキー"} *
                </Label>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  {t('getApiKey') || "APIキーを取得"}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="AIza..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSaveApiKey} variant="outline">
                  {t('save') || "保存"}
                </Button>
              </div>
              <p className="text-xs text-blue-700">
                {t('apiKeyNote') || "APIキーはブラウザに保存され、サーバーには送信されません"}
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
              
              {/* Favorite Skins Section */}
              {favoriteSkins.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-purple-700">{t('favoriteSkins') || "お気に入り"}</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {favoriteSkins.map((key) => {
                      const skin = SKINS[key as keyof typeof SKINS];
                      if (!skin) return null;
                      return (
                        <div key={key} className="relative">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => setSelectedSkin(key)}
                                  disabled={isLoading}
                                  className={`w-full p-5 border-2 rounded-2xl text-left transition-all duration-200 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 ${
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
                              </TooltipTrigger>
                              {skin.example && (
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="text-sm font-medium mb-1">{t('preview') || 'プレビュー'}</p>
                                  <p className="text-xs">{skin.example}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(key);
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                          >
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* All Skins */}
              <div className="space-y-2">
                {favoriteSkins.length > 0 && (
                  <p className="text-sm font-medium text-gray-700">{t('allSkins') || "すべてのスキン"}</p>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(SKINS).map(([key, skin]) => (
                    <div key={key} className="relative">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setSelectedSkin(key)}
                              disabled={isLoading}
                              className={`w-full p-5 border-2 rounded-2xl text-left transition-all duration-200 hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 ${
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
                          </TooltipTrigger>
                          {skin.example && (
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-sm font-medium mb-1">{t('preview') || 'プレビュー'}</p>
                              <p className="text-xs">{skin.example}</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(key);
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                      >
                        <Heart className={`h-4 w-4 ${
                          favoriteSkins.includes(key)
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
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
              className="w-full h-20 text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:from-purple-700 hover:via-pink-600 hover:to-orange-600 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-2xl"
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
      
      {/* Footer */}
      <Footer />
      
      {/* Tutorial Modal */}
      {showTutorial && <Tutorial onClose={handleCloseTutorial} />}
    </div>
  );
}
