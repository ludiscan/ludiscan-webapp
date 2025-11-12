---
group: project
title: プロジェクト概要
order: 1
description: ludiscan-webappの全体像と目的
public: false
---

# ludiscan-webapp プロジェクト概要

## プロジェクトについて

**ludiscan-webapp**は、ゲームプレイデータを3D/2Dヒートマップで可視化するためのWebアプリケーションです。プレイヤーの移動パターンやゲーム内イベントをインタラクティブな3Dマップ上に重ねて表示し、データ分析を支援します。

## 主な機能

### データ可視化
- **3D/2Dヒートマップ表示**: プレイヤーの行動データをヒートマップとして可視化
- **リアルタイム描画**: Three.jsを使用した高速なレンダリング
- **対応フォーマット**: OBJ、GLTF、GLBなどの3Dモデルに対応
- **タイムライン機能**: 時系列データの再生とスクラブ操作

### プロジェクト管理
- **プロジェクト/セッション管理**: 複数のゲームセッションを整理
- **認証システム**: ユーザー認証とアクセス管理
- **APIキー管理**: セキュアなAPI連携

### データエクスポート
- **可視化データのエクスポート**: イベントログと共にデータを出力
- **カスタマイズ可能**: 表示設定を保存・共有

## 技術スタック

### フロントエンド
- **Next.js 15**: Reactベースのフルスタックフレームワーク
- **TypeScript**: 型安全な開発
- **Emotion**: CSS-in-JSスタイリング
- **Three.js + @react-three/fiber**: 3Dレンダリング

### 状態管理
- **Redux Toolkit**: グローバル状態管理（認証、Canvas設定、選択状態）
- **TanStack Query (React Query)**: サーバー状態管理とキャッシング

### API通信
- **openapi-fetch**: OpenAPI仕様から自動生成されたAPIクライアント
- **自動型生成**: swagger.jsonから型定義を生成

### 開発ツール
- **Bun**: 高速なJavaScriptランタイム
- **Jest**: ユニットテスト
- **Storybook**: コンポーネント開発・ドキュメント
- **ESLint & Stylelint**: コード品質管理
- **Prettier**: コードフォーマッティング

## プロジェクト構成

```
ludiscan-webapp/
├── pages/               # Next.jsルーティング（SSR）とAPIルート
├── src/
│   ├── component/       # 再利用可能なUIコンポーネント（Atomic Design）
│   ├── features/        # 機能別コンポーネント（heatmap, authなど）
│   ├── hooks/           # カスタムReact Hooks
│   ├── slices/          # Redux Toolkit slices
│   ├── utils/           # ユーティリティ関数
│   ├── modeles/         # APIクライアントとデータモデル
│   ├── styles/          # グローバルスタイル・テーマ
│   ├── config/          # 環境設定
│   ├── types/           # 型定義
│   └── docs/            # ドキュメント（本ファイル含む）
├── public/              # 静的ファイル
├── amplify.yml          # AWS Amplify設定
└── CLAUDE.md            # AI開発アシスタント向けガイド
```

## 開発ブランチ戦略

- **develop**: 開発用デフォルトブランチ（手動デプロイ）
- **main**: 本番環境（pushで自動デプロイ）

## デプロイ環境

- **AWS Amplify**: 自動ビルド・デプロイ
- **Next.js Standalone**: 最適化された本番ビルド

## ライセンスと利用

このプロジェクトは社内ツールとして開発されています。詳細な利用規約については管理者にお問い合わせください。

## 次のステップ

- [開発環境のセットアップ](/heatmap/docs/project/setup)を参照して開発を始める
- [アーキテクチャドキュメント](/heatmap/docs/project/architecture)で詳細な設計を理解する
- [開発ガイドライン](/heatmap/docs/project/guidelines)でコーディング規約を確認する