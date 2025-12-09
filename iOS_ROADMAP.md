# iOS化ロードマップ - AIスラングメーカー

## 概要

このドキュメントは、Web版AIスラングメーカーをiOS化するための完全なロードマップです。段階的な実装計画、技術的課題、解決方法を記載しています。

---

## フェーズ1: 準備・分析（2-3週間）

### 1.1 技術スタック選定

**推奨スタック: React Native + Expo**

| 選択肢 | メリット | デメリット | 推奨度 |
|------|--------|---------|------|
| **React Native + Expo** | Web版コード再利用可、開発速度快、ホットリロード | ネイティブ機能制限 | ⭐⭐⭐⭐⭐ |
| Swift (SwiftUI) | 完全ネイティブ、パフォーマンス最高 | 開発期間長、Web版コード再利用不可 | ⭐⭐⭐ |
| Flutter | クロスプラットフォーム、パフォーマンス良好 | Dart学習必要、Web版コード再利用不可 | ⭐⭐⭐⭐ |

**決定: React Native + Expo を採用**

**理由:**
- Web版のReact/TypeScriptコードを最大限再利用可能
- 開発期間が最短（3-4ヶ月）
- ホットリロードで開発効率が高い
- App Store/Google Playへの配布が容易

### 1.2 環境構築

```bash
# Expoプロジェクト初期化
npx create-expo-app newsskins-mobile

# 必要なパッケージをインストール
npm install expo-router expo-splash-screen expo-font
npm install @react-native-async-storage/async-storage
npm install react-native-gesture-handler react-native-reanimated
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install axios react-query
npm install react-i18next i18next
```

### 1.3 プロジェクト構造設計

```
newsskins-mobile/
├── app/                          # Expo Router (ファイルベースルーティング)
│   ├── _layout.tsx               # ルートレイアウト
│   ├── index.tsx                 # ホーム画面
│   ├── reader/
│   │   └── [id].tsx              # 変換結果画面
│   ├── history.tsx               # 履歴画面
│   ├── settings.tsx              # 設定画面
│   └── _error.tsx                # エラー画面
├── src/
│   ├── components/               # UIコンポーネント
│   │   ├── TransformForm.tsx
│   │   ├── ResultCard.tsx
│   │   ├── SkinSelector.tsx
│   │   └── HistoryList.tsx
│   ├── hooks/                    # カスタムフック
│   │   ├── useTransform.ts
│   │   ├── useHistory.ts
│   │   └── useSettings.ts
│   ├── services/                 # API呼び出し
│   │   ├── api.ts
│   │   └── llm.ts
│   ├── types/                    # TypeScript型定義
│   │   └── index.ts
│   ├── utils/                    # ユーティリティ
│   │   ├── storage.ts
│   │   └── formatting.ts
│   └── constants/
│       └── skins.ts
├── assets/                       # 画像・フォント
├── app.json                      # Expo設定
└── tsconfig.json
```

---

## フェーズ2: コア機能実装（4-5週間）

### 2.1 Web版からの移植可能なコード

**再利用できるコード（80%）:**
- ✅ LLM呼び出しロジック（`server/_core/llm.ts`）
- ✅ プロンプトサニタイズ（`server/_core/llm-safety.ts`）
- ✅ スキン定義（`shared/skins.ts`）
- ✅ 型定義（`shared/types.ts`）
- ✅ ユーティリティ関数（`client/src/lib/`）
- ✅ 国際化設定（`i18n`）

**修正が必要なコード（20%）:**
- 🔄 API呼び出し（REST APIに変更）
- 🔄 状態管理（Context APIまたはZustand）
- 🔄 ローカルストレージ（AsyncStorage）
- 🔄 UI コンポーネント（React Native対応）

### 2.2 実装タスク

#### 2.2.1 基本画面（1週間）

