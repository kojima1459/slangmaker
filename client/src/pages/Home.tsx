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
import { Loader2, Sparkles, ChevronDown, BookOpen, ExternalLink, History, Columns, TrendingUp, Users, Zap, Plus, Trash2, Edit2, Share2, HelpCircle, Twitter, MessageCircle } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Tutorial } from "@/components/Tutorial";
import confetti from "canvas-confetti";
import { HistoryStorage } from "@/types/history";
import { CreateCustomSkinModal } from "@/components/CreateCustomSkinModal";
import { getCustomSkin, deleteCustomSkin, type CustomSkin } from "@/lib/customSkinStorage";

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
  
  // Compare mode states
  const [compareMode, setCompareMode] = useState(false);
  const [selectedSkin2, setSelectedSkin2] = useState("detached_lit");
  
  // Custom skin states
  const [customSkin, setCustomSkin] = useState<CustomSkin | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const transformMutation = trpc.transform.useMutation();
  const { t } = useTranslation();
  
  const handleCustomSkinSaved = (skin: CustomSkin) => {
    setCustomSkin(skin);
    // Auto-select the custom skin
    setSelectedSkin("custom");
  };
  
  const handleDeleteCustomSkin = () => {
    if (window.confirm("カスタムスキンを削除してもよろしいですか？")) {
      deleteCustomSkin();
      setCustomSkin(null);
      // Switch to default skin if custom was selected
      if (selectedSkin === "custom") {
        setSelectedSkin("kansai_banter");
      }
      toast.success("カスタムスキンを削除しました");
    }
  };
  
  // Fetch global stats
  const { data: stats } = trpc.stats.getGlobalStats.useQuery(undefined, {
    refetchInterval: 60000, // Refetch every minute
  });

  // Load API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);
  
  // Load custom skin from localStorage
  useEffect(() => {
    const stored = getCustomSkin();
    setCustomSkin(stored);
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
      if (compareMode) {
        // Compare mode: transform with two skins in parallel
        const skin1 = selectedSkin;
        const skin2 = selectedSkin2;
        
        const [result1, result2] = await Promise.all([
          transformMutation.mutateAsync({
            extracted: articleText,
            skin: skin1,
            customPrompt: selectedSkin === "custom" && customSkin ? customSkin.prompt : undefined,
            params: {
              temperature,
              topP,
              maxOutputTokens: maxTokens,
              lengthRatio,
            },
          }),
          transformMutation.mutateAsync({
            extracted: articleText,
            skin: skin2,
            customPrompt: selectedSkin2 === "custom" && customSkin ? customSkin.prompt : undefined,
            params: {
              temperature,
              topP,
              maxOutputTokens: maxTokens,
              lengthRatio,
            },
          }),
        ]);

        // Show confetti animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Save to history (localStorage)
        try {
          const skinName1 = Object.values(SKINS).find((s: any) => s.key === selectedSkin)?.name || selectedSkin;
          const skinName2 = Object.values(SKINS).find((s: any) => s.key === selectedSkin2)?.name || selectedSkin2;
          HistoryStorage.add({
            originalText: articleText,
            transformedText: result1.output,
            skinKey: selectedSkin,
            skinName: skinName1,
            isCompareMode: true,
            skinKey2: selectedSkin2,
            skinName2: skinName2,
            transformedText2: result2.output,
          });
        } catch (historyError) {
          console.error("Failed to save history:", historyError);
        }

        // Save compare result to sessionStorage
        const compareData = {
          originalText: articleText,
          result1: {
            output: result1.output,
            skinKey: selectedSkin,
            skinName: Object.values(SKINS).find((s: any) => s.key === selectedSkin)?.name || selectedSkin,
          },
          result2: {
            output: result2.output,
            skinKey: selectedSkin2,
            skinName: Object.values(SKINS).find((s: any) => s.key === selectedSkin2)?.name || selectedSkin2,
          },
        };
        sessionStorage.setItem('compareData', JSON.stringify(compareData));

        // Navigate to compare page
        setLocation("/compare");

        toast.success("比較変換が完了しました！");
      } else {
        // Normal mode: single transformation
        const skinToUse = selectedSkin;
        
        const result = await transformMutation.mutateAsync({
          extracted: articleText,
          skin: skinToUse,
          customPrompt: selectedSkin === "custom" && customSkin ? customSkin.prompt : undefined,
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

        // Save to history (localStorage)
        try {
          const skinName = Object.values(SKINS).find((s: any) => s.key === selectedSkin)?.name || selectedSkin;
          HistoryStorage.add({
            originalText: articleText,
            transformedText: result.output,
            skinKey: selectedSkin,
            skinName: skinName,
          });
        } catch (historyError) {
          console.error("Failed to save history:", historyError);
          // Don't block the flow if history save fails
        }

        // Navigate to reader page
        setLocation("/reader");
        toast.success(t('transformSuccess') || "変換が完了しました！");
      }
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
        <div className="container max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            {/* Left: Navigation */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/guide")}
                className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline ml-1.5">{t('howToUse')}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/faq")}
                className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="hidden sm:inline ml-1.5">FAQ</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/history")}
                className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              >
                <History className="h-4 w-4" />
                <span className="hidden sm:inline ml-1.5">履歴</span>
              </Button>
            </div>
            {/* Right: Share & Language */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const shareText = `${t('appTitle')} - ${t('tagline1')}\n\n13種類のスタイルでテキストを変換！\n\nhttps://slang-maker.manus.space`;
                  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
                  window.open(twitterUrl, '_blank');
                }}
                className="text-gray-700 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                title="Xでシェア"
              >
                <Twitter className="h-4 w-4" />
                <span className="hidden sm:inline ml-1.5">X</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const shareText = `${t('appTitle')} - ${t('tagline1')}\n\n13種類のスタイルでテキストを変換！\n\nhttps://slang-maker.manus.space`;
                  const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;
                  window.open(lineUrl, '_blank');
                }}
                className="text-gray-700 hover:text-green-500 hover:bg-green-50 transition-colors"
                title="LINEでシェア"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline ml-1.5">LINE</span>
              </Button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {/* Manus Campaign Badge */}
          <div className="mb-6 flex justify-center">
            <a
              href="https://manus.im/ja/campaign/free-tokens"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 animate-pulse"
            >
              <Zap className="w-4 h-4" />
              <span className="text-sm font-bold">Manus 1兆トークンキャンペーン応募中</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          
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
                <strong>{t('manusBuiltInLLM.title')}</strong>
              </p>
              <p className="text-xs text-blue-700">
                {t('manusBuiltInLLM.description')}
              </p>
            </div>

            {/* Sample Buttons */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {t('quickSamples')}
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  className="h-auto py-4 px-4 text-left flex flex-col items-start gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all"
                  onClick={() => {
                    setArticleText("日本の経済は2024年第3四半期に前期比0.9%の成長を記録しました。個人消費が堅調に推移し、企業の設備投資も増加しています。政府はこのトレンドが続くと予測していますが、国際情勢の不確実性がリスク要因となっています。");
                    setSelectedSkin("kansai_banter");
                    toast.success(t('sample.economy.toast'));
                  }}
                >
                  <span className="font-semibold text-purple-700">{t('sample.economy.title')}</span>
                  <span className="text-xs text-gray-600">{t('sample.economy.desc')}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 px-4 text-left flex flex-col items-start gap-2 hover:bg-pink-50 hover:border-pink-300 transition-all"
                  onClick={() => {
                    setArticleText("政府は新しい環境政策を発表しました。、2030年までに二酸化炭素排出量の46%削減を目指し、再生可能エネルギーの利用を拡大します。この政策には賛否両論があり、産業界からは懸念の声が上がっていますが、環境団体は歓迎しています。");
                    setSelectedSkin("gen_z_slang");
                    toast.success(t('sample.politics.toast'));
                  }}
                >
                  <span className="font-semibold text-pink-700">{t('sample.politics.title')}</span>
                  <span className="text-xs text-gray-600">{t('sample.politics.desc')}</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-4 px-4 text-left flex flex-col items-start gap-2 hover:bg-orange-50 hover:border-orange-300 transition-all"
                  onClick={() => {
                    setArticleText("今日、東京都内で大規模な交通渋滞が発生しました。朝の通勤ラッシュ時に電車の信号トラブルが発生し、約100万人の通勤・通学者に影響が出ました。鉄道会社は代替輸送を手配しましたが、多くの人が遅刻を余儀なくされました。");
                    setSelectedSkin("rap_style");
                    toast.success(t('sample.social.toast'));
                  }}
                >
                  <span className="font-semibold text-orange-700">{t('sample.social.title')}</span>
                  <span className="text-xs text-gray-600">{t('sample.social.desc')}</span>
                </Button>
              </div>
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

            {/* Compare Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3">
                <Columns className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-semibold text-gray-800">スキン比較モード</p>
                  <p className="text-xs text-gray-600">同じテキストを2つのスキンで同時変換</p>
                </div>
              </div>
              <Button
                variant={compareMode ? "default" : "outline"}
                size="sm"
                onClick={() => setCompareMode(!compareMode)}
                className={compareMode ? "bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600" : ""}
              >
                {compareMode ? "ON" : "OFF"}
              </Button>
            </div>

            {/* Custom Skin Section */}
            {customSkin && (
              <div className="space-y-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-2 border-amber-300">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-semibold text-amber-900">カスタムスキン</Label>
                    <p className="text-sm text-amber-800 mt-1">{customSkin.name}</p>
                    {customSkin.description && (
                      <p className="text-xs text-amber-700 mt-1">{customSkin.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCreateModal(true)}
                      className="border-amber-300 hover:bg-amber-100"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDeleteCustomSkin}
                      className="border-red-300 hover:bg-red-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSkin("custom")}
                  disabled={isLoading}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                    selectedSkin === "custom"
                      ? 'border-amber-500 bg-amber-100 shadow-md ring-2 ring-amber-300'
                      : 'border-amber-300 hover:border-amber-400 bg-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="font-semibold text-sm mb-1">✨ {customSkin.name}</div>
                  <div className="text-xs text-gray-600">
                    {customSkin.description || "カスタムプロンプト"}
                  </div>
                </button>
              </div>
            )}

            {/* Create Custom Skin Button */}
            {!customSkin && (
              <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border-2 border-dashed border-amber-300">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  カスタムスキンを作成
                </Button>
                <p className="text-xs text-amber-700 mt-2 text-center">
                  独自のプロンプトで、あなただけのスキンを作成できます
                </p>
              </div>
            )}

            {/* Skin Selection */}
            <div className="space-y-4">
              <Label className="text-lg font-semibold">
                {compareMode ? "スキン1を選択" : (t('skinStyle') || "スタイル選択")}
              </Label>
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

            {/* Skin 2 Selection (Compare Mode Only) */}
            {compareMode && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">スキン2を選択</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(SKINS).map(([key, skin]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedSkin2(key)}
                      disabled={isLoading}
                      className={`p-4 border-2 rounded-xl text-left transition-all hover:shadow-lg transform hover:scale-105 ${
                        selectedSkin2 === key
                          ? 'border-pink-500 bg-pink-50 shadow-md ring-2 ring-pink-200'
                          : 'border-gray-200 hover:border-pink-300'
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
            )}

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

        {/* Global Stats Section */}
        {stats && (
          <Card className="mt-8 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                コミュニティ統計
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Total Transformations */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-full">
                      <Sparkles className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">総変換数</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {stats.totalTransformations.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-pink-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-pink-100 rounded-full">
                      <Zap className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">24時間以内</p>
                      <p className="text-2xl font-bold text-pink-700">
                        {stats.recentTransformations.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Popular Skins */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 rounded-full">
                      <Users className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 mb-2">24時間人気スキン</p>
                      {stats.popularSkins.slice(0, 3).map((item, index) => {
                        const skinData = Object.values(SKINS).find((s: any) => s.key === item.skin);
                        return (
                          <div key={item.skin} className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-700">
                              {index + 1}. {skinData?.name || item.skin}
                            </span>
                            <span className="text-orange-600 font-semibold">{item.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Create Custom Skin Modal */}
        <CreateCustomSkinModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          onSave={handleCustomSkinSaved}
          initialSkin={customSkin || undefined}
        />
      </div>
      
      {/* Footer */}
      <footer className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 text-white py-12 mt-16">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column: Creator & Contact */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">{t('footer.creatorInfo') || '製作者・寄付情報'}</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">{t('footer.creator') || '製作者'}:</span>{' '}
                  <a href="https://twitter.com/kojima920" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                    @kojima920
                  </a>
                </p>
                <p>
                  <span className="font-semibold">{t('footer.contact') || '問い合わせ'}:</span>{' '}
                  <a href="mailto:mk19830920@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                    mk19830920@gmail.com
                  </a>
                </p>
                <p>
                  <span className="font-semibold">{t('footer.donation') || '寄付先'}:</span>{' '}
                  <span className="text-yellow-300">PayPayID: kojima1459</span>
                </p>
                <p className="text-xs text-gray-300 mt-2">
                  ★{t('footer.donationMessage') || '寄付頂けると励みになる為、より良いアプリ開発の為にご寄付を'}★
                </p>
              </div>
            </div>
            
            {/* Right Column: About */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold mb-4">{t('footer.about') || 'このサイトについて'}</h3>
              <p className="text-sm text-gray-300">
                {t('footer.description') || 'AIスラングメーカーは、13種類のスタイルでテキストを変換できる無料ツールです。日本語のスラングや言い回しを学ぶこともできます。'}
              </p>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-gray-600 pt-6 mt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-300">
              <p>
                © 2025 {t('appTitle') || 'AIスラングメーカー'}. All rights reserved.
              </p>
              <p>
                Made with MasahideKojima and Manus!
              </p>
            </div>
            <div className="text-center mt-4">
              <p className="text-xs text-gray-500">
                {t('footer.releaseDate')}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
