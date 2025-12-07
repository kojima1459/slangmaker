import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, BookOpen, Languages } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  const features = [
    {
      icon: <Languages className="h-12 w-12 text-purple-500" />,
      title: t('multipleStyles'),
      description: t('multipleStylesDesc'),
    },
    {
      icon: <Sparkles className="h-12 w-12 text-orange-500" />,
      title: t('funLearning'),
      description: t('funLearningDesc'),
    },
    {
      icon: <BookOpen className="h-12 w-12 text-blue-500" />,
      title: t('realExamples'),
      description: t('realExamplesDesc'),
    },
  ];

  const examples = [
    {
      original: '患者数が増加しています',
      styles: [
        { name: t('skin.kansai_banter'), text: '患者数がめっちゃ爆増しとるやん！' },
        { name: t('skin.gen_z_slang'), text: '患者数がマジでヤバいことになってる' },
        { name: t('skin.academic_paper'), text: '患者数の増加傾向が観察される' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* ヒーローセクション */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('learnJapaneseSlang')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('appSubtitle')}
          </p>
        </div>

        {/* 機能紹介 */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 例文セクション */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">{t('realExamples')}</h2>
          {examples.map((example, index) => (
            <Card key={index} className="mb-8">
              <CardContent className="p-8">
                <div className="mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Original:</p>
                  <p className="text-lg font-medium">{example.original}</p>
                </div>
                <div className="space-y-4">
                  {example.styles.map((style, styleIndex) => (
                    <div key={styleIndex} className="bg-purple-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
                        {style.name}
                      </p>
                      <p className="text-lg">{style.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-lg transition-shadow"
          >
            {t('transform')} →
          </a>
        </div>
      </div>
    </div>
  );
}
