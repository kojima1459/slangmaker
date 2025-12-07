import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, BookOpen, Sparkles, Sliders, Zap } from "lucide-react";
import { useLocation } from "wouter";
import { SKINS } from "../../../shared/skins";

export default function Guide() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-4xl py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => setLocation("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            戻る
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <h1 className="text-3xl font-bold">ユーザーガイド</h1>
          </div>
        </div>

        {/* Introduction */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              言い換えメーカー とは？
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              言い換えメーカー は、ニュース記事を様々な「スキン（文体）」で楽しむためのアプリです。
              真面目なニュースを関西弁で読んだり、ギャル語で読んだり、SF風に読んだり...
              同じ情報でも、文体が変わるだけで全く違った印象になります。
            </p>
            <p className="text-gray-700">
              さらに、<strong>詳細設定</strong>をいじることで、AIの「創造性」や「出力の長さ」を自由に調整できます。
              パラメータを変えて遊ぶことで、自分好みの変換結果を見つけてみてください！
            </p>
          </CardContent>
        </Card>

        {/* How to Use */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              使い方
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">1. 記事本文をコピー&ペースト</h3>
              <p className="text-gray-700">
                変換したいニュース記事のページを開き、本文をコピーして言い換えメーカー に貼り付けます。
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">2. スキンを選ぶ</h3>
              <p className="text-gray-700">
                10種類のスキンから、お好みの文体を選びます。各スキンの特徴は下記をご覧ください。
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">3. 詳細設定をいじって遊ぶ（任意）</h3>
              <p className="text-gray-700">
                「詳細設定」を開いて、温度やTop-pなどのパラメータを調整すると、
                より個性的な変換結果が得られます。詳しくは下記の「詳細設定の説明」をご覧ください。
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">4. 変換する</h3>
              <p className="text-gray-700">
                「変換する」ボタンを押すと、AIが記事を選んだスキンで書き直します。
                変換結果は、コピーしたり、シェアしたりできます。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Skins Explanation */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle>10種類のスキン</CardTitle>
            <CardDescription>
              各スキンの特徴と、どんな記事に合うかを説明します
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(SKINS).map(([key, skin]) => (
              <div key={key} className="space-y-2">
                <h3 className="font-semibold text-lg text-purple-700">{skin.name}</h3>
                <p className="text-gray-700">{skin.description}</p>
                <Separator className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Advanced Settings Explanation */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-green-600" />
              詳細設定の説明
            </CardTitle>
            <CardDescription>
              パラメータをいじって、変換結果を自分好みにカスタマイズ！
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Temperature */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">温度（Temperature）</h3>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>AIの「創造性」を調整</strong>します。
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>低い（0.5〜1.0）</strong>: 堅実で予測可能な文章。元記事に忠実。</li>
                  <li><strong>中間（1.0〜1.5）</strong>: バランスの取れた変換。おすすめ。</li>
                  <li><strong>高い（1.5〜2.0）</strong>: ユニークで予測不可能な文章。遊び心満載。</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  💡 <strong>おすすめ</strong>: 関西弁やギャル語など、個性的なスキンでは高めに設定すると面白い結果が得られます！
                </p>
              </div>
            </div>

            <Separator />

            {/* Top-p */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Top-p（Nucleus Sampling）</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>AIの「多様性」を調整</strong>します。
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>低い（0.5〜0.7）</strong>: 安定した文章。同じ入力なら似た結果になる。</li>
                  <li><strong>中間（0.7〜0.9）</strong>: バランスの取れた多様性。おすすめ。</li>
                  <li><strong>高い（0.9〜1.0）</strong>: バリエーション豊かな文章。毎回違う結果が楽しめる。</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  💡 <strong>おすすめ</strong>: 温度と組み合わせて調整すると、より細かくコントロールできます。
                </p>
              </div>
            </div>

            <Separator />

            {/* Max Output Tokens */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">出力長（Max Output Tokens）</h3>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>変換後の文章の最大長</strong>を設定します。
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>短め（500〜1000）</strong>: サクッと読める短い文章。</li>
                  <li><strong>標準（1000〜1500）</strong>: バランスの取れた長さ。おすすめ。</li>
                  <li><strong>長め（1500〜2000）</strong>: 詳細な説明や長い記事に最適。</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  💡 <strong>注意</strong>: 長すぎると処理時間が増えます。元記事の長さに応じて調整してください。
                </p>
              </div>
            </div>

            <Separator />

            {/* Length Ratio */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">長さ比率（Length Ratio）</h3>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>元記事の何倍の長さにするか</strong>を設定します。
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li><strong>0.5倍</strong>: 元記事の半分の長さに要約。</li>
                  <li><strong>1.0倍</strong>: 元記事と同じくらいの長さ。おすすめ。</li>
                  <li><strong>1.5〜2.0倍</strong>: 元記事より詳しく、説明を追加。</li>
                </ul>
                <p className="text-sm text-gray-600 mt-2">
                  💡 <strong>おすすめ</strong>: 短い記事は1.5倍、長い記事は0.8倍くらいがちょうど良いです。
                </p>
              </div>
            </div>

            <Separator />

            {/* Core 3 Lines */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">コア3行追加</h3>
              <div className="bg-pink-50 p-4 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>記事の要点を3行で追加</strong>します。
                </p>
                <p className="text-gray-700">
                  ONにすると、変換結果の最後に「この記事のポイント」として、
                  記事の要点を3行でまとめた文章が追加されます。
                  忙しい時や、記事の内容を素早く把握したい時に便利です。
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  💡 <strong>おすすめ</strong>: 長い記事や複雑な内容の記事で特に有効です。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>使いこなしのコツ</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">🎯 スキンと温度の組み合わせ</h3>
              <p className="text-gray-700">
                関西弁やギャル語など、個性的なスキンでは温度を高め（1.5〜2.0）に設定すると、
                より面白い結果が得られます。逆に、SF風やミリタリー風では、
                温度を低め（0.8〜1.2）にすると、世界観が崩れにくくなります。
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">🔄 何度も試してみる</h3>
              <p className="text-gray-700">
                同じ記事でも、パラメータを変えたり、スキンを変えたりすると、
                全く違った結果が得られます。色々試して、お気に入りの組み合わせを見つけてください！
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">📱 シェアして楽しむ</h3>
              <p className="text-gray-700">
                変換結果は、コピーしてSNSでシェアできます。
                友達と一緒に、面白い変換結果を楽しんでください！
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
