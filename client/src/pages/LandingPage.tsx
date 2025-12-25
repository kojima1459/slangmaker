import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { AdBanner } from '@/components/AdBanner';
import { SEO } from '@/components/SEO';
import { ArrowRight, Wand2, Users, LayoutTemplate, Zap, MessageSquare } from 'lucide-react';
import { SKINS } from '../../../shared/skins';

export default function LandingPage() {
  const [, setLocation] = useLocation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: '多様なキャラクター',
      description: '関西弁、ギャル、武士、ツンデレなど、15種類以上の個性的な人格になりきれます。'
    },
    {
      icon: <LayoutTemplate className="h-6 w-6 text-pink-600" />,
      title: '画像生成 & シェア',
      description: '変換結果をSNS映えする画像として保存。4種類のデザインテンプレートから選べます。'
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-orange-600" />,
      title: 'コミュニティ機能',
      description: '面白い変換結果をギャラリーに投稿。みんなの投稿を見て楽しむこともできます。'
    }
  ];

  return (
    <>
      <SEO 
        title="AIスラングメーカー - 一瞬で、違う自分に"
        description="文章を一瞬で関西弁、ギャル語、武士語などに変換する無料AIツール。SNSでの発信や友達との会話を盛り上げよう。"
        path="/lp"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        {/* Navigation */}
        <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AIスラングメーカー
          </div>
          <Button onClick={() => setLocation('/')} variant="ghost">
            ログイン不要で使う
          </Button>
        </nav>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
          <motion.div 
            className="text-center mb-20"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="inline-flex items-center bg-white/50 backdrop-blur border border-purple-100 rounded-full px-4 py-1.5 mb-8 text-sm font-medium text-purple-800 shadow-sm">
              <Zap className="h-4 w-4 mr-2 text-yellow-500 fill-yellow-500" />
              コミュニティ機能リリース！
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-gray-900 leading-tight">
              一瞬で、<br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                違う自分
              </span>
              になる。
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              いつもの言葉を入力するだけ。AIが文脈を理解し、
              関西人にも、ギャルにも、武士にも変身させます。
              もちろん、完全無料です。
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setLocation('/')}
                className="text-lg px-8 py-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
              >
                <Wand2 className="mr-2 h-5 w-5" />
                今すぐ無料で試す
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setLocation('/gallery')}
                className="text-lg px-8 py-6 rounded-full border-2 hover:bg-gray-50"
              >
                みんなの投稿を見る
              </Button>
            </motion.div>
          </motion.div>

          {/* Feature Showcase */}
          <div className="grid md:grid-cols-3 gap-8 mb-32">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <Card className="h-full border-none shadow-xl shadow-purple-900/5 hover:-translate-y-1 transition-transform duration-300">
                  <CardContent className="p-8">
                    <div className="bg-purple-50 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Transformation Demo */}
          <motion.div 
            className="mb-32 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-12">劇的ビフォーアフター</h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
              <Card className="bg-white border-2 border-gray-100">
                <CardContent className="p-6">
                  <div className="text-sm text-gray-400 font-bold mb-2">BEFORE</div>
                  <p className="text-lg text-gray-800">
                    明日の会議の資料ですが、まだ完成しておりません。申し訳ございませんが、もう少しお時間をいただけますでしょうか。
                  </p>
                </CardContent>
              </Card>
              <div className="relative">
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 hidden md:block">
                  <ArrowRight className="text-purple-300 h-8 w-8" />
                </div>
                <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-100">
                  <CardContent className="p-6">
                    <div className="text-sm text-orange-400 font-bold mb-2">AFTER: 関西ノリ</div>
                    <p className="text-lg text-gray-800 font-medium">
                      あしたの会議のアレやけどな、正直まだ出来てへんねん！すんまへんけど、もうちょい待ってもらえまっしゃろか？ええ感じにするさかい！
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>

          {/* Ad Banner */}
          <div className="flex justify-center mb-20">
            <AdBanner />
          </div>

          {/* Final CTA */}
          <motion.div 
            className="bg-gray-900 rounded-3xl p-12 text-center text-white relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-pink-900 opacity-50" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                言葉遊びを始めよう
              </h2>
              <p className="text-gray-300 mb-10 text-lg">
                登録もインストールも不要。
                ブラウザですぐに楽しめます。
              </p>
              <Button 
                size="lg" 
                onClick={() => setLocation('/')}
                className="bg-white text-purple-900 hover:bg-gray-100 text-lg px-10 py-6 rounded-full font-bold"
              >
                無料でスタート
              </Button>
            </div>
          </motion.div>
        </main>

        <footer className="text-center py-10 text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} AI Slang Maker. Built with Manus.</p>
        </footer>
      </div>
    </>
  );
}
