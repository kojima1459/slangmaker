/**
 * Share to Gallery Modal - Post transformation results to community gallery
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Send, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createGalleryPost } from '@/lib/galleryService';

interface ShareToGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalText: string;
  transformedText: string;
  skinKey: string;
  skinName: string;
}

export function ShareToGalleryModal({
  open,
  onOpenChange,
  originalText,
  transformedText,
  skinKey,
  skinName,
}: ShareToGalleryModalProps) {
  const [nickname, setNickname] = useState(() => {
    // Load saved nickname from localStorage
    return localStorage.getItem('gallery_nickname') || '';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!nickname.trim()) {
      setError('ニックネームを入力してください');
      return;
    }

    if (nickname.length > 20) {
      setError('ニックネームは20文字以内にしてください');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createGalleryPost({
        originalText,
        transformedText,
        skinKey,
        skinName,
        nickname: nickname.trim(),
      });

      // Save nickname for future use
      localStorage.setItem('gallery_nickname', nickname.trim());

      toast.success('ギャラリーに投稿しました！');
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to post to gallery:', err);
      setError(err.message || '投稿に失敗しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-purple-500" />
            ギャラリーに投稿
          </DialogTitle>
          <DialogDescription>
            この変換結果をコミュニティに共有しましょう！
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div>
              <p className="text-xs text-gray-500">スキン</p>
              <p className="text-sm font-medium">{skinName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">元テキスト（プレビュー）</p>
              <p className="text-sm text-gray-600 line-clamp-2">
                {originalText.slice(0, 100)}...
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">変換後（プレビュー）</p>
              <p className="text-sm text-gray-700 line-clamp-3">
                {transformedText.slice(0, 150)}...
              </p>
            </div>
          </div>

          {/* Nickname input */}
          <div className="space-y-2">
            <Label htmlFor="nickname">ニックネーム</Label>
            <Input
              id="nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="例: スラング職人"
              maxLength={20}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500">
              {nickname.length}/20文字
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Guidelines */}
          <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg">
            <p className="font-medium text-yellow-700 mb-1">投稿ガイドライン</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>不適切な表現は自動フィルタされます</li>
              <li>通報が多い投稿は非表示になります</li>
              <li>著作権に配慮した内容でお願いします</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !nickname.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                投稿中...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                投稿する
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
