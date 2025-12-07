# フィードバック機能のデータベース設計案

## 概要

ユーザーの変換結果に対する評価（「良い」「悪い」）を収集し、スキンの品質改善に活用するためのデータベース設計です。

---

## テーブル設計

### 1. `feedback` テーブル

ユーザーからのフィードバックを保存するメインテーブルです。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | int | PRIMARY KEY, AUTO_INCREMENT | フィードバックID |
| `user_id` | varchar(255) | NOT NULL | ユーザーID（OAuth認証のopenId） |
| `history_id` | int | NOT NULL, FOREIGN KEY → history.id | 変換履歴ID |
| `rating` | enum('good', 'bad') | NOT NULL | 評価（良い/悪い） |
| `comment` | text | NULL | 任意のコメント（将来的に追加） |
| `created_at` | datetime | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 作成日時 |

**インデックス:**
- `idx_user_id`: `user_id` にインデックス（ユーザー別のフィードバック取得を高速化）
- `idx_history_id`: `history_id` にインデックス（履歴別のフィードバック取得を高速化）
- `idx_created_at`: `created_at` にインデックス（時系列分析を高速化）

**制約:**
- `UNIQUE(user_id, history_id)`: 同じユーザーが同じ履歴に対して複数回フィードバックできないようにする

---

### 2. 既存の `history` テーブル（参照用）

フィードバックは変換履歴に紐づきます。既存の `history` テーブルを参照します。

| カラム名 | 型 | 説明 |
|---------|-----|------|
| `id` | int | 履歴ID |
| `user_id` | varchar(255) | ユーザーID |
| `skin_key` | varchar(50) | スキンキー（例: "kansai_banter"） |
| `input_text` | text | 元記事本文 |
| `output_text` | text | 変換結果 |
| `parameters` | text | 変換パラメータ（JSON） |
| `created_at` | datetime | 作成日時 |

---

## 分析用のクエリ設計

### 1. スキン別の評価統計

各スキンの「良い」「悪い」の数と割合を取得します。

```sql
SELECT 
  h.skin_key,
  COUNT(CASE WHEN f.rating = 'good' THEN 1 END) AS good_count,
  COUNT(CASE WHEN f.rating = 'bad' THEN 1 END) AS bad_count,
  COUNT(*) AS total_count,
  ROUND(COUNT(CASE WHEN f.rating = 'good' THEN 1 END) * 100.0 / COUNT(*), 2) AS good_percentage
FROM feedback f
JOIN history h ON f.history_id = h.id
GROUP BY h.skin_key
ORDER BY good_percentage ASC;
```

**結果例:**
| skin_key | good_count | bad_count | total_count | good_percentage |
|----------|------------|-----------|-------------|-----------------|
| ojisan_mail | 5 | 15 | 20 | 25.00 |
| kansai_banter | 30 | 20 | 50 | 60.00 |
| detached_lit | 45 | 5 | 50 | 90.00 |

---

### 2. 時系列での評価推移

スキンの評価が時間とともにどう変化しているかを追跡します。

```sql
SELECT 
  DATE(f.created_at) AS date,
  h.skin_key,
  COUNT(CASE WHEN f.rating = 'good' THEN 1 END) AS good_count,
  COUNT(CASE WHEN f.rating = 'bad' THEN 1 END) AS bad_count
FROM feedback f
JOIN history h ON f.history_id = h.id
WHERE f.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(f.created_at), h.skin_key
ORDER BY date DESC, h.skin_key;
```

---

### 3. ユーザー別のフィードバック傾向

特定のユーザーがどのスキンを好むかを分析します。

```sql
SELECT 
  f.user_id,
  h.skin_key,
  COUNT(CASE WHEN f.rating = 'good' THEN 1 END) AS good_count,
  COUNT(CASE WHEN f.rating = 'bad' THEN 1 END) AS bad_count
FROM feedback f
JOIN history h ON f.history_id = h.id
WHERE f.user_id = 'USER_OPEN_ID_HERE'
GROUP BY f.user_id, h.skin_key;
```

---

### 4. 評価が低いスキンのトップ5

改善が必要なスキンを特定します。

```sql
SELECT 
  h.skin_key,
  COUNT(CASE WHEN f.rating = 'bad' THEN 1 END) AS bad_count,
  COUNT(*) AS total_count,
  ROUND(COUNT(CASE WHEN f.rating = 'bad' THEN 1 END) * 100.0 / COUNT(*), 2) AS bad_percentage
FROM feedback f
JOIN history h ON f.history_id = h.id
GROUP BY h.skin_key
HAVING COUNT(*) >= 10  -- 最低10件のフィードバックがあるスキンのみ
ORDER BY bad_percentage DESC
LIMIT 5;
```

---

### 5. パラメータ別の評価分析

温度やTop-pなどのパラメータが評価にどう影響するかを分析します。

```sql
SELECT 
  h.skin_key,
  JSON_EXTRACT(h.parameters, '$.temperature') AS temperature,
  COUNT(CASE WHEN f.rating = 'good' THEN 1 END) AS good_count,
  COUNT(CASE WHEN f.rating = 'bad' THEN 1 END) AS bad_count,
  ROUND(COUNT(CASE WHEN f.rating = 'good' THEN 1 END) * 100.0 / COUNT(*), 2) AS good_percentage
FROM feedback f
JOIN history h ON f.history_id = h.id
GROUP BY h.skin_key, temperature
ORDER BY h.skin_key, temperature;
```

