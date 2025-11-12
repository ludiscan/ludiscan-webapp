---
group: project
title: 開発環境セットアップ
order: 2
description: 開発を始めるための環境構築手順
public: false
---

# 開発環境セットアップ

このガイドでは、ludiscan-webappの開発環境を構築する手順を説明します。

## 必要な環境

### 必須ツール
- **Bun**: JavaScript/TypeScriptランタイム（推奨：最新版）
- **Node.js**: v18以上（Bunがサポートする範囲）
- **Git**: バージョン管理

### 推奨ツール
- **VSCode**: エディタ（ESLint、Prettier拡張機能推奨）
- **Storybook**: コンポーネント開発

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd ludiscan-webapp
```

### 2. 依存関係のインストール

Bunを使用して依存関係をインストールします：

```bash
bun install
```

### 3. 環境変数の設定

プロジェクトルートに `.env.local` ファイルを作成し、必要な環境変数を設定します：

```env
# API endpoint
NEXT_PUBLIC_API_URL=http://localhost:3211

# 認証設定（必要に応じて）
NEXT_PUBLIC_AUTH_DOMAIN=
NEXT_PUBLIC_AUTH_CLIENT_ID=

# その他の環境変数
NEXT_PUBLIC_APP_ENV=development
```

環境変数の詳細は管理者またはチームリードに確認してください。

### 4. APIスキーマの生成（オプション）

APIの型定義を最新化する場合：

```bash
# swagger.jsonをプロジェクトルートに配置してから実行
bun run generate:api-schemes

# またはローカルAPIサーバーから直接取得
bun run generate:api-schemes:local-fetch
```

これにより `@generated/api.d.ts` ファイルが生成されます。

## 開発サーバーの起動

### 標準モード

```bash
bun run dev --turbopack -p 5173
```

開発サーバーが起動し、`http://localhost:5173` でアクセスできます。

**注意**: Turbopackを使用することで高速なHMR（Hot Module Replacement）が有効になります。

### Storybookの起動

コンポーネント開発にはStorybookを使用します：

```bash
bun run storybook
```

Storybookは `http://localhost:6006` で起動します。

## 開発コマンド一覧

### ビルド関連

```bash
# 本番用ビルド
bun run build:prod

# 開発用ビルド（Turbopack使用）
bun run build:dev --turbopack

# 本番サーバー起動
bun run start
```

### コード品質管理

```bash
# Lint実行（ESLint + Stylelint）
bun run lint

# Lint自動修正
bun run fix

# Prettierフォーマットチェック
bun run format:check

# Prettier自動フォーマット
bun run format

# TypeScript型チェック
bun run type
```

### テスト

```bash
# 全テスト実行
bun run test

# 特定のテストファイルを実行
bun run test -- src/__tests__/path/to/file.test.ts

# Storybookテスト
bun run test-storybook
```

### その他

```bash
# ヒートマップバンドルのビルド
bun run build:heatmap-bundle

# リリース（バージョン管理）
bun run release:patch    # パッチバージョン
bun run release:minor    # マイナーバージョン
bun run release:major    # メジャーバージョン
```

## よくある問題と解決方法

### ポート5173が既に使用されている

別のポートを指定して起動します：

```bash
bun run dev --turbopack -p 3000
```

### 依存関係のエラー

依存関係を再インストール：

```bash
rm -rf node_modules bun.lockb
bun install
```

### API型定義の不一致

APIスキーマを再生成：

```bash
bun run generate:api-schemes
```

### TypeScriptエラーが多発

型チェックでエラー箇所を確認：

```bash
bun run type
```

## 推奨エディタ設定

### VSCode拡張機能

- ESLint
- Prettier - Code formatter
- Stylelint
- TypeScript Vue Plugin (Volar)
- GitLens

### VSCode設定例 (`.vscode/settings.json`)

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.fixAll.stylelint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

## 次のステップ

開発環境が整ったら、以下のドキュメントを参照して開発を進めましょう：

- [アーキテクチャドキュメント](/heatmap/docs/project/architecture)
- [開発ガイドライン](/heatmap/docs/project/guidelines)
- [API連携ガイド](/heatmap/docs/project/api-integration)