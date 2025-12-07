import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { SKINS } from "../../../shared/skins";
import { getLoginUrl } from "@/const";
import { useTranslation } from "react-i18next";

export default function Settings() {
  const { t } = useTranslation();
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
            <CardTitle>{t('loginRequired')}</CardTitle>
            <CardDescription>
              {t('loginToSaveSettings')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.href = getLoginUrl()} className="w-full">
              {t('login')}
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
      toast.success(t('settingsSaved'));
    } catch (error) {
      toast.error(t('settingsSaveFailed'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-2xl py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('back')}
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{t('settings')}</h1>
            <p className="text-sm text-gray-600">{t('manageSettings')}</p>
          </div>
        </div>

        {/* Settings Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('basicSettings')}</CardTitle>
            <CardDescription>
              {t('basicSettingsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* API Key */}
            <div className="space-y-2">
              <Label htmlFor="apiKey">{t('geminiApiKey')}</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={t('geminiApiKeyPlaceholder')}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                {t('apiKeyEncrypted')}
              </p>
            </div>

            {/* Default Skin */}
            <div className="space-y-2">
              <Label htmlFor="defaultSkin">{t('defaultSkin')}</Label>
              <Select value={defaultSkin} onValueChange={setDefaultSkin}>
                <SelectTrigger id="defaultSkin">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(SKINS).map((skin) => (
                    <SelectItem key={skin.key} value={skin.key}>
                      {t(`skin.${skin.key}`)}
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
              {updateMutation.isPending ? t('saving') : t('saveSettings')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
