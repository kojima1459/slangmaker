# リファクタリング計画書

## 概要

本文書は、コードレビューで発見された優先度SおよびAの問題に対するリファクタリング計画を示します。全面書き換えは行わず、既存のインターフェースを維持しながら段階的に改善します。

---

## 優先度S: 即座に対応すべき問題

### S-1: APIキー管理の改善

**現状の問題**:
- ユーザーが入力したGemini APIキーをクライアントから直接サーバーに送信
- セキュリティリスクが高い

**改修方針**:
1. `server/db.ts`の`saveApiKey`関数は既に暗号化を実装しているため、これを活用
2. `server/routers.ts`の`transform`プロシージャを修正し、APIキーをリクエストごとに受け取るのではなく、データベースから取得
3. クライアント側では、APIキーを設定ページでのみ入力し、変換時には使用しない

**改修箇所**:
```typescript
// server/routers.ts (改修前)
transform: publicProcedure
  .input(z.object({
    // ...
    apiKey: z.string(),  // ← 削除
  }))
  .mutation(async ({ input, ctx }) => {
    const result = await transformArticle(input);  // ← APIキーを直接使用
    // ...
  }),

// server/routers.ts (改修後)
transform: protectedProcedure  // ← publicからprotectedに変更
  .input(z.object({
    // ...
    // apiKeyフィールドを削除
  }))
  .mutation(async ({ input, ctx }) => {
    // データベースからAPIキーを取得
    const settings = await getUserSettings(ctx.user.id);
    if (!settings?.encryptedApiKey) {
      throw new TRPCError({
        code: 'PRECONDITION_FAILED',
        message: 'Gemini APIキーが設定されていません。設定ページで登録してください。',
      });
    }
    
    // APIキーを復号化（server/db.tsのdecrypt関数を使用）
    const apiKey = decrypt(settings.encryptedApiKey);
    
    // transformArticleにAPIキーを渡す
    const result = await transformArticle({ ...input, apiKey });
    // ...
  }),
```

**期待される効果**:
- APIキーがクライアントサイドに露出しなくなる
- セキュリティリスクの大幅な低減

---

### S-2: レート制限の実装

**現状の問題**:
- 無制限にGemini APIを呼び出せる
- コスト爆発のリスク

**改修方針**:
1. データベースに`api_usage`テーブルを追加
2. ユーザーごとの1日あたりの変換回数を記録
3. 上限（例: 1日100回）に達したらエラーを返す

**改修箇所**:
```typescript
// drizzle/schema.ts (追加)
export const apiUsage = sqliteTable("api_usage", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD形式
  count: integer("count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
});

// server/db.ts (追加)
export async function checkAndIncrementUsage(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const DAILY_LIMIT = 100;
  
  const usage = await db.query.apiUsage.findFirst({
    where: and(
      eq(apiUsage.userId, userId),
      eq(apiUsage.date, today)
    ),
  });
  
  if (usage) {
    if (usage.count >= DAILY_LIMIT) {
      return false; // 上限超過
    }
    await db.update(apiUsage)
      .set({ count: usage.count + 1, updatedAt: new Date() })
      .where(eq(apiUsage.id, usage.id));
  } else {
    await db.insert(apiUsage).values({
      userId,
      date: today,
      count: 1,
    });
  }
  
  return true;
}

// server/routers.ts (改修)
transform: protectedProcedure
  .mutation(async ({ input, ctx }) => {
    // レート制限チェック
    const canProceed = await checkAndIncrementUsage(ctx.user.id);
    if (!canProceed) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: '1日の変換回数上限（100回）に達しました。明日再度お試しください。',
      });
    }
    
    // 既存の処理
    // ...
  }),
```

**期待される効果**:
- コスト爆発の防止
- 悪意のある利用の抑制

---

### S-3: タイムアウト設定の追加

**現状の問題**:
- Gemini API呼び出しにタイムアウトがない
- APIが応答しない場合、永遠に待機

**改修方針**:
1. `server/_core/llm.ts`の`invokeLLM`関数にタイムアウトを追加
2. タイムアウト時に適切なエラーを返す

**改修箇所**:
```typescript
// server/_core/llm.ts (改修)
export async function invokeLLM(params: LLMParams): Promise<LLMResponse> {
  const TIMEOUT_MS = 30000; // 30秒
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.apiKey}`,
      },
      body: JSON.stringify(params),
      signal: controller.signal, // ← タイムアウト制御
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Gemini APIがタイムアウトしました。しばらくしてから再度お試しください。');
    }
    
    throw error;
  }
}
```

**期待される効果**:
- サーバーリソースの保護
- ユーザー体験の向上

---

### S-4: XSS対策の追加

**現状の問題**:
- `client/src/pages/Reader.tsx`で変換結果をそのまま表示
- XSS攻撃のリスク

**改修方針**:
1. DOMPurifyライブラリをインストール
2. 変換結果を表示前にサニタイズ

**改修箇所**:
```bash
# インストール
pnpm add dompurify
pnpm add -D @types/dompurify
```

```typescript
// client/src/pages/Reader.tsx (改修)
import DOMPurify from 'dompurify';

