/**
 * 変換履歴のデータ構造
 * localStorageに保存される
 */
export interface HistoryItem {
  /** 一意のID（タイムスタンプベース） */
  id: string;
  
  /** 元のテキスト */
  originalText: string;
  
  /** 変換後のテキスト */
  transformedText: string;
  
  /** 使用したスキンのキー */
  skinKey: string;
  
  /** 使用したスキンの名前（表示用） */
  skinName: string;
  
  /** 変換日時（Unix timestamp） */
  timestamp: number;
  
  /** 比較モードかどうか */
  isCompareMode?: boolean;
  
  /** 比較モードの場合、2つ目のスキンキー */
  skinKey2?: string;
  
  /** 比較モードの場合、2つ目のスキン名 */
  skinName2?: string;
  
  /** 比較モードの場合、2つ目の変換結果 */
  transformedText2?: string;
}

/**
 * localStorage操作用のユーティリティクラス
 */
export class HistoryStorage {
  private static readonly STORAGE_KEY = 'slang_maker_history';
  private static readonly MAX_ITEMS = 100; // 最大100件まで保存

  /**
   * 履歴を全件取得
   */
  static getAll(): HistoryItem[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const items = JSON.parse(data) as HistoryItem[];
      // 新しい順にソート
      return items.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Failed to load history:', error);
      return [];
    }
  }

  /**
   * 履歴を1件追加
   */
  static add(item: Omit<HistoryItem, 'id' | 'timestamp'>): HistoryItem {
    try {
      const newItem: HistoryItem = {
        ...item,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      const items = this.getAll();
      items.unshift(newItem); // 先頭に追加

      // 最大件数を超えたら古いものを削除
      if (items.length > this.MAX_ITEMS) {
        items.splice(this.MAX_ITEMS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
      return newItem;
    } catch (error) {
      console.error('Failed to add history:', error);
      throw error;
    }
  }

  /**
   * 履歴を1件削除
   */
  static remove(id: string): void {
    try {
      const items = this.getAll();
      const filtered = items.filter(item => item.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove history:', error);
      throw error;
    }
  }

  /**
   * 履歴を全件削除
   */
  static clear(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
      throw error;
    }
  }

  /**
   * 履歴を1件取得
   */
  static getById(id: string): HistoryItem | undefined {
    const items = this.getAll();
    return items.find(item => item.id === id);
  }

  /**
   * localStorage容量チェック
   */
  static checkStorage(): { used: number; available: number; percentage: number } {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY) || '[]';
      const used = new Blob([data]).size;
      const available = 5 * 1024 * 1024; // 5MB（一般的なlocalStorageの上限）
      const percentage = (used / available) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('Failed to check storage:', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }
}
