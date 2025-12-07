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
- [ ] チェックポイント作成
- [ ] GitHubに新規リポジトリを作成
- [ ] コードをGitHubにプッシュ
- [ ] コードをZIPで送付
