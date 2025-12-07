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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { SKINS } from "../../../shared/skins";
import { Loader2, Sparkles, History as HistoryIcon, Settings as SettingsIcon, ChevronDown, BookOpen, Star, TrendingUp, Flame, Share2, ArrowRight, Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Tutorial } from "@/components/Tutorial";
import confetti from "canvas-confetti";

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [articleText, setArticleText] = useState("");
  const [selectedSkin, setSelectedSkin] = useState("kansai_banter");
  const [temperature, setTemperature] = useState(1.3);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(4000);
  const [lengthRatio, setLengthRatio] = useState(1.0);
  const [addCore3, setAddCore3] = useState(false);
  const [addGlossary, setAddGlossary] = useState(false);
  const [addQuestions, setAddQuestions] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [skinCategory, setSkinCategory] = useState<"all" | "dialect" | "character" | "genre" | "sns">("all");
  const [showResult, setShowResult] = useState(false);
  const [transformedText, setTransformedText] = useState("");
  const [transformedData, setTransformedData] = useState<any>(null);

  const transformMutation = trpc.transform.useMutation();
  const { data: favoritesData } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: customSkinsData } = trpc.customSkins.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const addFavoriteMutation = trpc.favorites.add.useMutation();
  const removeFavoriteMutation = trpc.favorites.remove.useMutation();
  const utils = trpc.useUtils();

  const favoriteSkinKeys = favoritesData?.favorites.map(f => f.skinKey) || [];
  const { data: settings } = trpc.settings.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: rateLimitStatus } = trpc.rateLimit.status.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 60000, // Refetch every minute
  });

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

  // Load settings when available
  useEffect(() => {
    if (settings) {
      if (settings.defaultSkin) {
        setSelectedSkin(settings.defaultSkin);
      }
      if (settings.defaultTemperature !== undefined && settings.defaultTemperature !== null) {
        setTemperature(settings.defaultTemperature);
      }
      if (settings.defaultTopP !== undefined && settings.defaultTopP !== null) {
        setTopP(settings.defaultTopP);
      }
      if (settings.defaultMaxTokens !== undefined && settings.defaultMaxTokens !== null) {
        setMaxTokens(settings.defaultMaxTokens);
      }
      if (settings.defaultLengthRatio !== undefined && settings.defaultLengthRatio !== null) {
        setLengthRatio(settings.defaultLengthRatio);
      }
    }
  }, [settings]);

  const handleTransform = async () => {
    // Validate inputs
    if (!articleText.trim()) {
      toast.error(t('articleTextRequired'));
      return;
    }

    try {
      const result = await transformMutation.mutateAsync({
        url: "",
        title: "記事",
        site: "AI言い換えメーカー",
        lang: "ja",
        extracted: articleText,
        skin: selectedSkin,
        params: {
          temperature,
          topP,
          maxOutputTokens: maxTokens,
          lengthRatio,
        },
        extras: {
          addCore3,
          addGlossary,
          addQuestions,
        },
      });

      // ピーク体験の演出 - 紙吹雪アニメーション
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // 変換結果を保存
      setTransformedText(result.output);
      setTransformedData(result);
      setShowResult(true);
      
      // 成功メッセージ
      toast.success(
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-500" />
          <span className="font-semibold">素晴らしい！変換が完了しました✨</span>
        </div>,
        {
          duration: 3000,
        }
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('transformError'));
    }
  };

  const { t } = useTranslation();
  const isLoading = transformMutation.isPending;

  // おすすめスキン（人気TOP3）
  const recommendedSkins = [
    { key: "kansai_banter", label: "関西ノリ風", icon: "🔥", badge: "一番人気" },
    { key: "young_slang", label: "若者言葉風", icon: "✨", badge: "トレンド" },
    { key: "rap_style", label: "ラップ風", icon: "🎤", badge: "エモい" },
  ];

  // スキンをカテゴリ別に分類
  const skinCategories = {
    dialect: ["kansai_banter"],
    character: ["detached_literature", "adult_innuendo", "ojisan_text", "poetic_emo", "gal_speak", "excessive_keigo"],
    genre: ["philosophical_quote", "engineer_style", "logical_politician", "quantitative_politician", "passionate_speech", "academic_paper"],
    sns: ["young_slang", "rap_style"],
  };

  const filteredSkins = skinCategory === "all" 
    ? Object.entries(SKINS)
    : Object.entries(SKINS).filter(([key]) => 
        skinCategories[skinCategory]?.includes(key)
      );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      {showTutorial && <Tutorial onClose={handleCloseTutorial} />}
      
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          {/* Top Navigation - バランスの取れたレイアウト */}
          <div className="flex items-center justify-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTutorial(true)}
            className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <BookOpen className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">{t('howToUse')}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/custom-skins")}
            className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <Star className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">{t('customSkinsButton')}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/history")}
            className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <HistoryIcon className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">{t('history')}</span>
          </Button>
          <LanguageSwitcher />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/settings")}
            className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
          >
            <SettingsIcon className="h-4 w-4 mr-1.5" />
            <span className="hidden sm:inline">{t('settings')}</span>
          </Button>
          </div>
        </div>
      </div>
      
      {/* Main Content - Offset for fixed header */}
      <div className="container max-w-5xl mx-auto px-4 pt-24">
        {/* Hero Section - 改善されたヘッダー */}
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
              3秒で文体マジック✨
            </p>
            <p className="text-lg text-gray-600">
              言葉を着せ替え、表現を楽しむ
            </p>
          </div>
        </div>

        {/* プログレスインジケーター */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">1</div>
            <span className="text-sm font-medium text-gray-700">テキスト入力</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full ${selectedSkin ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'} flex items-center justify-center font-bold transition-colors`}>2</div>
            <span className="text-sm font-medium text-gray-700">スキン選択</span>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold">3</div>
            <span className="text-sm font-medium text-gray-700">変換完了</span>
          </div>
        </div>

        {/* Main Card */}
        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-orange-50">
            <CardTitle className="text-2xl">{t('transformArticle')}</CardTitle>
            <CardDescription className="text-base">
              {t('pasteArticle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            {/* Article Text Input */}
            <div className="space-y-3">
              <Label htmlFor="articleText" className="text-lg font-semibold">{t('articleText')} *</Label>
              <textarea
                id="articleText"
                className="w-full min-h-[200px] p-4 border-2 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder={t('articlePlaceholder')}
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                disabled={isLoading}
                maxLength={10000}
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {t('characterWarning')}
                </p>
                <p className={`text-sm font-medium ${
                  articleText.length > 10000 ? 'text-red-600' :
                  articleText.length > 5000 ? 'text-orange-600' :
                  'text-gray-500'
                }`}>
                  {articleText.length} / 10000{t('characters')}
                </p>
              </div>
            </div>

            {/* おすすめスキン（TOP3） */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-500" />
                <h3 className="text-xl font-bold text-gray-900">おすすめスキン</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedSkins.map((skin) => {
                  const isFavorite = favoriteSkinKeys.includes(skin.key);
                  return (
                    <button
                      key={skin.key}
                      type="button"
                      onClick={() => setSelectedSkin(skin.key)}
                      disabled={isLoading}
                      className={`relative p-6 border-3 rounded-2xl text-left transition-all transform hover:scale-105 hover:shadow-xl ${
                        selectedSkin === skin.key
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg ring-4 ring-purple-200'
                          : 'border-gray-200 hover:border-purple-300 bg-white'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <Badge className="absolute top-3 right-3 bg-orange-500 text-white border-0">
                        {skin.badge}
                      </Badge>
                      <div className="text-4xl mb-3">{skin.icon}</div>
                      <div className="font-bold text-lg mb-2">{skin.label}</div>
                      <div className="text-sm text-gray-600">{SKINS[skin.key as keyof typeof SKINS]?.description || skin.label}</div>
                      {isAuthenticated && (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              if (isFavorite) {
                                await removeFavoriteMutation.mutateAsync({ skinKey: skin.key });
                                toast.success("お気に入りから削除しました");
                              } else {
                                await addFavoriteMutation.mutateAsync({ skinKey: skin.key });
                                toast.success("お気に入りに追加しました");
                              }
                              utils.favorites.list.invalidate();
                            } catch (error) {
                              toast.error(error instanceof Error ? error.message : "エラーが発生しました");
                            }
                          }}
                          disabled={isLoading || addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                          className="absolute bottom-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors disabled:opacity-50 shadow-md"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                            }`}
                          />
                        </button>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skin Selection with Tabs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold">{t('skinStyle')}</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLocation("/custom-skins")}
                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                >
                  <Star className="h-4 w-4 mr-2" />
                  カスタムスキンを作成
                </Button>
              </div>

              {/* カテゴリタブ */}
              <Tabs value={skinCategory} onValueChange={(v) => setSkinCategory(v as typeof skinCategory)} className="w-full">
                <TabsList className="grid w-full grid-cols-5 h-12">
                  <TabsTrigger value="all" className="text-sm font-medium">すべて</TabsTrigger>
                  <TabsTrigger value="dialect" className="text-sm font-medium">方言</TabsTrigger>
                  <TabsTrigger value="character" className="text-sm font-medium">キャラクター</TabsTrigger>
                  <TabsTrigger value="genre" className="text-sm font-medium">ジャンル</TabsTrigger>
                  <TabsTrigger value="sns" className="text-sm font-medium">SNS</TabsTrigger>
                </TabsList>

                <TabsContent value={skinCategory} className="mt-4">
                  {/* Custom Skins */}
                  {customSkinsData && customSkinsData.skins.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-gray-700 mb-3">カスタムスキン</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {customSkinsData.skins.map((skin) => {
                          const skinKey = `custom_${skin.id}`;
                          const isFavorite = favoriteSkinKeys.includes(skinKey);
                          return (
                            <div key={skinKey} className="relative">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => setSelectedSkin(skinKey)}
                                      disabled={isLoading}
                                      className={`w-full p-4 border-2 rounded-xl text-left transition-all hover:shadow-lg transform hover:scale-105 ${
                                        selectedSkin === skinKey
                                          ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200'
                                          : 'border-gray-200 hover:border-purple-300'
                                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                      <div className="font-semibold text-sm mb-1">{skin.name}</div>
                                      <div className="text-xs text-gray-600 line-clamp-2">{skin.description || 'カスタムスキン'}</div>
                                    </button>
                                  </TooltipTrigger>
                                  {skin.example && (
                                    <TooltipContent side="top" className="max-w-xs">
                                      <p className="text-sm whitespace-pre-wrap">{skin.example}</p>
                                    </TooltipContent>
                                  )}
                                </Tooltip>
                              </TooltipProvider>
                              {isAuthenticated && (
                                <button
                                  type="button"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      if (isFavorite) {
                                        await removeFavoriteMutation.mutateAsync({ skinKey });
                                        toast.success("お気に入りから削除しました");
                                      } else {
                                        await addFavoriteMutation.mutateAsync({ skinKey });
                                        toast.success("お気に入りに追加しました");
                                      }
                                      utils.favorites.list.invalidate();
                                    } catch (error) {
                                      toast.error(error instanceof Error ? error.message : "エラーが発生しました");
                                    }
                                  }}
                                  disabled={isLoading || addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors disabled:opacity-50 shadow-md"
                                >
                                  <Star
                                    className={`h-4 w-4 ${
                                      isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Default Skins */}
                  <p className="text-sm font-semibold text-gray-700 mb-3">デフォルトスキン</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredSkins.map(([key, skin]) => {
                      const isFavorite = favoriteSkinKeys.includes(key);
                      return (
                        <div key={key} className="relative">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => setSelectedSkin(key)}
                                  disabled={isLoading}
                                  className={`w-full p-4 border-2 rounded-xl text-left transition-all hover:shadow-lg transform hover:scale-105 ${
                                    selectedSkin === key
                                      ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-200'
                                      : 'border-gray-200 hover:border-purple-300'
                                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                  <div className="font-semibold text-sm mb-1">{t(`skin.${key}`)}</div>
                                  <div className="text-xs text-gray-600 line-clamp-2">{t(`skin.${key}.desc`)}</div>
                                </button>
                              </TooltipTrigger>
                              {skin.example && (
                                <TooltipContent side="top" className="max-w-xs">
                                  <p className="text-sm whitespace-pre-wrap">{skin.example}</p>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                          {isAuthenticated && (
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  if (isFavorite) {
                                    await removeFavoriteMutation.mutateAsync({ skinKey: key });
                                    toast.success("お気に入りから削除しました");
                                  } else {
                                    await addFavoriteMutation.mutateAsync({ skinKey: key });
                                    toast.success("お気に入りに追加しました");
                                  }
                                  utils.favorites.list.invalidate();
                                } catch (error) {
                                  toast.error(error instanceof Error ? error.message : "エラーが発生しました");
                                }
                              }}
                              disabled={isLoading || addFavoriteMutation.isPending || removeFavoriteMutation.isPending}
                              className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors disabled:opacity-50 shadow-md"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
                                }`}
                              />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Advanced Settings */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between hover:bg-gray-50">
                  <span className="font-semibold">{t('advancedSettings')}</span>
                  <ChevronDown className="h-5 w-5" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-6 pt-6">
                {/* Temperature */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="temperature" className="font-medium">{t('temperature')}</Label>
                    <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-md">{temperature.toFixed(1)}</span>
                  </div>
                  <Slider
                    id="temperature"
                    min={0.1}
                    max={2.0}
                    step={0.1}
                    value={[temperature]}
                    onValueChange={(value) => setTemperature(value[0])}
                    disabled={isLoading}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">{t('temperatureDescription')}</p>
                </div>

                {/* Top P */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="topP" className="font-medium">{t('topP')}</Label>
                    <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-md">{topP.toFixed(2)}</span>
                  </div>
                  <Slider
                    id="topP"
                    min={0.1}
                    max={1.0}
                    step={0.05}
                    value={[topP]}
                    onValueChange={(value) => setTopP(value[0])}
                    disabled={isLoading}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">{t('topPDescription')}</p>
                </div>

                {/* Max Tokens */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="maxTokens" className="font-medium">{t('maxTokens')}</Label>
                    <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-md">{maxTokens}</span>
                  </div>
                  <Slider
                    id="maxTokens"
                    min={50}
                    max={8000}
                    step={100}
                    value={[maxTokens]}
                    onValueChange={(value) => setMaxTokens(value[0])}
                    disabled={isLoading}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">{t('maxTokensDescription')}</p>
                </div>

                {/* Length Ratio */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="lengthRatio" className="font-medium">{t('lengthRatio')}</Label>
                    <span className="text-sm font-mono bg-gray-100 px-3 py-1 rounded-md">{lengthRatio.toFixed(1)}x</span>
                  </div>
                  <Slider
                    id="lengthRatio"
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    value={[lengthRatio]}
                    onValueChange={(value) => setLengthRatio(value[0])}
                    disabled={isLoading}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500">{t('lengthRatioDescription')}</p>
                </div>

                {/* Additional Options */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="addCore3" className="font-medium">{t('addCore3')}</Label>
                      <p className="text-xs text-gray-500">{t('addCore3Description')}</p>
                    </div>
                    <Switch
                      id="addCore3"
                      checked={addCore3}
                      onCheckedChange={setAddCore3}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="addGlossary" className="font-medium">{t('addGlossary')}</Label>
                      <p className="text-xs text-gray-500">{t('addGlossaryDescription')}</p>
                    </div>
                    <Switch
                      id="addGlossary"
                      checked={addGlossary}
                      onCheckedChange={setAddGlossary}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="addQuestions" className="font-medium">{t('addQuestions')}</Label>
                      <p className="text-xs text-gray-500">{t('addQuestionsDescription')}</p>
                    </div>
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

            {/* Rate Limit Display */}
            {rateLimitStatus && (
              <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl">
                <Zap className={`h-5 w-5 ${rateLimitStatus.remaining < 10 ? 'text-red-500' : 'text-purple-600'}`} />
                <span className={`text-sm font-semibold ${rateLimitStatus.remaining < 10 ? 'text-red-600' : 'text-gray-700'}`}>
                  {t('remainingTransformations')}: {rateLimitStatus.remaining}/{rateLimitStatus.limit}{t('times')}
                </span>
              </div>
            )}

            {/* Transform Button - 大きく目立つCTA */}
            <Button
              onClick={handleTransform}
              disabled={isLoading || !articleText.trim() || !selectedSkin}
              className="w-full h-16 text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  {t('transforming')}...
                </>
              ) : (
                <>
                  <Sparkles className="mr-3 h-6 w-6 animate-pulse" />
                  ✨ {t('transform')} ✨
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-600">
          <button
            onClick={() => setShowTutorial(true)}
            className="hover:text-purple-600 transition-colors font-medium"
          >
            {t('howToUse')}
          </button>
          <button
            onClick={() => setLocation("/history")}
            className="hover:text-purple-600 transition-colors font-medium"
          >
            {t('history')}
          </button>
          <button
            onClick={() => setLocation("/settings")}
            className="hover:text-purple-600 transition-colors font-medium"
          >
            {t('settings')}
          </button>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t text-center text-sm text-gray-600">
          <p className="mb-2">{t('appDescription')}</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span>{t('creator')}: <a href="https://twitter.com/kojima920" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline font-medium">@kojima920</a></span>
            <span>|</span>
            <span>{t('contact')}: <a href="mailto:mk19830920@gmail.com" className="text-purple-600 hover:underline font-medium">mk19830920@gmail.com</a></span>
            <span>|</span>
            <span>{t('donation')}: <span className="font-medium">PayPay ID: kojima1459</span></span>
          </div>
          <p className="mt-4 text-xs text-gray-500">© 2025 {t('appTitle')}. All rights reserved.</p>
        </footer>
      </div>

      {/* 変換結果モーダル */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              変換結果
            </DialogTitle>
            <DialogDescription>
              スキン: {Object.values(SKINS).find((s: any) => s.key === selectedSkin)?.name || selectedSkin}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{transformedText}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(transformedText);
                  toast.success("コピーしました！");
                }}
              >
                <span className="mr-2">📋</span>
                コピー
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const text = encodeURIComponent(transformedText.substring(0, 200) + "... #AI言い換えメーカー");
                  window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Xで共有
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