export default function Reader() {
  // ...
  
  const sanitizedOutput = useMemo(() => {
    if (!transformedArticle?.output) return '';
    return DOMPurify.sanitize(transformedArticle.output, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: [],
    });
  }, [transformedArticle?.output]);
  
  return (
    <div dangerouslySetInnerHTML={{ __html: sanitizedOutput }} />
  );
}
```

**期待される効果**:
- XSS攻撃の防止
- ユーザーデータの保護

---

### S-5: CSRF対策の追加

**現状の問題**:
- tRPCエンドポイントにCSRF対策がない

**改修方針**:
1. SameSite Cookie属性を設定
2. CSRFトークンを実装（オプション）

**改修箇所**:
```typescript
// server/_core/cookies.ts (改修)
export function getSessionCookieOptions(req: Request): CookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict', // ← 追加
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };
}
```

**期待される効果**:
- CSRF攻撃の防止
- セキュリティの向上

---

## 優先度A: 1週間以内に対応すべき問題

### A-1: エラーハンドリングの改善

**改修方針**:
1. `server/transform.ts`の`transformArticle`関数にリトライロジックを追加
2. エラーケースごとに適切なメッセージを返す

**改修箇所**:
```typescript
// server/transform.ts (改修)
export async function transformArticle(input: TransformInput): Promise<TransformResult> {
  const MAX_RETRIES = 3;
  const RETRY_DELAY_MS = 1000;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const result = await invokeLLM({
        apiKey: input.apiKey,
        messages: [
          { role: 'system', content: getSystemPrompt(input.skin) },
          { role: 'user', content: input.extracted },
        ],
        temperature: input.params.temperature,
        maxOutputTokens: input.params.maxOutputTokens,
      });
      
      return {
        output: result.choices[0].message.content,
        usage: result.usage,
      };
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        // 最終試行でも失敗
        if (error.message.includes('timeout')) {
          throw new Error('Gemini APIがタイムアウトしました。記事が長すぎる可能性があります。');
        } else if (error.message.includes('rate limit')) {
          throw new Error('Gemini APIのレート制限に達しました。しばらくしてから再度お試しください。');
        } else if (error.message.includes('invalid API key')) {
          throw new Error('Gemini APIキーが無効です。設定ページで正しいAPIキーを入力してください。');
        } else {
          throw new Error('記事の変換中にエラーが発生しました。しばらくしてから再度お試しください。');
        }
      }
      
      // リトライ前に待機
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
    }
  }
}
```

**期待される効果**:
- エラー発生時のユーザー体験向上
- デバッグの容易化

---

### A-2: データベーススキーマの正規化

**改修方針**:
1. `transformHistory`テーブルから`skinName`カラムを削除
2. クエリ時に`SKINS`定数から取得

**改修箇所**:
```typescript
// drizzle/schema.ts (改修)
export const transformHistory = sqliteTable("transform_history", {
  // ...
  skin: text("skin").notNull(), // skinKeyのみ保存
  // skinNameカラムを削除
  // ...
});

// server/db.ts (改修)
export async function getUserTransformHistory(userId: string) {
  const history = await db.query.transformHistory.findMany({
    where: eq(transformHistory.userId, userId),
    orderBy: [desc(transformHistory.createdAt)],
    limit: 50,
  });
  
  // クエリ後にskinNameを追加
  return history.map(item => ({
    ...item,
    skinName: SKINS[item.skin]?.name || item.skin,
  }));
}
```

**期待される効果**:
- データ整合性の向上
- ストレージの節約

---

### A-3: 入力検証の強化

**改修方針**:
1. zodスキーマで入力を厳密に検証
2. サーバー側で再検証

**改修箇所**:
```typescript
// server/routers.ts (改修)
transform: protectedProcedure
  .input(z.object({
    extracted: z.string()
      .min(10, '記事が短すぎます。最低10文字以上入力してください。')
      .max(5000, '記事が長すぎます。5000文字以内にしてください。'),
    skin: z.string()
      .refine(key => key in SKINS, '無効なスキンが選択されています。'),
    params: z.object({
      temperature: z.number().min(0).max(2),
      topP: z.number().min(0).max(1),
      maxOutputTokens: z.number().min(50).max(2000),
      lengthRatio: z.number().min(0.6).max(1.6),
    }),
  }))
  .mutation(async ({ input, ctx }) => {
    // zodで既に検証済み
    // ...
  }),
```

**期待される効果**:
- 不正な入力の防止
- サーバーリソースの保護

---

### A-4〜A-9: その他の改善

詳細は省略しますが、以下の改善も計画に含まれます：

- **A-4**: データベースエラーの適切な処理
- **A-5**: APIキーの暗号化キー管理
- **A-6**: N+1クエリ問題の解決
- **A-7**: クライアントサイドの再レンダリング最適化
- **A-8**: テストカバレッジの向上
- **A-9**: 型安全性の向上

---

## 実装スケジュール

| 優先度 | 項目 | 実装期間 | 担当 |
|--------|------|----------|------|
| S-1 | APIキー管理改善 | 1日 | Backend |
| S-2 | レート制限実装 | 1日 | Backend |
| S-3 | タイムアウト設定 | 0.5日 | Backend |
| S-4 | XSS対策 | 0.5日 | Frontend |
| S-5 | CSRF対策 | 0.5日 | Backend |
| A-1 | エラーハンドリング | 1日 | Backend |
| A-2 | DB正規化 | 1日 | Backend |
| A-3 | 入力検証強化 | 0.5日 | Backend |
| A-4〜A-9 | その他改善 | 3日 | 全体 |

**合計**: 約9日間

---

## リスクと対策

### リスク1: 既存機能の破壊
**対策**: 各改修後に既存のテストを実行し、動作を確認

### リスク2: ユーザー体験の悪化
**対策**: レート制限などの新機能は、ユーザーフレンドリーなエラーメッセージとともに導入

### リスク3: パフォーマンスの低下
**対策**: 各改修後にパフォーマンステストを実施

---

## 結論

本リファクタリング計画は、既存のインターフェースを維持しながら、セキュリティとエラーハンドリングを大幅に改善します。段階的に実装することで、リスクを最小限に抑えながら品質を向上させることができます。
