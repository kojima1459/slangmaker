import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Copy, Columns } from "lucide-react";
import { toast } from "sonner";

interface CompareData {
  originalText: string;
  result1: {
    output: string;
    skinKey: string;
    skinName: string;
  };
  result2: {
    output: string;
    skinKey: string;
    skinName: string;
  };
}

export default function Compare() {
  const [, setLocation] = useLocation();
  const [data, setData] = useState<CompareData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('compareData');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      // No data, redirect to home
      setLocation("/");
    }
  }, [setLocation]);

  if (!data) {
    return null;
  }

  const handleCopy = (text: string, skinName: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${skinName}の変換結果をコピーしました`);
  };

  const handleBack = () => {
    sessionStorage.removeItem('compareData');
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Result 1 */}
          <Card className="shadow-lg border-2 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-purple-700">
                  {data.result1.skinName}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(data.result1.output, data.result1.skinName)}
                  className="bg-white hover:bg-purple-50"
                >
                  <Copy className="h-4 w-4 mr-1.5" />
                  コピー
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {data.result1.output}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Result 2 */}
          <Card className="shadow-lg border-2 border-pink-200">
            <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-pink-700">
                  {data.result2.skinName}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(data.result2.output, data.result2.skinName)}
                  className="bg-white hover:bg-pink-50"
                >
                  <Copy className="h-4 w-4 mr-1.5" />
                  コピー
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {data.result2.output}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-center gap-4">
          <Button
            onClick={() => {
              const combined = `【${data.result1.skinName}】\n${data.result1.output}\n\n【${data.result2.skinName}】\n${data.result2.output}`;
              navigator.clipboard.writeText(combined);
              toast.success("両方の変換結果をコピーしました");
            }}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          >
            <Copy className="h-4 w-4 mr-2" />
            両方をコピー
          </Button>
        </div>
      </div>
    </div>
  );
}
