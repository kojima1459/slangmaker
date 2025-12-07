import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Sparkles, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { SKINS } from "../../../shared/skins";
import { useTranslation } from "react-i18next";

export default function Guide() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-4xl py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('guideBack')}
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <h1 className="text-3xl font-bold">{t('guideTitle')}</h1>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              {t('guideWhatIsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {t('guideWhatIsDesc1')}
            </p>
            <p className="text-gray-700">
              {t('guideWhatIsDesc2')}
            </p>
          </CardContent>
        </Card>

        {/* How to Use */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              {t('guideHowToUseTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t('guideStep1Title')}</h3>
              <p className="text-gray-700">
                {t('guideStep1Desc')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t('guideStep2Title')}</h3>
              <p className="text-gray-700">
                {t('guideStep2Desc')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t('guideStep3Title')}</h3>
              <p className="text-gray-700">
                {t('guideStep3Desc')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t('guideStep4Title')}</h3>
              <p className="text-gray-700">
                {t('guideStep4Desc')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t('guideStep5Title')}</h3>
              <p className="text-gray-700">
                {t('guideStep5Desc')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Skins Explanation */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>{t('guideSkinsTitle')}</CardTitle>
            <CardDescription>
              {t('guideSkinsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(SKINS).map(([key, skin]) => (
              <div key={key} className="space-y-2">
                <h3 className="font-semibold text-lg text-purple-700">{t(`skin.${key}`)}</h3>
                <p className="text-gray-700">{t(`skin.${key}.desc`)}</p>
                <Separator className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>{t('guideTipsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t('guideTip1Title')}</h3>
              <p className="text-gray-700">
                {t('guideTip1Desc')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t('guideTip2Title')}</h3>
              <p className="text-gray-700">
                {t('guideTip2Desc')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">{t('guideTip3Title')}</h3>
              <p className="text-gray-700">
                {t('guideTip3Desc')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
