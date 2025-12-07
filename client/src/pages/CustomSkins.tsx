import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { skinTemplates, type SkinTemplate, getAllCategories, getTemplatesByCategory } from "@shared/skinTemplates";
import { useTranslation } from "react-i18next";

interface CustomSkinFormData {
  id?: number;
  key: string;
  name: string;
  description: string;
  prompt: string;
  example: string;
}

export default function CustomSkins() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<SkinTemplate['category'] | 'all'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CustomSkinFormData>({
    key: "",
    name: "",
    description: "",
    prompt: "",
    example: "",
  });

  const utils = trpc.useUtils();
  const { data: skinsData, isLoading } = trpc.customSkins.list.useQuery();
  const createMutation = trpc.customSkins.create.useMutation({
    onSuccess: () => {
      utils.customSkins.list.invalidate();
      toast.success("カスタムスキンを作成しました");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.message || "作成に失敗しました");
    },
  });
  const updateMutation = trpc.customSkins.update.useMutation({
    onSuccess: () => {
      utils.customSkins.list.invalidate();
      toast.success("カスタムスキンを更新しました");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.message || "更新に失敗しました");
    },
  });
  const deleteMutation = trpc.customSkins.delete.useMutation({
    onSuccess: () => {
      utils.customSkins.list.invalidate();
      toast.success("カスタムスキンを削除しました");
    },
    onError: (error) => {
      toast.error(error.message || "削除に失敗しました");
    },
  });

  const handleUseTemplate = (template: SkinTemplate) => {
    const lang = i18n.language as 'ja' | 'en' | 'zh';
    setEditingId(null);
    setFormData({
      key: `template_${template.id}_${Date.now()}`,
      name: template.name[lang],
      description: template.description[lang],
      prompt: template.prompt,
      example: "",
    });
    setIsDialogOpen(true);
    toast.success(t('customSkins.templateApplied'));
  };

  const handleOpenCreateDialog = () => {
    setEditingId(null);
    setFormData({
      key: "",
      name: "",
      description: "",
      prompt: "",
      example: "",
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (skin: any) => {
    setEditingId(skin.id);
    setFormData({
      id: skin.id,
      key: skin.key,
      name: skin.name,
      description: skin.description || "",
      prompt: skin.prompt,
      example: skin.example || "",
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingId(null);
    setFormData({
      key: "",
      name: "",
      description: "",
      prompt: "",
      example: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.key || !formData.name || !formData.prompt) {
      toast.error("必須項目を入力してください");
      return;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        name: formData.name,
        description: formData.description,
        prompt: formData.prompt,
        example: formData.example,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("本当に削除しますか？")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-6xl py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              戻る
            </Button>
            <div>
              <h1 className="text-2xl font-bold">カスタムスキン管理</h1>
              <p className="text-sm text-gray-600">
                独自の文体変換ルールを作成・管理できます
              </p>
            </div>
          </div>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        </div>

        {/* Templates Section */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <CardTitle>{t('customSkins.templates.title')}</CardTitle>
            </div>
            <CardDescription>
              {t('customSkins.templates.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                {t('customSkins.templates.categories.all')}
              </Button>
              {getAllCategories().map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {t(`customSkins.templates.categories.${category}`)}
                </Button>
              ))}
            </div>

            {/* Template Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(selectedCategory === 'all'
                ? skinTemplates
                : getTemplatesByCategory(selectedCategory)
              ).map((template) => {
                const lang = i18n.language as 'ja' | 'en' | 'zh';
                return (
                  <Card
                    key={template.id}
                    className="hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-purple-300"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <CardHeader>
                      <CardTitle className="text-base">{template.name[lang]}</CardTitle>
                      <CardDescription className="text-sm">
                        {template.description[lang]}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button size="sm" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('customSkins.templates.useTemplate')}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Skins List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">読み込み中...</p>
          </div>
        ) : skinsData?.skins.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4">カスタムスキンがまだありません</p>
              <Button onClick={handleOpenCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                最初のスキンを作成
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skinsData?.skins.map((skin) => (
              <Card key={skin.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{skin.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {skin.description || "説明なし"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEditDialog(skin)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(skin.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">プロンプト:</p>
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {skin.prompt}
                      </p>
                    </div>
                    {skin.example && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">変換例:</p>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {skin.example}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "カスタムスキンを編集" : "カスタムスキンを作成"}
              </DialogTitle>
              <DialogDescription>
                独自の文体変換ルールを定義できます
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="key">
                  キー <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="key"
                  value={formData.key}
                  onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                  placeholder="例: my_custom_style"
                  disabled={!!editingId}
                />
                <p className="text-xs text-gray-500">
                  英数字とアンダースコアのみ使用可能（作成後は変更不可）
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">
                  名前 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例: 丁寧な敬語風"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">説明</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="このスキンの特徴を簡潔に説明"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prompt">
                  プロンプト <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="prompt"
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  placeholder="例: 以下のテキストを、非常に丁寧な敬語で書き直してください。「です・ます」調を使い、相手を尊重する表現を心がけてください。"
                  rows={6}
                />
                <p className="text-xs text-gray-500">
                  AIに指示する内容を記述してください
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="example">変換例（オプション）</Label>
                <Textarea
                  id="example"
                  value={formData.example}
                  onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                  placeholder="例: 今日は良い天気です → 本日は誠に素晴らしいお天気でございます"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                <X className="mr-2 h-4 w-4" />
                キャンセル
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {editingId ? "更新" : "作成"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
