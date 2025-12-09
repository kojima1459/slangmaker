import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveCustomSkin, type CustomSkin } from "@/lib/customSkinStorage";
import { toast } from "sonner";

interface CreateCustomSkinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (skin: CustomSkin) => void;
  initialSkin?: CustomSkin;
}

export function CreateCustomSkinModal({
  open,
  onOpenChange,
  onSave,
  initialSkin,
}: CreateCustomSkinModalProps) {
  const [name, setName] = useState(initialSkin?.name || "");
  const [description, setDescription] = useState(initialSkin?.description || "");
  const [prompt, setPrompt] = useState(initialSkin?.prompt || "");
  const [example, setExample] = useState(initialSkin?.example || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      toast.error("スキン名を入力してください");
      return;
    }

    if (!prompt.trim()) {
      toast.error("プロンプトを入力してください");
      return;
    }

    try {
      setIsSaving(true);
      const savedSkin = saveCustomSkin({
        name: name.trim(),
        description: description.trim() || undefined,
        prompt: prompt.trim(),
        example: example.trim() || undefined,
      });

      toast.success("カスタムスキンを保存しました！");
      onSave(savedSkin);
      onOpenChange(false);

      // Reset form
      setName("");
      setDescription("");
      setPrompt("");
      setExample("");
    } catch (error) {
      console.error("Failed to save custom skin:", error);
      toast.error("カスタムスキンの保存に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setName(initialSkin?.name || "");
      setDescription(initialSkin?.description || "");
      setPrompt(initialSkin?.prompt || "");
      setExample(initialSkin?.example || "");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialSkin ? "カスタムスキンを編集" : "カスタムスキンを作成"}
          </DialogTitle>
          <DialogDescription>
            独自のプロンプトを作成して、テキスト変換をカスタマイズできます
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Skin Name */}
          <div className="space-y-2">
            <Label htmlFor="skin-name">スキン名 *</Label>
            <Input
              id="skin-name"
              placeholder="例: 敬語マスター、カジュアル変換"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500">
              このスキンを識別するための名前
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="skin-description">説明</Label>
            <Input
              id="skin-description"
              placeholder="例: ビジネス文書向けの敬語変換"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
            />
            <p className="text-xs text-gray-500">
              このスキンがどんな変換をするか簡潔に説明
            </p>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <Label htmlFor="skin-prompt">プロンプト *</Label>
            <Textarea
              id="skin-prompt"
              placeholder="例: 与えられたテキストを敬語で丁寧に言い換えてください。ビジネス文書として適切な表現を使用してください。"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isSaving}
              className="min-h-[150px] font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              LLMに指示するプロンプト。詳細で具体的なほど良い結果が得られます
            </p>
          </div>

          {/* Example */}
          <div className="space-y-2">
            <Label htmlFor="skin-example">使用例（オプション）</Label>
            <Textarea
              id="skin-example"
              placeholder="例: 入力: 'これ、めっちゃいいね' → 出力: 'これは非常に優れていると考えられます'"
              value={example}
              onChange={(e) => setExample(e.target.value)}
              disabled={isSaving}
              className="min-h-[100px]"
            />
            <p className="text-xs text-gray-500">
              このスキンの動作例を示すことで、他のユーザーが理解しやすくなります
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "保存中..." : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