```tsx
// app/index.tsx - ホーム画面
import React, { useState } from 'react';
import { View, TextInput, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useTransform } from '@/hooks/useTransform';
import SkinSelector from '@/components/SkinSelector';
import TransformForm from '@/components/TransformForm';

export default function HomeScreen() {
  const [articleText, setArticleText] = useState('');
  const [selectedSkin, setSelectedSkin] = useState('kansai_banter');
  const { mutate: transform, isLoading } = useTransform();

  const handleTransform = async () => {
    const result = await transform({
      text: articleText,
      skin: selectedSkin,
    });
    // 結果画面に遷移
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <TransformForm
        text={articleText}
        onChangeText={setArticleText}
        isLoading={isLoading}
      />
      <SkinSelector
        selected={selectedSkin}
        onSelect={setSelectedSkin}
        disabled={isLoading}
      />
      <TouchableOpacity
        onPress={handleTransform}
        disabled={isLoading || !articleText.trim()}
        className="bg-purple-600 p-4 rounded-lg m-4"
      >
        <Text className="text-white text-center font-bold">
          {isLoading ? '変換中...' : '変換する'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
```

**タスク:**
- [ ] ホーム画面UI実装
- [ ] テキスト入力フォーム
- [ ] スキン選択UI
- [ ] 変換ボタン実装
- [ ] ローディング状態表示

#### 2.2.2 API統合（1週間）

```typescript
// src/services/api.ts
import axios from 'axios';
import { sanitizeForLLM } from './llm-safety';

const API_BASE_URL = 'https://your-api.com/api';

export const transformText = async (
  text: string,
  skin: string,
  params?: { temperature?: number; topP?: number }
) => {
  try {
    // Web版と同じサニタイズロジックを使用
    const sanitized = sanitizeForLLM(text);

    const response = await axios.post(`${API_BASE_URL}/transform`, {
      text: sanitized,
      skin,
      temperature: params?.temperature || 1.3,
      topP: params?.topP || 0.9,
    });

    return response.data;
  } catch (error) {
    throw new Error(`Transform failed: ${error.message}`);
  }
};

export const getHistory = async () => {
  const response = await axios.get(`${API_BASE_URL}/history`);
  return response.data;
};
```

**タスク:**
- [ ] REST API設計（tRPCからREST APIに変換）
- [ ] Axios設定
- [ ] エラーハンドリング
- [ ] リトライロジック実装
- [ ] キャッシング戦略

#### 2.2.3 ローカルストレージ（1週間）

```typescript
// src/utils/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveHistory = async (item: TransformHistory) => {
  try {
    const existing = await AsyncStorage.getItem('history');
    const history = existing ? JSON.parse(existing) : [];
    history.unshift(item);
    // 最新100件のみ保存
    const limited = history.slice(0, 100);
    await AsyncStorage.setItem('history', JSON.stringify(limited));
  } catch (error) {
    console.error('Failed to save history:', error);
  }
};

export const getHistory = async (): Promise<TransformHistory[]> => {
  try {
    const data = await AsyncStorage.getItem('history');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get history:', error);
    return [];
  }
};

export const deleteHistory = async (id: string) => {
  try {
    const existing = await AsyncStorage.getItem('history');
    const history = existing ? JSON.parse(existing) : [];
    const filtered = history.filter((item: TransformHistory) => item.id !== id);
    await AsyncStorage.setItem('history', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete history:', error);
  }
};
```

**タスク:**
- [ ] AsyncStorage設定
- [ ] 履歴保存機能
- [ ] 履歴読み込み機能
- [ ] キャッシュ戦略
- [ ] データ永続化テスト

#### 2.2.4 状態管理（1週間）

