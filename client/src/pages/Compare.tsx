import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, Columns, Share2 } from "lucide-react";
import { FaXTwitter, FaLine, FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa6";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { SEO } from "@/components/SEO";

interface CompareResult {
  output: string;
  skinKey: string;
  skinName: string;
}

interface CompareData {
  originalText: string;
  result1: CompareResult;
  result2: CompareResult;
  result3?: CompareResult;
}

export default function Compare() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<CompareData | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const stored = sessionStorage.getItem('compareData');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      setLocation("/");
    }
  }, [setLocation]);

  if (!data) {
    return null;
  }

  const results = [data.result1, data.result2, data.result3].filter(Boolean) as CompareResult[];
  const siteUrl = 'https://slangmaker.sexinator.com';

  const handleCopy = (text: string, skinName: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${skinName}の変換結果をコピーしました`);
  };

  const handleBack = () => {
    sessionStorage.removeItem('compareData');
    setLocation("/");
  };

  const handleTwitterShare = () => {
    const skinNames = results.map(r => r.skinName).join(', ');
    const text = `AIスラングメーカーで${results.length}スキン比較！\n\n${results.map(r => `【${r.skinName}】\n${r.output.substring(0, 50)}...`).join('\n\n')}\n\n${siteUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleLineShare = () => {
    const text = `AIスラングメーカーで${results.length}スキン比較！\n\n${siteUrl}`;
    window.open(`https://line.me/R/msg/text/?${encodeURIComponent(text)}`, '_blank');
  };

  const handleFacebookShare = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl)}`, '_blank');
  };

  const handleLinkedInShare = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`, '_blank');
  };

  const handleInstagramShare = () => {
    toast.info('Instagramへはテキストをコピーしてシェアしてください');
  };

  // Colors for each skin result
  const cardStyles = [
    { border: 'border-purple-200', header: 'from-purple-50 to-purple-100', title: 'text-purple-700', hover: 'hover:bg-purple-50' },
    { border: 'border-pink-200', header: 'from-pink-50 to-pink-100', title: 'text-pink-700', hover: 'hover:bg-pink-50' },
    { border: 'border-orange-200', header: 'from-orange-50 to-orange-100', title: 'text-orange-700', hover: 'hover:bg-orange-50' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <SEO title="スキン比較" path="/compare" />
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-gray-700 hover:text-purple-700 hover:bg-purple-50"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span>トップに戻る</span>
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent flex items-center gap-2">
              <Columns className="h-5 w-5 text-purple-600" />
              スキン比較モード
            </h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-7xl mx-auto px-4 pt-24 pb-12">
        {/* Original Text */}
        <Card className="mb-6 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300">
          <CardHeader>
            <CardTitle className="text-lg text-gray-700">元のテキスト</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {data.originalText}
            </p>
          </CardContent>
        </Card>

        {/* Comparison Grid */}
        <div className={`grid gap-6 ${results.length === 3 ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1 lg:grid-cols-2'}`}>
          {results.map((result, index) => (
            <Card key={index} className={`shadow-lg border-2 ${cardStyles[index].border}`}>
              <CardHeader className={`bg-gradient-to-r ${cardStyles[index].header}`}>
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${cardStyles[index].title}`}>
                    {result.skinName}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(result.output, result.skinName)}
                    className={`bg-white ${cardStyles[index].hover}`}
                  >
                    <Copy className="h-4 w-4 mr-1.5" />
                    コピー
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {result.output}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col items-center gap-6">
          <Button
            onClick={() => {
              const combined = results.map(r => `【${r.skinName}】\n${r.output}`).join('\n\n');
              navigator.clipboard.writeText(combined);
              toast.success("全ての変換結果をコピーしました");
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          >
            <Copy className="h-4 w-4 mr-2" />
            全てコピー ({results.length}件)
          </Button>

          {/* SNS Share Buttons */}
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                SNSでシェア
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-gray-100"
                  onClick={handleTwitterShare}
                >
                  <FaXTwitter className="h-6 w-6" />
                  <span className="text-xs">X</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-green-50"
                  onClick={handleLineShare}
                >
                  <FaLine className="h-6 w-6 text-green-500" />
                  <span className="text-xs">LINE</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-50"
                  onClick={handleFacebookShare}
                >
                  <FaFacebook className="h-6 w-6 text-blue-600" />
                  <span className="text-xs">Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-pink-50"
                  onClick={handleInstagramShare}
                >
                  <FaInstagram className="h-6 w-6 text-pink-600" />
                  <span className="text-xs">Instagram</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4 hover:bg-blue-50"
                  onClick={handleLinkedInShare}
                >
                  <FaLinkedin className="h-6 w-6 text-blue-700" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
