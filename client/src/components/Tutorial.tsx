import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  animation: string;
}

interface TutorialProps {
  onClose: () => void;
}

export function Tutorial({ onClose }: TutorialProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TutorialStep[] = [
    {
      title: t('tutorial.step1.title', '記事を貼り付け'),
      description: t('tutorial.step1.description', 'ニュース記事の本文をコピーして、テキストエリアに貼り付けます'),
      icon: '📋',
      animation: 'paste',
    },
    {
      title: t('tutorial.step2.title', 'スキンを選択'),
      description: t('tutorial.step2.description', 'お好みのスキン（文体）を選択します。関西ノリ風、おじさん構文風など13種類から選べます'),
      icon: '🎨',
      animation: 'select',
    },
    {
      title: t('tutorial.step3.title', 'APIキーを入力'),
      description: t('tutorial.step3.description', 'Gemini APIキーを入力します。APIキーはローカルに保存され、サーバーには送信されません'),
      icon: '🔑',
      animation: 'key',
    },
    {
      title: t('tutorial.step4.title', '変換ボタンをクリック'),
      description: t('tutorial.step4.description', '「変換する」ボタンをクリックすると、AIが記事を選択したスキンで書き直します'),
      icon: '✨',
      animation: 'transform',
    },
    {
      title: t('tutorial.step5.title', '結果を楽しむ'),
      description: t('tutorial.step5.description', '変換された記事を読んで、TwitterやLINEで共有できます'),
      icon: '🎉',
      animation: 'result',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full">
        <CardContent className="p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Step indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-purple-600'
                    : index < currentStep
                    ? 'w-2 bg-purple-300'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            {/* Animated icon */}
            <div className={`text-8xl mb-6 tutorial-icon tutorial-${step.animation}`}>
              {step.icon}
            </div>

            <h2 className="text-3xl font-bold mb-4">{step.title}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">{step.description}</p>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('tutorial.prev', '前へ')}
            </Button>

            <div className="text-sm text-gray-500">
              {currentStep + 1} / {steps.length}
            </div>

            <Button onClick={handleNext} className="gap-2">
              {currentStep === steps.length - 1
                ? t('tutorial.start', '始める')
                : t('tutorial.next', '次へ')}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Skip button */}
          <div className="text-center mt-4">
            <button
              onClick={onClose}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {t('tutorial.skip', 'スキップ')}
            </button>
          </div>
        </CardContent>
      </Card>

      <style>{`
        .tutorial-icon {
          animation: fadeIn 0.5s ease-in-out;
        }

        .tutorial-paste {
          animation: paste 2s ease-in-out infinite;
        }

        .tutorial-select {
          animation: select 2s ease-in-out infinite;
        }

        .tutorial-key {
          animation: key 2s ease-in-out infinite;
        }

        .tutorial-transform {
          animation: transform 2s ease-in-out infinite;
        }

        .tutorial-result {
          animation: result 2s ease-in-out infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes paste {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes select {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-5deg);
          }
          75% {
            transform: rotate(5deg);
          }
        }

        @keyframes key {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @keyframes transform {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(360deg) scale(1.2);
          }
        }

        @keyframes result {
          0%, 100% {
            transform: scale(1);
          }
          25% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1);
          }
          75% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
