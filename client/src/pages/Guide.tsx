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
    <div className="min-h-screen bg-[#0f0f13] text-white">
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 container max-w-4xl py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")} className="text-gray-300 hover:text-white hover:bg-white/5">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('guideBack')}
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">{t('guideTitle')}</h1>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8 bg-[#1a1a23]/80 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {t('guideWhatIsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              {t('guideWhatIsDesc1')}
            </p>
            <p className="text-gray-300">
              {t('guideWhatIsDesc2')}
            </p>
          </CardContent>
        </Card>

        {/* How to Use */}
        <Card className="mb-8 bg-[#1a1a23]/80 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-blue-400" />
              {t('guideHowToUseTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-white">{t('guideStep1Title')}</h3>
              <p className="text-gray-300">
                {t('guideStep1Desc')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-white">{t('guideStep2Title')}</h3>
              <p className="text-gray-300">
                {t('guideStep2Desc')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-white">{t('guideStep3Title')}</h3>
              <p className="text-gray-300">
                {t('guideStep3Desc')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-white">{t('guideStep4Title')}</h3>
              <p className="text-gray-300">
                {t('guideStep4Desc')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-white">{t('guideStep5Title')}</h3>
              <p className="text-gray-300">
                {t('guideStep5Desc')}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Skins Explanation */}
        <Card className="mb-8 bg-[#1a1a23]/80 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">{t('guideSkinsTitle')}</CardTitle>
            <CardDescription className="text-gray-400">
              {t('guideSkinsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(SKINS).map(([key, skin]) => (
              <div key={key} className="space-y-2">
                <h3 className="font-semibold text-lg text-purple-400">{t(`skin.${key}`)}</h3>
                <p className="text-gray-300">{t(`skin.${key}.desc`)}</p>
                <Separator className="mt-4 bg-white/10" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-[#1a1a23]/80 backdrop-blur-xl border border-white/10">
          <CardHeader>
            <CardTitle className="text-white">{t('guideTipsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-white">{t('guideTip1Title')}</h3>
              <p className="text-gray-300">
                {t('guideTip1Desc')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-white">{t('guideTip2Title')}</h3>
              <p className="text-gray-300">
                {t('guideTip2Desc')}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg text-white">{t('guideTip3Title')}</h3>
              <p className="text-gray-300">
                {t('guideTip3Desc')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
