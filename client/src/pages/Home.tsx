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
import { Loader2, Sparkles, History as HistoryIcon, Settings as SettingsIcon, ChevronDown, BookOpen, Star } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { Tutorial } from "@/components/Tutorial";

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [articleText, setArticleText] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedSkin, setSelectedSkin] = useState("kansai_banter");
  const [temperature, setTemperature] = useState(1.3);
  const [topP, setTopP] = useState(0.9);
  const [maxTokens, setMaxTokens] = useState(1500);
  const [lengthRatio, setLengthRatio] = useState(1.0);
  const [addCore3, setAddCore3] = useState(false);
  const [addGlossary, setAddGlossary] = useState(false);
  const [addQuestions, setAddQuestions] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  const transformMutation = trpc.transform.useMutation();
  const { data: favoritesData } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const addFavoriteMutation = trpc.favorites.add.useMutation();
  const removeFavoriteMutation = trpc.favorites.remove.useMutation();
  const utils = trpc.useUtils();

  const favoriteSkinKeys = favoritesData?.favorites.map(f => f.skinKey) || [];
  const { data: settings } = trpc.settings.get.useQuery(undefined, {
    enabled: isAuthenticated,
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
      if (settings.encryptedApiKey) {
        setApiKey(settings.encryptedApiKey);
      }
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

    // sourceUrl is now optional

    if (!apiKey) {
      toast.error(t('apiKeyRequired'));
      return;
    }

    try {
      // Create article object from user input
      const article = {
        title: "記事",
        site: "言い換えメーカー",
        url: "",
        contentText: articleText.trim(),
        lang: "ja", // Default to Japanese
      };

      // Transform with selected skin
      toast.info("変換中...");
      const result = await transformMutation.mutateAsync({
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

  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-4xl py-12">
        {/* Top Navigation */}
        <div className="flex justify-between items-center mb-8">
          <a href="/about" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors">
            <BookOpen className="w-5 h-5" />
            <span className="font-medium">{t('learnJapaneseSlang')}</span>
          </a>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            {isAuthenticated && (
              <>
                <Button variant="outline" size="sm" onClick={() => setLocation("/history")}>
                  <HistoryIcon className="w-4 h-4 mr-2" />
                  {t('history')}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setLocation("/settings")}>
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  {t('settings')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {t('appTitle')}
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            {t('appSubtitle')}
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{t('transformArticle')}</CardTitle>
            <CardDescription>
              {t('pasteArticle')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Article Text Input */}
            <div className="space-y-2">
              <Label htmlFor="articleText">{t('articleText')} *</Label>
              <textarea
                id="articleText"
                className="w-full min-h-[200px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder={t('articlePlaceholder')}
                value={articleText}
                onChange={(e) => setArticleText(e.target.value)}
                disabled={isLoading}
                maxLength={10000}
              />
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">
                  {t('characterWarning')}
                </p>
                <p className={`text-xs ${
                  articleText.length > 10000 ? 'text-red-600 font-bold' :
                  articleText.length > 5000 ? 'text-orange-600 font-semibold' :
                  'text-gray-500'
                }`}>
                  {t('characterCount', { count: articleText.length })}
                  {articleText.length > 5000 && articleText.length <= 10000 && ` (${t('recommended5000')})`}
                  {articleText.length > 10000 && ` (${t('limitExceeded')})`}
                </p>
              </div>
            </div>



            {/* API Key Input */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">{t('geminiApiKey')} *</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={t('geminiApiKeyPlaceholder')}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                {t('geminiApiKeyNote')}
              </p>
            </div>

            {/* Skin Selection */}
            <div className="space-y-3">
              <Label>{t('skinStyle')}</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(SKINS).map(([key, skin]) => {
                  const isFavorite = favoriteSkinKeys.includes(key);
                  return (
                    <div key={key} className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectedSkin(key)}
                        disabled={isLoading}
                        className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                          selectedSkin === key
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 hover:border-purple-300'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <div className="font-semibold text-sm mb-1">{t(`skin.${key}`)}</div>
                        <div className="text-xs text-gray-600 line-clamp-2">{skin.description}</div>
                      </button>
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
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors disabled:opacity-50"
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

            {/* Advanced Settings */}
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span>{t('advancedSettings')}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-4">
                {/* Temperature */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>{t('temperature')}</Label>
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
                    <Label>{t('maxOutputTokens')}</Label>
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
                  {t('transforming')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('transform')}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="flex justify-center gap-4 mt-8">
          <Button variant="ghost" onClick={() => setLocation("/guide")}>
            <BookOpen className="mr-2 h-4 w-4" />
            {t('guide')}
          </Button>
          <Button variant="ghost" onClick={() => setLocation("/history")}>
            <HistoryIcon className="mr-2 h-4 w-4" />
            {t('history')}
          </Button>
          <Button variant="ghost" onClick={() => setLocation("/settings")}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            {t('settings')}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="max-w-2xl mx-auto space-y-4">
            {/* App Description */}
            <p className="text-center text-sm text-gray-500">
              記事を様々な文体で楽しむPWAアプリ
            </p>
            
            {/* Creator & Contact Info */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="font-medium">製作者:</span>
                <a 
                  href="https://x.com/kojima920" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-700 hover:underline"
                >
                  @kojima920
                </a>
              </div>
              <span className="hidden sm:inline text-gray-300">|</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">問い合わせ:</span>
                <a 
                  href="mailto:mk19830920@gmail.com"
                  className="text-purple-600 hover:text-purple-700 hover:underline"
                >
                  mk19830920@gmail.com
                </a>
              </div>
            </div>
            
            {/* Donation Info */}
            <div className="flex justify-center items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">寄付先:</span>
              <span className="bg-purple-50 px-3 py-1 rounded-md text-purple-700 font-mono">
                PayPay ID: kojima1459
              </span>
            </div>
            
            {/* Copyright */}
            <p className="text-center text-xs text-gray-400 pt-4">
              © 2025 言い換えメーカー. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Tutorial */}
      {showTutorial && <Tutorial onClose={handleCloseTutorial} />}
    </div>
  );
}
