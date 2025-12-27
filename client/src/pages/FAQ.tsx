import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";

export default function FAQ() {
  const [, setLocation] = useLocation();
  const { t } = useTranslation();

  const faqs = [
    // ... (omitting faqs array for brevity as I'm replacing lines 5-9 and then after that)
    {
      question: t('faq.q1') || "APIキーは必要ですか？",
      answer: t('faq.a1') || "いいえ、APIキーは不要です。Manus Built-in LLM APIを使用しているため、サーバー側で自動的に処理されます。",
    },
    {
      question: t('faq.q2') || "どのくらいの長さのテキストを変換できますか？",
      answer: t('faq.a2') || "最大10,000文字まで変換できます。ただし、最適な結果を得るためには5,000文字以内を推奨しています。",
    },
    {
      question: t('faq.q3') || "変換結果をシェアできますか？",
      answer: t('faq.a3') || "はい、変換後に自動的に短縮URLが生成され、クリップボードにコピーされます。TwitterやLINEで簡単にシェアできます。",
    },
    {
      question: t('faq.q4') || "画像としてダウンロードできますか？",
      answer: t('faq.a4') || "はい、変換結果をPNGまたはJPEG形式の画像としてダウンロードできます。SNSでのシェアに便利です。",
    },
    {
      question: t('faq.q5') || "カスタムスキンとは何ですか？",
      answer: t('faq.a5') || "自分だけのオリジナルの文体を作成できる機能です。トーン、スタイル、特徴を指定して、独自のスキンを作成できます。",
    },
    {
      question: t('faq.q6') || "スキン比較モードとは何ですか？",
      answer: t('faq.a6') || "同じテキストを2つの異なるスキンで同時に変換できる機能です。スキンの違いを比較したい時に便利です。",
    },
    {
      question: t('faq.q7') || "詳細設定の「温度」とは何ですか？",
      answer: t('faq.a7') || "AIの創造性を制御するパラメータです。値が高いほどランダムで創造的な変換になり、低いほど安定した変換になります。",
    },
    {
      question: t('faq.q8') || "変換結果が期待と違う場合はどうすればいいですか？",
      answer: t('faq.a8') || "詳細設定で温度やTop-pを調整してみてください。また、同じテキストでも何度か変換すると異なる結果が得られます。",
    },
    {
      question: t('faq.q9') || "履歴機能はありますか？",
      answer: t('faq.a9') || "はい、過去の変換結果は自動的に保存され、ヘッダーの「履歴」ボタンからアクセスできます。",
    },
    {
      question: t('faq.q10') || "多言語対応していますか？",
      answer: t('faq.a10') || "はい、日本語、英語、中国語に対応しています。ヘッダーの言語切り替えボタンから変更できます。",
    },
    {
      question: t('faq.q11') || "変換回数に制限はありますか？",
      answer: t('faq.a11') || "現在、変換回数に制限はありません。自由にお使いいただけます。",
    },
    {
      question: t('faq.q12') || "モバイルでも使えますか？",
      answer: t('faq.a12') || "はい、レスポンシブデザインに対応しているため、スマートフォンやタブレットでも快適に使用できます。",
    },
    {
      question: "ギャラリー機能とは何ですか？",
      answer: "ギャラリーは、他のユーザーが投稿した変換結果を閲覧できるコミュニティ機能です。面白い変換結果を発見したり、自分の作品を投稿して共有することができます。",
    },
    {
      question: "ギャラリーに投稿するにはどうすればいいですか？",
      answer: "テキストを変換した後、結果画面で「ギャラリーへ投稿」ボタンをクリックしてください。ニックネームを入力するだけで簡単に投稿できます。",
    },
    {
      question: "利用可能なスキンは何種類ありますか？",
      answer: "現在15種類のスキン（文体）を用意しています。関西ノリ風、おじさん構文風、Z世代スラング風、ギャル語風、学術論文風など、様々なスタイルでテキストを楽しめます。",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white">
      <SEO title={t('faq.title')} path="/faq" />
      {/* Ambient Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-black/40 backdrop-blur-md border-b border-white/5 z-50">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span>{t('backToTop') || 'トップに戻る'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 container max-w-5xl mx-auto px-4 pt-24 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HelpCircle className="w-12 h-12 text-purple-400" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-500 bg-clip-text text-transparent">
              {t('faq.title') || 'よくある質問'}
            </h1>
          </div>
          <p className="text-lg text-gray-400">
            {t('faq.subtitle') || 'AIスラングメーカーに関するよくある質問と回答'}
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="bg-[#1a1a23]/80 backdrop-blur-xl border border-white/10 hover:border-purple-500/30 transition-all">
              <CardHeader className="bg-white/5">
                <CardTitle className="text-xl flex items-start gap-3 text-white">
                  <span className="flex-shrink-0 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    Q{index + 1}
                  </span>
                  <span className="flex-1">{faq.question}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    A
                  </span>
                  <p className="flex-1 text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Section */}
        <Card className="mt-12 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-white">
              {t('faq.contactTitle') || 'その他のご質問'}
            </CardTitle>
            <CardDescription className="text-center text-base text-gray-400">
              {t('faq.contactDesc') || 'FAQに記載されていない質問がある場合は、お気軽にお問い合わせください'}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg mb-4 text-white">
              <strong>{t('footer.contact') || '問い合わせ'}:</strong>{' '}
              <a href="mailto:mk19830920@gmail.com" className="text-purple-400 hover:text-purple-300 transition-colors">
                mk19830920@gmail.com
              </a>
            </p>
            <p className="text-sm text-gray-500">
              {t('faq.responseTime') || '通常、24時間以内に返信いたします'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
