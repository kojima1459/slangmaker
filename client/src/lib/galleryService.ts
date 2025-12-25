/**
 * Gallery service for Firestore CRUD operations
 */
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  increment,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface GalleryPost {
  id: string;
  originalText: string;
  transformedText: string;
  skinKey: string;
  skinName: string;
  nickname: string;
  likes: number;
  reportCount: number;
  createdAt: Timestamp;
  isHidden: boolean;
}

export interface CreatePostData {
  originalText: string;
  transformedText: string;
  skinKey: string;
  skinName: string;
  nickname: string;
}

// Collection reference
const GALLERY_COLLECTION = 'gallery';
const REPORTS_COLLECTION = 'reports';

// NG words filter (Japanese inappropriate content)
const NG_WORDS = [
  // 暴力・脅迫
  '死ね', '殺す', '殺せ', '殺してやる', '地獄', 'ころす', 'しね',
  
  // 差別・侮辱
  'バカ', 'アホ', 'クソ', 'カス', 'ゴミ', 'キモい', 'きもい', 
  'ブス', 'デブ', 'ハゲ', '障害者', 'ガイジ', '池沼', 'チビ',
  '在日', '朝鮮人', '部落', '穢多', 'エタ', '非人',
  
  // 卑猥・性的
  'セックス', 'SEX', 'オナニー', 'マンコ', 'チンコ', 'ちんこ', 'まんこ',
  'おっぱい', 'パイパン', '中出し', 'フェラ', 'クンニ', '射精', 
  'レイプ', '強姦', '痴漢', '援交', '円光', 'パパ活',
  
  // 違法行為
  '詐欺', '違法', 'ドラッグ', '麻薬', '覚醒剤', '大麻', 'コカイン',
  'シャブ', '薬物', '売春', '買春', '児童ポルノ', 'ロリコン',
  
  // 自傷・自殺
  '自殺', '自傷', 'リスカ', '首吊り', '飛び降り',
  
  // スパム・詐欺誘導
  '稼げる', '儲かる', '無料で', 'LINE@', '公式LINE', 'DMください',
  'フォロー', 'プロフ見て', 'こちらから',
];

/**
 * Check if text contains NG words
 */
function containsNGWords(text: string): boolean {
  const lowerText = text.toLowerCase();
  return NG_WORDS.some(word => lowerText.includes(word.toLowerCase()));
}

/**
 * Create a new gallery post
 */
export async function createGalleryPost(data: CreatePostData): Promise<GalleryPost | null> {
  // Validate input
  if (!data.originalText || !data.transformedText || !data.nickname) {
    throw new Error('必須項目が入力されていません');
  }

  // Check for NG words
  if (containsNGWords(data.originalText) || containsNGWords(data.transformedText) || containsNGWords(data.nickname)) {
    throw new Error('不適切な表現が含まれています');
  }

  // Limit text lengths
  const originalText = data.originalText.slice(0, 500);
  const transformedText = data.transformedText.slice(0, 2000);
  const nickname = data.nickname.slice(0, 20);

  const postData = {
    originalText,
    transformedText,
    skinKey: data.skinKey,
    skinName: data.skinName,
    nickname,
    likes: 0,
    reportCount: 0,
    createdAt: serverTimestamp(),
    isHidden: false,
  };

  const docRef = await addDoc(collection(db, GALLERY_COLLECTION), postData);
  
  return {
    id: docRef.id,
    ...postData,
    createdAt: Timestamp.now(),
  } as GalleryPost;
}

/**
 * Get gallery posts (sorted by newest first)
 */
export async function getGalleryPosts(limitCount: number = 50): Promise<GalleryPost[]> {
  const q = query(
    collection(db, GALLERY_COLLECTION),
    where('isHidden', '==', false),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as GalleryPost[];
}

/**
 * Get popular posts (sorted by likes)
 */
export async function getPopularPosts(limitCount: number = 20): Promise<GalleryPost[]> {
  const q = query(
    collection(db, GALLERY_COLLECTION),
    where('isHidden', '==', false),
    orderBy('likes', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as GalleryPost[];
}

/**
 * Like a post
 */
export async function likePost(postId: string): Promise<void> {
  const postRef = doc(db, GALLERY_COLLECTION, postId);
  await updateDoc(postRef, {
    likes: increment(1)
  });
}

/**
 * Report a post
 */
export async function reportPost(postId: string, reason: string): Promise<void> {
  // Add report record
  await addDoc(collection(db, REPORTS_COLLECTION), {
    postId,
    reason,
    createdAt: serverTimestamp(),
  });

  // Increment report count on post
  const postRef = doc(db, GALLERY_COLLECTION, postId);
  await updateDoc(postRef, {
    reportCount: increment(1)
  });

  // Auto-hide if 3+ reports (simple moderation)
  // Note: In production, this would be done server-side
}

/**
 * Get posts by skin
 */
export async function getPostsBySkin(skinKey: string, limitCount: number = 20): Promise<GalleryPost[]> {
  const q = query(
    collection(db, GALLERY_COLLECTION),
    where('skinKey', '==', skinKey),
    where('isHidden', '==', false),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as GalleryPost[];
}
