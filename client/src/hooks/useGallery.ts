import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  getGalleryPosts, 
  getPopularPosts, 
  likePost, 
  reportPost,
  type GalleryPost,
  ValidationError,
  GalleryError
} from '@/lib/galleryService';

export function useGallery() {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [popularPosts, setPopularPosts] = useState<GalleryPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  // Load liked posts from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gallery_liked_posts');
      if (stored) {
        setLikedPosts(new Set(JSON.parse(stored)));
      }
    } catch (e) {
      console.warn('Failed to load liked posts from storage', e);
    }
  }, []);

  const fetchPosts = useCallback(async () => {
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
      // [REFACTOR: A] Improved error message display
      const message = err instanceof GalleryError ? err.message : 'ギャラリーの読み込みに失敗しました';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // [REFACTOR: S] Fix dependency array

  const handleLike = useCallback(async (postId: string) => {
    if (likedPosts.has(postId)) {
      toast.info('すでにいいねしています');
      return;
    }

    try {
      await likePost(postId);
      
      // Update local state optimistically
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
    } catch (err: any) {
      const message = err instanceof GalleryError ? err.message : 'いいねに失敗しました';
      toast.error(message);
    }
  }, [likedPosts]);

  const handleReport = useCallback(async (postId: string) => {
    try {
      await reportPost(postId, 'ユーザー通報');
      toast.success('通報を受け付けました');
    } catch (err: any) {
      const message = err instanceof GalleryError ? err.message : '通報に失敗しました';
      toast.error(message);
    }
  }, []);

  return {
    posts,
    popularPosts,
    isLoading,
    error,
    likedPosts,
    fetchPosts,
    handleLike,
    handleReport
  };
}
