# NewsSkins TODO

## Phase 1: データベーススキーマ設計と基本構造の構築
- [x] データベーススキーマ設計（履歴、プリセット、設定テーブル）
- [x] 基本的なtRPCルーター構造の構築

## Phase 2: 記事抽出とGemini API統合の実装
- [x] 記事抽出機能の実装（Readability系）
- [x] Gemini 1.5 Flash API統合
- [x] Source URL必須バリデーション
- [x] 基本的な変換APIエンドポイント

## Phase 3: 10種スキンシステムとパラメータ調整UIの実装
- [x] 10種スキン定義とプロンプト設計
- [x] パラメータ調整UI（温度、Top-p、出力長、要約率など）
- [x] スキン選択UI
- [x] 変換結果表示UI（Reader画面）
- [x] 原文プレビュートグル機能

## Phase 4: 履歴・比較・共有機能とPWA対応
- [x] 履歴一覧・検索機能（DBベース）
- [x] 共有機能（テキストコピー、署名URL）
- [ ] 複数スキン比較UI（将来拡張）
- [x] PWA設定（Service Worker、Share Target、manifest.json）
- [x] オフライン対応

## Phase 5: テスト・チェックポイント作成・ユーザーへの納品
- [x] Vitestテスト作成
- [x] E2Eテスト（ブラウザテスト完了）
- [x] チェックポイント作成
- [x] ユーザーへの納品

## Bug Fixes
- [x] Gemini APIモデル名を修正（gemini-1.5-flash → gemini-1.5-flash-latest）
