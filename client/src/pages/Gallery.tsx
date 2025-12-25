/**
 * Gallery Page - Community showcase of slang transformations
 */
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Heart, Flag, TrendingUp, Clock, Copy, 
  Loader2, AlertTriangle, RefreshCw 
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getGalleryPosts, 
  getPopularPosts, 
  likePost, 
  reportPost,
  type GalleryPost 
} from '@/lib/galleryService';
import { getThemeForSkin } from '@/lib/skinThemes';
import { SKINS } from '../../../shared/skins';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdBanner } from "@/components/AdBanner";
import { SEO } from "@/components/SEO";

export default function Gallery() {
  const [, setLocation] = useLocation();
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<GalleryPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [reportingPost, setReportingPost] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('new');

  // Load liked posts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('gallery_liked_posts');
    if (stored) {
      setLikedPosts(new Set(JSON.parse(stored)));
    }
  }, []);

  // Fetch posts
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [newPosts, popular] = await Promise.all([
        getGalleryPosts(50),
        getPopularPosts(20)
      ]);
      setPosts(newPosts);
      setPopularPosts(popular);
    } catch (err: any) {
      console.error('Failed to fetch gallery:', err);
      setError('ギャラリーの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    if (likedPosts.has(postId)) {
      toast.info('すでにいいねしています');
      return;
    }

    try {
      await likePost(postId);
      
      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));
      setPopularPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, likes: p.likes + 1 } : p
      ));
      
      // Save to localStorage
      const newLiked = new Set(likedPosts).add(postId);
      setLikedPosts(newLiked);
      localStorage.setItem('gallery_liked_posts', JSON.stringify([...newLiked]));
      
      toast.success('いいねしました！');
    } catch (err) {
      toast.error('いいねに失敗しました');
    }
  };

  const handleReport = async (postId: string) => {
    try {
      await reportPost(postId, 'ユーザー通報');
      toast.success('通報を受け付けました');
      setReportingPost(null);
    } catch (err) {
      toast.error('通報に失敗しました');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('コピーしました');
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const PostCard = ({ post }: { post: GalleryPost }) => {
    const theme = getThemeForSkin(post.skinKey);
    const skinInfo = SKINS[post.skinKey];
    
    return (
      <Card className={`overflow-hidden border-2 ${theme.border} hover:shadow-lg transition-shadow`}>
        <CardHeader className={`py-3 bg-gradient-to-r ${theme.bgGradient}`}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-sm font-medium ${theme.textAccent}`}>
                {skinInfo?.name || post.skinName}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                by {post.nickname} • {formatDate(post.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(post.id)}
                className={`h-8 px-2 ${likedPosts.has(post.id) ? 'text-pink-500' : 'text-gray-400'}`}
              >
                <Heart className={`h-4 w-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`} />
                <span className="ml-1 text-xs">{post.likes}</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="py-4">
          {/* Original text (truncated) */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">元テキスト</p>
            <p className="text-sm text-gray-600 line-clamp-2">
              {post.originalText}
            </p>
          </div>
          
          {/* Transformed text */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500 mb-1">変換後</p>
            <p className="text-gray-800 whitespace-pre-wrap line-clamp-4">
              {post.transformedText}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex justify-between mt-3 pt-3 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(post.transformedText)}
              className="text-gray-500 h-8"
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              コピー
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReportingPost(post.id)}
              className="text-gray-400 h-8 hover:text-red-500"
            >
              <Flag className="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <SEO 
        title="スラング・ギャラリー - みんなの変換結果" 
        description="AIスラングメーカーで生成された面白い変換結果一覧。みんなの投稿を見て楽しもう。"
        path="/gallery"
      />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              戻る
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              スラング・ギャラリー
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchPosts}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container max-w-5xl mx-auto px-4 py-6">
        {error ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchPosts}>再読み込み</Button>
          </Card>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="new" className="gap-2">
                <Clock className="h-4 w-4" />
                新着
              </TabsTrigger>
              <TabsTrigger value="popular" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                人気
              </TabsTrigger>
            </TabsList>

            <TabsContent value="new">
              {posts.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">まだ投稿がありません</p>
                  <p className="text-sm text-gray-400 mt-2">
                    変換結果を投稿して、最初の投稿者になろう！
                  </p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {posts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="popular">
              {popularPosts.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-500">まだ人気の投稿がありません</p>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {popularPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Ad Banner */}
      <div className="container max-w-5xl mx-auto px-4 pb-6">
        <div className="flex justify-center">
          <AdBanner />
        </div>
      </div>

      {/* Report Dialog */}
      <AlertDialog open={!!reportingPost} onOpenChange={() => setReportingPost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>この投稿を通報しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              不適切なコンテンツとして報告します。複数の通報があった投稿は自動的に非表示になります。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => reportingPost && handleReport(reportingPost)}
              className="bg-red-500 hover:bg-red-600"
            >
              通報する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>
  );
}
