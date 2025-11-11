# ludiscan-webapp

[![Covered by Argos Visual Testing](https://argos-ci.com/badge.svg)](https://app.argos-ci.com/bird9-yuhi/ludiscan-webapp/reference)

分析ツールのwebapp

## 開発環境

- Node.js: 24.9.x
- Bun: 1.3.x

### セットアップ

```bash
# Bunのインストール (Homebrew)
brew install bun

# 依存関係のインストール
bun install

# 開発サーバーの起動
bun run dev
```

### API スキーマファイルの生成
- `swagger.json` を rootに配置し以下を実行する
```bash
bun run generate:api-schemes
```

### Storybook 起動

```bash
bun run storybook
```

## 開発・運用方針

### 依存パッケージ

使用するライブラリやパッケージは十分に運用実績があり, 今後も継続的なメンテナンスが見込まれるものを導入する.
現時点では, 以下のフレームワーク・ライブラリを導入しています (主なものを以下に記載しています)

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [TanStack Query](https://tanstack.com/query/latest) (旧 React Query)
- [Emotion](https://emotion.sh/docs/introduction)
- [three.js](https://threejs.org/)

### Emotion によるスタイリング

[HTMLElement に対してスタイリングする](https://emotion.sh/docs/styled#styling-elements-and-components)実装は使用しません.  
HTML タグがわかりづらい, 機能をもったコンポーネントと識別がしづらいなどがあげられます.

[コンポーネントに対してスタイリングする](https://emotion.sh/docs/styled#styling-any-component)実装を採用しています.

[styled-components の使用ルールを定める | styled-componentsの採用と既存資産を捨てた理由](https://blog.cybozu.io/entry/2020/06/25/105457)

### ブランチ戦略

- `develop`: デフォルトブランチ
  - 手動デプロイが可能
  - 開発環境として使用

- `main`: 本番環境用ブランチ
  - プッシュ時に自動デプロイ
  - 本番環境として使用


## デプロイ

このプロジェクトはAWS Amplifyでデプロイを管理しています。

build設定は`amplify.yml`に記載されてい流ものが実行されます.  

### デプロイフロー

1. 開発は`develop`ブランチで行います
2. 本番or開発環境へのデプロイは以下のいずれかの方法で行います：
   - `develop`ブランチから手動デプロイ
   - `main`ブランチへのプッシュで自動デプロイ