```typescript
// src/hooks/useTransform.ts
import { useCallback, useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { transformText, getHistory } from '@/services/api';
import { saveHistory } from '@/utils/storage';

export const useTransform = () => {
  const mutation = useMutation(
    ({ text, skin }: { text: string; skin: string }) =>
      transformText(text, skin),
    {
      onSuccess: async (data) => {
        // 履歴に保存
        await saveHistory({
          id: Date.now().toString(),
          text: data.original,
          result: data.transformed,
          skin: data.skin,
          timestamp: new Date(),
        });
      },
    }
  );

  return mutation;
};

export const useHistory = () => {
  return useQuery('history', getHistory, {
    staleTime: 5 * 60 * 1000, // 5分
  });
};
```

**タスク:**
- [ ] React Query設定
- [ ] useTransformフック実装
- [ ] useHistoryフック実装
- [ ] キャッシング戦略
- [ ] 状態管理テスト

### 2.3 UI コンポーネント実装

#### 2.3.1 React Native対応コンポーネント

```tsx
// src/components/TransformForm.tsx
import React from 'react';
import { View, TextInput, Text } from 'react-native';

interface Props {
  text: string;
  onChangeText: (text: string) => void;
  isLoading: boolean;
  maxLength?: number;
}

export const TransformForm: React.FC<Props> = ({
  text,
  onChangeText,
  isLoading,
  maxLength = 10000,
}) => {
  return (
    <View className="p-4">
      <Text className="text-lg font-bold mb-2">テキストを入力</Text>
      <TextInput
        value={text}
        onChangeText={onChangeText}
        placeholder="記事のテキストを貼り付けてください..."
        multiline
        numberOfLines={6}
        maxLength={maxLength}
        editable={!isLoading}
        className="border border-gray-300 rounded-lg p-3 mb-2"
      />
      <Text className="text-sm text-gray-500 text-right">
        {text.length} / {maxLength}
      </Text>
    </View>
  );
};
```

**タスク:**
- [ ] TransformForm コンポーネント
- [ ] SkinSelector コンポーネント
- [ ] ResultCard コンポーネント
- [ ] HistoryList コンポーネント
- [ ] SettingsScreen コンポーネント

---

## フェーズ3: ネイティブ機能統合（2-3週間）

### 3.1 必須ネイティブ機能

#### 3.1.1 クリップボード連携

```typescript
// src/hooks/useClipboard.ts
import * as Clipboard from 'expo-clipboard';

export const useClipboard = () => {
  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
  };

  const pasteFromClipboard = async () => {
    return await Clipboard.getStringAsync();
  };

  return { copyToClipboard, pasteFromClipboard };
};
```

**実装:**
- [ ] クリップボードコピー機能
- [ ] クリップボード貼り付け機能
- [ ] トースト通知

#### 3.1.2 シェア機能

```typescript
// src/hooks/useShare.ts
import * as Sharing from 'expo-sharing';

export const useShare = () => {
  const share = async (text: string, title: string) => {
    if (!(await Sharing.isAvailableAsync())) {
      alert('シェア機能は利用できません');
      return;
    }

    await Sharing.shareAsync(text, {
      mimeType: 'text/plain',
      dialogTitle: title,
    });
  };

  return { share };
};
```

**実装:**
- [ ] テキストシェア
- [ ] SNS統合（Twitter、LINE）
- [ ] メール送信

#### 3.1.3 ローカル通知

```typescript
// src/hooks/useNotification.ts
import * as Notifications from 'expo-notifications';

export const useNotification = () => {
  const sendNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
      },
      trigger: { seconds: 1 },
    });
  };

  return { sendNotification };
};
```

**実装:**
- [ ] 変換完了通知
- [ ] バックグラウンド処理通知
- [ ] プッシュ通知対応

### 3.2 オプション機能

#### 3.2.1 音声入力（Speech-to-Text）

```typescript
// src/hooks/useSpeechRecognition.ts
import * as Speech from 'expo-speech';

export const useSpeechRecognition = () => {
  const startListening = async (
    onResult: (text: string) => void
  ) => {
    // expo-speech-recognitionを使用
    // または、ネイティブ実装が必要
  };

  return { startListening };
};
```

