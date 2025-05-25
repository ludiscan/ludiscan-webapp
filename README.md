# ludiscan-webapp

分析ツールのwebapp

## 開発環境

- Node.js: 23.6.x
- npm: 10.x

## セットアップ

```bash
fnm use
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## デプロイ

このプロジェクトはAWS Amplifyでデプロイを管理しています。

### ブランチ戦略

- `main`: デフォルトブランチ
  - 手動デプロイが可能
  - 開発環境として使用

- `deploy`: 本番環境用ブランチ
  - プッシュ時に自動デプロイ
  - 本番環境として使用

### デプロイフロー

1. 開発は`main`ブランチで行います
2. 本番or開発環境へのデプロイは以下のいずれかの方法で行います：
   - `main`ブランチから手動デプロイ
   - `deploy`ブランチへのプッシュで自動デプロイ

## 利用可能なスクリプト

```bash
# 開発サーバーの起動
npm run dev

# ビルド
npm run build:dev  # 開発環境用
npm run build:prod # 本番環境用

# リント
npm run lint
npm run fix

# テスト
npm run test

# 型チェック
npm run type
```

