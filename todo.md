# NewsSkins TODO

## 緊急: 変換結果が空白で表示される問題の修正

### Phase 1: Gemini APIレスポンス構造の調査
- [x] Google Generative AI SDKの公式ドキュメントを確認
- [x] `response.text()` が存在するか確認
- [x] 正しいレスポンス構造（`response.text` プロパティ）を特定

### Phase 2: Gemini APIレスポンス構造の修正
- [x] @google/generative-aiから@google/genaiにパッケージを変更
- [x] transform.tsの `response.text()` を `response.text` プロパティに修正
- [x] systemInstructionをconfigの中に移動
- [x] エラーハンドリングを強化（レスポンスが空の場合の処理）
- [x] デバッグログを追加して実際のレスポンス構造を確認

### Phase 3: UIをシンプル化（URL・タイトル削除）
- [x] Home.tsxから記事URL入力欄を削除
- [x] Home.tsxから記事タイトル入力欄を削除
- [x] transform APIのリクエスト構造を変更（url, title, site, langを任意に）
- [x] Reader.tsxから元記事URLリンクを削除

### Phase 4: NEWSSKINSクレジット表示を追加
- [x] transform.tsで出力結果の最後に「\n\n[NEWSSKINS]」を追加
- [x] Reader.tsxでSource URL表示を完全に削除

### Phase 5: テストとチェックポイント作成
- [x] transform.test.tsを更新して新しいAPI構造をテスト
- [x] すべてのテストが通ることを確認
- [ ] ブラウザで実際に変換をテストして動作確認
- [ ] 複数のスキンで変換結果が正しく表示されるか確認
- [ ] チェックポイント作成

## 完了済み機能
- [x] データベーススキーマ設計（履歴、プリセット、設定テーブル）
- [x] 基本的なtRPCルーター構造の構築
- [x] 記事抽出機能の実装（Readability系）
- [x] Gemini 2.5 Flash API統合
- [x] Source URL必須バリデーション
- [x] 基本的な変換APIエンドポイント
- [x] 10種スキン定義とプロンプト設計
- [x] パラメータ調整UI（温度、Top-p、出力長、要約率など）
- [x] スキン選択UI
- [x] 変換結果表示UI（Reader画面）
- [x] 原文プレビュートグル機能
- [x] PWA設定（Service Worker、Share Target、manifest.json）
- [x] オフライン対応
- [x] Vitestテスト作成
- [x] 元記事URLを必須から任意項目に変更（*マークを削除）
- [x] URLが未入力の場合、Source表示と「元記事を開く」ボタンを非表示
- [x] ガイドページコンポーネントを作成（/guide）
- [x] 詳細設定の各パラメータを分かりやすく説明
- [x] 各スキンの特徴と使い方を説明
- [x] 実例を交えた使い方ガイド
- [x] 変換結果のURL共有機能（24時間有効な署名URL）
- [x] ShareLinksテーブルへの保存機能
- [x] 共有URLからの閲覧機能（/share/:id）
- [x] テキストコピー機能の改善
- [x] 変換結果をtransformHistoryテーブルに保存
- [x] 履歴一覧ページで過去の変換結果を表示
- [x] 設定ページでAPIキーを保存する機能
- [x] userSettingsテーブルへの暗号化保存
- [x] HomeページでAPIキーを自動入力
- [x] settings.get APIがundefinedを返すエラーを修正
- [x] 設定が存在しない場合はデフォルト値を返すように変更
- [x] Reader.tsxの「Rendered more hooks than during the previous render」エラーを修正
- [x] 条件分岐の中でフックを呼び出さないようにコードを修正

## スキン品質改善タスク

### Phase 1: テスト記事を準備してGemini APIで変換テストを実行
- [x] テスト用の記事サンプルを準備
- [x] Gemini APIキーを使って実際に変換テストを実行
- [x] 変換結果が正しく表示されるか確認
- [x] response.textの取得方法を修正
- [x] gemini-2.0-flashにモデルを変更して内部思考トークンの問題を解決

### Phase 2: 複数のスキン（関西ノリ風、冷めた文学風など）で変換品質を評価
- [x] 関西ノリ風スキンで変換して品質を評価
- [x] 冷めた文学風スキンで変換して品質を評価
- [x] その他のスキン（おじさんメール風、詩的エモ風など）でも変換テスト
- [x] 各スキンの問題点や改善点をリストアップ
- [x] skin-quality-analysis.mdに詳細な分析レポートを作成

### Phase 3: 改善点を特定してスキン定義やプロンプトを調整
- [x] 関西ノリ風のfewShotsを1つから3つに増やしました
- [x] おじさん構文風のfewShotsを1つから2つに増やしました
- [x] 詩的エモ風のfewShotsを1つから2つに増やしました
- [x] スキン定義のrulesとdoListをより具体的に修正
- [x] 改善後のテストでA-B-A'構造が明確になったことを確認

