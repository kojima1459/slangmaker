import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import { AdBanner } from '@/components/AdBanner';
import { SEO } from '@/components/SEO';
import { 
  Wand2, Zap, ArrowRight, Sparkles, 
  MessageCircle, Share2, Layers, Crown,
  CheckCircle2, TrendingUp
} from 'lucide-react';

export default function LandingPage() {
  const [, setLocation] = useLocation();
  const [demoStep, setDemoStep] = useState(0);

  // Labor Illusion: AI processing simulation cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const demoStates = [
    { text: "入力: 「明日の会議、遅刻しそうです。」", status: "待機中...", color: "text-gray-400" },
    { text: "AIが文脈を解析中...", status: "Analyzing...", color: "text-blue-400" },
    { text: "関西弁フィルターを適用中...", status: "Processing...", color: "text-purple-400" },
    { text: "出力: 「明日の会議やけど、ちょい遅れそうやわ！堪忍な！」", status: "完了", color: "text-green-400" },
  ];

  return (
    <>
      <SEO 
        title="AIスラングメーカー - 言葉を、アートに。"
        description="最先端AIがあなたの言葉を劇的に変換。関西弁、武士、ギャル... 15種類以上の人格を一瞬で憑依させる没入型変換ツール。"
        path="/lp"
      />
      
      <div className="min-h-screen bg-[#0f0f13] text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">
        
        {/* Background Gradients (Aesthetic-Usability) */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-[100px] animate-pulse delay-1000" />
        </div>

        {/* Navigation (Familiarity Bias) */}
        <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto backdrop-blur-md bg-black/20 sticky top-0 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SlangMaker<span className="text-purple-500">.AI</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-xs font-mono text-gray-500">
              <span className="w-2 h-2 inline-block bg-green-500 rounded-full mr-2 animate-pulse"></span>
              SYSTEM ONLINE
            </span>
            <Button 
              onClick={() => setLocation('/')} 
              variant="outline" 
              className="rounded-full border-white/20 hover:bg-white/10 text-white hover:text-white transition-all duration-300"
            >
              ログイン
            </Button>
            <Button 
              onClick={() => setLocation('/')} 
              className="rounded-full bg-white text-black hover:bg-gray-200 transition-all duration-300 font-bold"
            >
              無料で開始
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Copy (Visual Hierarchy) */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-6">
                <Crown className="w-3 h-3 mr-2" />
                No.1 エンターテイメントAIツール
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                その言葉に、<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-500 animate-gradient-x">
                  魔法をかける。
                </span>
              </h1>
              <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-lg">
                ただのテキスト変換ではありません。<br />
                文脈、感情、ニュアンスをAIが理解し、
                15種類以上の人格として再構築します。
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => setLocation('/')}
                  className="h-14 px-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25 transition-all text-lg font-bold"
                >
                  <Wand2 className="mr-2 h-5 w-5" />
                  今すぐ変換する
                </Button>
                <div className="flex items-center gap-4 px-6 text-sm text-gray-500 font-mono">
                  <div className="flex -space-x-3">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0f0f13] bg-gray-700" />
                    ))}
                  </div>
                  <span>50k+ Users</span>
                </div>
              </div>
            </motion.div>

            {/* Demo (Labor Illusion) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl blur-3xl opacity-20" />
              <div className="relative bg-[#1a1a23]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                    <div className="w-3 h-3 rounded-full bg-green-500/20" />
                  </div>
                  <div className="text-xs font-mono text-gray-500">AI CORE: ACTIVE</div>
                </div>

                <div className="space-y-6 font-mono text-sm">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={demoStep}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="min-h-[120px]"
                    >
                      <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>PROCESS: {demoStep + 1}/4</span>
                        <span>{demoStates[demoStep].status}</span>
                      </div>
                      <div className={`text-lg md:text-xl font-bold ${demoStates[demoStep].color} typing-cursor`}>
                        {demoStates[demoStep].text}
                      </div>
                      
                      {/* Fake Progress Bar */}
                      <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-purple-500"
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 3, ease: "linear" }}
                        />
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Social Proof & Features (Bento Grid) */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="mb-12 flex items-center justify-between border-b border-white/10 pb-6">
            <h2 className="text-2xl font-bold">機能ハイライト</h2>
            <span className="text-sm text-gray-500">Discover Features</span>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Feature */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 bg-gradient-to-br from-purple-900/20 to-[#1a1a23] border border-white/10 rounded-3xl p-8 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all" />
              <Layers className="w-10 h-10 text-purple-400 mb-6" />
              <h3 className="text-2xl font-bold mb-4">15+ Distinct Personas</h3>
              <p className="text-gray-400 leading-relaxed max-w-md">
                関西弁、武士、ギャル、ツンデレ、AIアシスタント...<br />
                単純な置換ではなく、文脈に合わせた自然な口調変換を実現。<br />
                あなたの言葉が、全く新しい響きを持ちます。
              </p>
            </motion.div>

            {/* Sub Feature 1 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-[#1a1a23] border border-white/10 rounded-3xl p-8 hover:border-purple-500/30 transition-all"
            >
              <Share2 className="w-8 h-8 text-blue-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Instant Share</h3>
              <p className="text-sm text-gray-400">
                変換結果は美しい画像カードとして保存可能。
                SNSで一際目立つ投稿を、一瞬で作成できます。
              </p>
            </motion.div>

            {/* Sub Feature 2 */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-[#1a1a23] border border-white/10 rounded-3xl p-8 hover:border-pink-500/30 transition-all"
            >
              <TrendingUp className="w-8 h-8 text-pink-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Community</h3>
              <p className="text-sm text-gray-400">
                作成したスラングをギャラリーに公開。
                評価された投稿は「人気」タブでフィーチャーされます。
              </p>
            </motion.div>

            {/* Stat Card (Social Proof) */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="md:col-span-2 md:col-start-2 bg-gradient-to-r from-blue-900/20 to-[#1a1a23] border border-white/10 rounded-3xl p-8 flex items-center justify-between relative overflow-hidden"
            >
               <div className="absolute inset-0 bg-grid-white/[0.02]" />
               <div className="relative z-10">
                 <h3 className="text-3xl font-bold text-white mb-1">99.9%</h3>
                 <p className="text-sm text-gray-400">User Satisfaction</p>
               </div>
               <div className="relative z-10 text-right">
                 <div className="text-3xl font-bold text-white mb-1">0.4s</div>
                 <p className="text-sm text-gray-400">Average Latency (Doherty Threshold)</p>
               </div>
               <div className="relative z-10 text-right hidden sm:block">
                 <div className="text-3xl font-bold text-white mb-1">Free</div>
                 <p className="text-sm text-gray-400">No Registration Required</p>
               </div>
            </motion.div>
          </div>
        </section>
        
        {/* Ad Banner Area */}
        <div className="max-w-xl mx-auto my-20">
          <div className="text-center text-xs text-gray-600 mb-2">SPONSORED</div>
          <AdBanner />
        </div>

        {/* Peak-End Rule: Final CTA */}
        <section className="relative py-32 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/20 pointer-events-none" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto px-6">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">
              Ready to <span className="text-purple-400">Transform?</span>
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              登録不要。インストール不要。<br />
              今すぐ、あなたの言葉を解放しましょう。
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                size="lg" 
                onClick={() => setLocation('/')}
                className="h-16 px-12 rounded-full bg-white text-black text-xl font-bold hover:bg-gray-100 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all"
              >
                無料で始める
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </motion.div>
            <p className="mt-6 text-sm text-gray-600">
              No credit card required. Free forever.
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-12 text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} SlangMaker.AI - Engineered for Immersion.</p>
        </footer>

      </div>
    </>
  );
}