---

## API設計

### 1. `feedback.submit`

フィードバックを送信します。

**リクエスト:**
```typescript
{
  historyId: number;
  rating: 'good' | 'bad';
}
```

**レスポンス:**
```typescript
{
  success: boolean;
  message: string;
}
```

**ビジネスロジック:**
- ユーザーが既に同じ履歴にフィードバックを送信している場合は、既存のフィードバックを更新
- 履歴が存在しない、または他のユーザーの履歴の場合はエラー

---

### 2. `feedback.stats`

スキン別の評価統計を取得します（管理者用）。

**リクエスト:**
```typescript
{
  skinKey?: string;  // 特定のスキンのみ取得（オプション）
  startDate?: string;  // 開始日（オプション）
  endDate?: string;  // 終了日（オプション）
}
```

**レスポンス:**
```typescript
{
  stats: Array<{
    skinKey: string;
    skinName: string;
    goodCount: number;
    badCount: number;
    totalCount: number;
    goodPercentage: number;
  }>;
}
```

---

### 3. `feedback.list`

フィードバック一覧を取得します（管理者用）。

**リクエスト:**
```typescript
{
  skinKey?: string;  // 特定のスキンのみ取得（オプション）
  rating?: 'good' | 'bad';  // 特定の評価のみ取得（オプション）
  limit?: number;  // 取得件数（デフォルト: 50）
  offset?: number;  // オフセット（デフォルト: 0）
}
```

**レスポンス:**
```typescript
{
  feedbacks: Array<{
    id: number;
    userId: string;
    historyId: number;
    rating: 'good' | 'bad';
    skinKey: string;
    inputText: string;
    outputText: string;
    createdAt: string;
  }>;
  total: number;
}
```

---

## UI設計

### 1. Reader.tsx（変換結果ページ）

変換結果の下に「良い」「悪い」ボタンを追加します。

```
┌─────────────────────────────────────┐
│  変換結果                            │
│  [変換されたテキスト...]             │
│                                     │
│  この変換結果は役に立ちましたか？    │
│  [👍 良い]  [👎 悪い]               │
└─────────────────────────────────────┘
```

**UX:**
- ボタンをクリックすると、フィードバックが送信される
- 送信後は「フィードバックありがとうございました！」とトースト通知を表示
- 既にフィードバック済みの場合は、ボタンを無効化または選択状態を表示

---

### 2. Analytics.tsx（分析ダッシュボード）

管理者用の分析ページを作成します。

```
┌─────────────────────────────────────┐
│  フィードバック分析                  │
│                                     │
│  スキン別評価統計                    │
│  ┌───────────────────────────────┐  │
│  │ スキン名    良い  悪い  評価率 │  │
│  │ デタッチ文学風  45    5   90%  │  │
│  │ 関西ノリ風      30   20   60%  │  │
│  │ おじさん構文風   5   15   25%  │  │
│  └───────────────────────────────┘  │
│                                     │
│  評価が低いスキン（改善が必要）      │
│  ⚠️ おじさん構文風 (25%)            │
│  ⚠️ 詩的エモ風 (40%)                │
└─────────────────────────────────────┘
```

---

## データ保持ポリシー

### 1. データ保持期間

- フィードバックデータ: **無期限保持**（分析に必要）
- ただし、ユーザーがアカウント削除を要求した場合は、そのユーザーのフィードバックも削除

### 2. プライバシー配慮

- フィードバックには個人を特定できる情報（名前、メールアドレスなど）は含まない
- `user_id` はOAuth認証の `openId` を使用（匿名化）
- 分析ダッシュボードでは、個別のユーザーIDは表示せず、集計データのみ表示

---

## 実装の優先順位

### Phase 1（最優先）
1. `feedback` テーブルの作成
2. `feedback.submit` APIの実装
3. Reader.tsxに「良い」「悪い」ボタンを追加

### Phase 2（次に重要）
4. `feedback.stats` APIの実装
5. 簡易的な分析ダッシュボードの作成

### Phase 3（将来的に）
6. コメント機能の追加（ユーザーが具体的なフィードバックを記入できる）
7. パラメータ別の評価分析
8. 時系列での評価推移グラフ

---

## 期待される効果

1. **データ駆動の改善**: 評価が低いスキンを特定し、優先的に改善できる
2. **ユーザーエンゲージメント**: ユーザーが意見を伝えられることで、アプリへの愛着が増す
3. **A/Bテスト**: スキンの改善前後で評価を比較し、効果を測定できる
4. **パラメータ最適化**: どのパラメータ設定が高評価を得やすいかを分析できる

---

## 注意点

1. **AIは自動改善しない**: フィードバックデータを見て、人間（開発者）が手動でスキンを改善する必要があります
2. **サンプルサイズ**: 最低10〜20件のフィードバックがないと、統計的に意味のある分析はできません
3. **バイアス**: 特定のユーザー層（例：若者）からのフィードバックに偏る可能性があります

---

## 次のステップ

1. このデータベース設計案をレビュー
2. `drizzle/schema.ts` に `feedback` テーブルを追加
3. マイグレーションを実行（`pnpm db:push`）
4. APIとUIを実装
5. テストとデプロイ