**実装:**
- [ ] 音声入力機能
- [ ] リアルタイム文字起こし
- [ ] 複数言語対応

#### 3.2.2 オフライン対応

```typescript
// src/hooks/useOffline.ts
import NetInfo from '@react-native-community/netinfo';

export const useOffline = () => {
  const [isOnline, setIsOnline] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? false);
    });

    return unsubscribe;
  }, []);

  return { isOnline };
};
```

**実装:**
- [ ] ネットワーク状態検出
- [ ] オフラインモード
- [ ] キャッシュ戦略
- [ ] 同期機能

---

## フェーズ4: パフォーマンス最適化（2週間）

### 4.1 バンドルサイズ最適化

```bash
# バンドルサイズ分析
npx expo-bundle-analyzer

# 推奨最大サイズ: 50MB（App Store制限: 150MB）
```

**最適化手法:**
- [ ] 不要な依存関係削除
- [ ] コード分割（Code Splitting）
- [ ] 遅延ロード（Lazy Loading）
- [ ] 画像最適化（WebP形式）
- [ ] Tree Shaking

### 4.2 レンダリング最適化

```typescript
// React.memoを使用したコンポーネント最適化
const SkinCard = React.memo(({ skin, selected, onSelect }) => {
  return (
    <TouchableOpacity onPress={() => onSelect(skin.id)}>
      {/* コンポーネント内容 */}
    </TouchableOpacity>
  );
});
```

**最適化手法:**
- [ ] React.memo使用
- [ ] useCallback最適化
- [ ] useMemo活用
- [ ] 仮想スクロール（FlatList）
- [ ] パフォーマンスプロファイリング

### 4.3 メモリ管理

```typescript
// メモリリーク防止
useEffect(() => {
  const subscription = eventEmitter.subscribe('event', handler);

  return () => {
    subscription.unsubscribe(); // クリーンアップ
  };
}, []);
```

**最適化手法:**
- [ ] メモリリーク検出
- [ ] イベントリスナー管理
- [ ] タイマークリーンアップ
- [ ] 画像キャッシュ管理

---

## フェーズ5: テスト・品質保証（2週間）

### 5.1 ユニットテスト