### Phase 4: 改善後の変換結果を確認してチェックポイント作成
- [x] 改善後の変換結果を確認
- [x] すべてのスキンで品質が向上したか検証
- [ ] チェックポイント作成

## タイトル変更とGitHubプッシュ

- [x] タイトルを「NEWSSKINS」から「言い換えメーカー」に変更
- [x] manifest.jsonのアプリ名を変更
- [x] vite.config.tsのアプリ名を変更
- [x] client/index.htmlのタイトルを変更
- [x] Home.tsx, Guide.tsx, Share.tsxのタイトルを変更
- [x] チェックポイント作成
- [x] GitHubに新規リポジトリを作成 (https://github.com/kojima1459/iikae-maker)
- [x] コードをGitHubにプッシュ
- [x] コードをZIPで送付 (iikae-maker.zip, 295KB)

## フィードバック機能の実装

### Phase 1: データベース設計案を作成
- [x] フィードバックテーブルの設計
- [x] 分析用のビューやクエリの設計
- [x] 設計ドキュメントの作成 (feedback-database-design.md)

### Phase 2: データベーススキーマを実装
- [x] feedbackテーブルをschema.tsに追加
- [x] マイグレーションを実行（pnpm db:push）
- [x] データベース接続を確認

### Phase 3: フィードバック機能のAPIを実装
- [x] feedback.submit APIを実装（フィードバック送信）
- [x] feedback.stats APIを実装（統計情報取得）
- [x] feedback.list APIを実装（フィードバック一覧取得）
- [x] db.tsにsubmitFeedback, getFeedbackStats, getFeedbackListを追加
- [x] routers.tsにfeedbackルーターを追加

### Phase 4: フィードバックUIを実装
- [ ] Reader.tsxに「良い」「悪い」ボタンを追加
- [ ] フィードバック送信後のトースト通知を実装
- [ ] フィードバック済みの状態管理を実装

### Phase 5: 分析ダッシュボードを実装
- [ ] 管理者用の分析ページを作成
- [ ] スキン別の評価統計を表示
- [ ] 評価が低いスキンをハイライト表示

### Phase 6: テストとチェックポイント作成
- [ ] フィードバック機能のテストを実行
- [ ] チェックポイント作成

## スキンを面白おかしく改善

### Phase 1: 現在のスキンを分析して改善点を特定
- [x] 各スキンの現在の特徴を分析
- [x] より笑えるようにするための改善点をリスト化
- [x] skin-humor-improvement-plan.mdに詳細な改善計画を作成

### Phase 2: 全スキンをより面白く、笑えるように改善
- [x] 関西ノリ風をより笑えるように改善（誇張表現、具体的な比喩）
- [x] おじさん構文風をより笑えるように改善（不要な自分語り、謎のカタカナ語）
- [x] 詩的エモ風をより笑えるように改善（シュールな擬人化、過剰なポエム）
- [x] デタッチ文学風をより笑えるように改善（非論理的な比喩、唐突な日常描写）
- [x] 意味深セーフ大人風をより笑えるように改善（二重の意味、「...」の活用）

### Phase 3: 改善後のスキンでテストを実行
- [x] Gemini APIで変換テストを実行
- [x] 笢えるかどうかを評価
- [x] おじさん構文風が非常に笑えることを確認（⭐⭐⭐⭐⭐）
- [x] 詩的エモ風がシュールで面白いことを確認（⭐⭐⭐⭐）
- [x] skin-humor-test-results.mdにテスト結果を記録

### Phase 4: チェックポイント作成
- [x] チェックポイント作成 (version: 80299689)

## 新しいスキンの追加

### Phase 1: 新しいスキンの定義を作成
- [x] 若者言葉風（Z世代）のスキン定義を作成
- [x] ラップ風のスキン定義を作成
- [x] 学術論文風のスキン定義を作成
- [x] new-skins-definition.mdに詳細な定義を記録

### Phase 2: skins.tsに3つのスキンを追加
- [x] skins.tsに若者言葉風（Z世代）を追加
- [x] skins.tsにラップ風を追加
- [x] skins.tsに学術論文風を追加

### Phase 3: Gemini APIでテストを実行
- [x] 3つの新しいスキンでGemini APIテストを実行
- [x] 変換品質を評価
- [x] 若者言葉風（Z世代）が非常に良い（⭐⭐⭐⭐⭐）
- [x] ラップ風が非常に良い（⭐⭐⭐⭐⭐）
- [x] 学術論文風が良い（⭐⭐⭐⭐）
- [x] new-skins-test-results.mdにテスト結果を記録

### Phase 4: チェックポイント作成とGitHubプッシュ
- [ ] チェックポイント作成
- [ ] GitHubにプッシュ