```typescript
// __tests__/hooks/useTransform.test.ts
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTransform } from '@/hooks/useTransform';

describe('useTransform', () => {
  it('should transform text successfully', async () => {
    const { result } = renderHook(() => useTransform());

    act(() => {
      result.current.mutate({
        text: 'テストテキスト',
        skin: 'kansai_banter',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

**テストカバレッジ:**
- [ ] ユニットテスト（80%以上）
- [ ] 統合テスト
- [ ] E2Eテスト（Detox）
- [ ] パフォーマンステスト

### 5.2 E2Eテスト（Detox）

```typescript
// e2e/firstTest.e2e.ts
describe('Transform Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should transform text', async () => {
    await element(by.id('textInput')).typeText('テストテキスト');
    await element(by.id('transformButton')).multiTap();
    await waitFor(element(by.text('変換完了')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

**テスト項目:**
- [ ] 基本フロー
- [ ] エラーハンドリング
- [ ] ネットワーク遅延
- [ ] オフライン動作

---

## フェーズ6: App Store/Google Play リリース（2-3週間）

### 6.1 App Store リリース

**チェックリスト:**
- [ ] Apple Developer Programに登録
- [ ] 証明書・プロビジョニングプロファイル作成
- [ ] アプリ情報設定（アイコン、スクリーンショット）
- [ ] プライバシーポリシー作成
- [ ] TestFlight でベータテスト
- [ ] App Store Connect で申請
- [ ] リビュー対応

**必要なファイル:**
```json
{
  "name": "AIスラングメーカー",
  "description": "13種類のスタイルでテキストを変換できるAIツール",
  "version": "1.0.0",
  "icon": "assets/icon.png",
  "screenshots": [
    "assets/screenshot1.png",
    "assets/screenshot2.png"
  ],
  "privacyUrl": "https://example.com/privacy",
  "supportUrl": "https://example.com/support"
}
```

### 6.2 Google Play リリース

**チェックリスト:**
- [ ] Google Play Developer Accountに登録
- [ ] リリースキー生成
- [ ] アプリ情報設定
- [ ] プライバシーポリシー作成
- [ ] 内部テスト実施
- [ ] ベータテスト実施
- [ ] Google Play で申請
- [ ] リビュー対応

---

## 技術的課題と解決方法

### 課題1: Web版のtRPCをREST APIに変換

**問題:**
- Web版はtRPCを使用しているが、モバイルではREST APIが必要

**解決方法:**
```typescript
// server/routes/api.ts - REST APIエンドポイント追加
app.post('/api/transform', async (req, res) => {
  const { text, skin, temperature, topP } = req.body;
  
  // 既存のtRPC procedureロジックを再利用
  const result = await transformService.transform({
    text,
    skin,
    temperature,
    topP,
  });

  res.json(result);
});
```

**工程:**
- [ ] REST APIエンドポイント設計
- [ ] OpenAPI/Swagger ドキュメント作成
- [ ] API認証実装（JWT）
- [ ] レート制限設定
- [ ] CORS設定

### 課題2: UI コンポーネントの再実装

**問題:**
- Web版はshadcn/uiを使用しているが、モバイルではReact Nativeが必要

**解決方法:**
```typescript
// 共通ロジックを抽出してカスタムフックに
export const useTransformForm = () => {
  const [text, setText] = useState('');
  const [selectedSkin, setSelectedSkin] = useState('kansai_banter');
  // 共通ロジック
  return { text, setText, selectedSkin, setSelectedSkin };
};

// Web版
import { useTransformForm } from '@/hooks/useTransformForm';
export const WebTransformForm = () => {
  const { text, setText } = useTransformForm();
  return <input value={text} onChange={(e) => setText(e.target.value)} />;
};

// モバイル版
export const MobileTransformForm = () => {
  const { text, setText } = useTransformForm();
  return <TextInput value={text} onChangeText={setText} />;
};
```

**工程:**
- [ ] UI コンポーネント設計
- [ ] React Native コンポーネント実装
- [ ] スタイリング（NativeWind または Tailwind CSS）
- [ ] アクセシビリティ対応
- [ ] ダークモード対応

### 課題3: ローカルストレージの互換性

**問題:**
- Web版はlocalStorageを使用しているが、モバイルではAsyncStorageが必要

**解決方法:**
```typescript
// 抽象化層を作成
export interface IStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// Web版実装
export class WebStorage implements IStorage {
  async getItem(key: string) {
    return localStorage.getItem(key);
  }
  async setItem(key: string, value: string) {
    localStorage.setItem(key, value);
  }
  async removeItem(key: string) {
    localStorage.removeItem(key);
  }
}

// モバイル版実装
export class MobileStorage implements IStorage {
  async getItem(key: string) {
    return AsyncStorage.getItem(key);
  }
  async setItem(key: string, value: string) {
    return AsyncStorage.setItem(key, value);
  }
  async removeItem(key: string) {
    return AsyncStorage.removeItem(key);
  }
}
```

**工程:**
- [ ] Storage抽象化層設計
- [ ] AsyncStorage統合
- [ ] データマイグレーション
- [ ] 暗号化（機密データ）
- [ ] バックアップ機能

### 課題4: パフォーマンス（LLM API遅延）

**問題:**
- LLM API呼び出しが遅く、ユーザー体験が悪い

**解決方法:**
```typescript
// キャッシング戦略
export const useTransformWithCache = () => {
  const cache = useRef<Map<string, string>>(new Map());

  const transform = async (text: string, skin: string) => {
    const key = `${text}:${skin}`;
    
    // キャッシュをチェック
    if (cache.current.has(key)) {
      return cache.current.get(key);
    }

    // API呼び出し
    const result = await transformText(text, skin);
    cache.current.set(key, result);

    // 最大100件のキャッシュを保持
    if (cache.current.size > 100) {
      const firstKey = cache.current.keys().next().value;
      cache.current.delete(firstKey);
    }

    return result;
  };

  return { transform };
};
```

**工程:**
- [ ] キャッシング戦略実装
- [ ] オフライン対応
- [ ] バックグラウンド同期
- [ ] 圧縮（gzip）
- [ ] CDN統合

---

## 実装タイムライン

| フェーズ | 期間 | 工数 | 担当 |
|--------|------|------|------|
| **フェーズ1: 準備・分析** | 2-3週間 | 40h | 1名 |
| **フェーズ2: コア機能実装** | 4-5週間 | 160h | 2名 |
| **フェーズ3: ネイティブ機能** | 2-3週間 | 80h | 1名 |
| **フェーズ4: パフォーマンス最適化** | 2週間 | 60h | 1名 |
| **フェーズ5: テスト・品質保証** | 2週間 | 80h | 2名 |
| **フェーズ6: リリース準備** | 2-3週間 | 60h | 1名 |
| **合計** | **15-18週間** | **480h** | **平均2名** |

---

## 必要なリソース

### 開発環境
- macOS（App Store リリースに必須）
- Xcode 14以上
- Android Studio
- Node.js 18以上
- Expo CLI

### アカウント・ライセンス
- Apple Developer Program（年$99）
- Google Play Developer Account（年$25）
- Firebase（無料プラン利用可）

### 外部サービス
- LLM API（既存）
- Firebase（認証、アナリティクス）
- Sentry（エラー追跡）
- TestFlight（ベータテスト）

---

## リスク管理

| リスク | 確率 | 影響度 | 対策 |
|------|------|------|------|
| App Store リビュー却下 | 中 | 高 | ガイドライン確認、プライバシー対応 |
| パフォーマンス問題 | 中 | 高 | 早期プロファイリング、最適化 |
| API互換性問題 | 低 | 中 | 十分なテスト、バージョニング |
| セキュリティ脆弱性 | 低 | 高 | セキュリティ監査、依存関係更新 |

---

## 推奨事項

### 短期（1-3ヶ月）
1. **React Native + Expo での開発開始**
   - フェーズ1-2を実施
   - iOS/Android同時開発

2. **REST API設計・実装**
   - Web版のtRPCをREST APIに変換
   - OpenAPI ドキュメント作成

3. **基本機能のテスト**
   - ユニットテスト
   - 統合テスト

### 中期（3-6ヶ月）
1. **ネイティブ機能統合**
   - クリップボード、シェア
   - ローカル通知

2. **パフォーマンス最適化**
   - バンドルサイズ削減
   - レンダリング最適化

3. **App Store/Google Play 申請**
   - ベータテスト
   - リビュー対応

### 長期（6-12ヶ月）
1. **ユーザーフィードバック反映**
   - 機能改善
   - UX最適化

2. **拡張機能実装**
   - 音声入力
   - オフライン対応
   - ウィジェット

3. **マネタイズ**
   - プレミアム機能
   - 広告統合
   - サブスクリプション

---

## まとめ

iOS化は段階的に進めることで、リスクを最小化しながら高品質なアプリを開発できます。Web版のコードを最大限再利用し、React Native + Expoを活用することで、開発期間を短縮できます。

**成功のポイント:**
- ✅ 早期にテストを実施
- ✅ パフォーマンスを最優先
- ✅ ユーザーフィードバックを反映
- ✅ セキュリティを重視
- ✅ 段階的にリリース

このロードマップに従うことで、6ヶ月以内にApp Store/Google Playでリリース可能なiOSアプリを開発できます。
