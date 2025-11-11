---
group: project
title: アーキテクチャ
order: 3
description: プロジェクトの設計思想とディレクトリ構造
---

# アーキテクチャ

ludiscan-webappの設計思想とアーキテクチャについて説明します。

## 設計思想

### レイヤードアーキテクチャ

プロジェクトは以下のレイヤーで構成されています：

1. **ルーティング層** (`pages/`): Next.jsのSSRとAPIルート
2. **プレゼンテーション層** (`src/component/`): 再利用可能なUIコンポーネント
3. **ビジネスロジック層** (`src/features/`): 機能固有のロジック
4. **データアクセス層** (`src/modeles/`): APIクライアントとデータモデル
5. **状態管理層** (`src/slices/`): グローバル状態管理

### 主要な設計原則

- **単一責任の原則**: 各コンポーネントは1つの責務のみを持つ
- **Atomic Design**: UIコンポーネントを段階的に組み立てる
- **型安全性**: TypeScriptによる厳密な型チェック
- **関心の分離**: サーバー状態とクライアント状態を明確に分離

## ディレクトリ構造

```
ludiscan-webapp/
├── pages/                    # Next.jsルーティング
│   ├── index.page.tsx        # トップページ
│   ├── login/                # 認証ページ
│   ├── heatmap/              # ヒートマップページ
│   │   └── docs/             # ドキュメントページ
│   ├── profile/              # プロフィールページ
│   └── api/                  # APIルート
│
├── src/
│   ├── component/            # UIコンポーネント（Atomic Design）
│   │   ├── atoms/            # 基本的なUI要素
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Text/
│   │   │   └── Flex/
│   │   ├── molecules/        # Atomsの組み合わせ
│   │   │   ├── Modal/
│   │   │   ├── Card/
│   │   │   └── Form/
│   │   ├── organisms/        # 複雑なコンポーネント
│   │   │   ├── Sidebar/
│   │   │   ├── Toolbar/
│   │   │   └── EventLog/
│   │   └── templates/        # ページレベルレイアウト
│   │       ├── Header/
│   │       └── SidebarLayout/
│   │
│   ├── features/             # 機能別コンポーネント
│   │   ├── heatmap/          # ヒートマップ可視化
│   │   │   ├── HeatmapViewer.tsx
│   │   │   ├── HeatmapCanvas.tsx
│   │   │   └── HeatmapDataService.ts
│   │   ├── auth/             # 認証機能
│   │   └── docs/             # ドキュメント表示
│   │
│   ├── hooks/                # カスタムReact Hooks
│   │   ├── useAuth.ts        # 認証フック
│   │   ├── useGeneral.ts     # 汎用フック
│   │   ├── useSharedTheme.ts # テーマフック
│   │   └── createSlicePatchHook.ts
│   │
│   ├── slices/               # Redux Toolkit slices
│   │   ├── authSlice.ts      # 認証状態
│   │   ├── heatmapCanvasSlice.ts  # Canvas設定
│   │   └── selectionSlice.ts # 選択状態
│   │
│   ├── modeles/              # データモデルとAPI
│   │   ├── query.ts          # APIクライアント作成
│   │   ├── models.ts         # モデル定義
│   │   ├── project.ts        # プロジェクトモデル
│   │   ├── session.ts        # セッションモデル
│   │   ├── user.ts           # ユーザーモデル
│   │   └── heatmaptask.ts    # ヒートマップタスク
│   │
│   ├── utils/                # ユーティリティ
│   │   ├── heatmap/          # ヒートマップ関連
│   │   ├── docs/             # ドキュメントシステム
│   │   ├── canvasEventBus.ts # イベントバス
│   │   ├── localstrage.ts    # ローカルストレージ
│   │   ├── color.ts          # カラーユーティリティ
│   │   └── vql.ts            # VQL（クエリ言語）
│   │
│   ├── styles/               # グローバルスタイル
│   │   └── style.ts          # テーマ定義
│   │
│   ├── config/               # 設定
│   │   └── env.ts            # 環境変数
│   │
│   ├── types/                # 型定義
│   │   └── index.ts
│   │
│   └── @types/               # グローバル型拡張
│
├── @generated/               # 自動生成ファイル
│   └── api.d.ts              # API型定義
│
├── public/                   # 静的ファイル
│
└── amplify.yml               # デプロイ設定
```

## 主要コンポーネント

### HeatmapViewer (`src/features/heatmap/HeatmapViewer.tsx`)

ヒートマップの可視化を担当するメインコンポーネント。

**責務:**
- 3D/2Dマップの表示管理
- タイムライン制御
- イベントログの管理
- データエクスポート

**使用技術:**
- Three.js (`@react-three/fiber`)
- Canvas API
- HeatmapDataService

### HeatmapDataService

ヒートマップデータの操作を担当するサービスクラス。

**提供機能:**
- データの読み込み
- フィルタリング
- タイムスライス処理
- イベントログ管理

### SidebarLayout (`src/component/templates/SidebarLayout.tsx`)

アプリケーション全体のレイアウトを提供するテンプレート。

**機能:**
- サイドバーナビゲーション
- レスポンシブデザイン
- ルーティング統合

## 状態管理

### Redux Store構造

```typescript
store: {
  auth: {
    user: User | null
    token: string | null
    isAuthenticated: boolean
  },
  heatmapCanvas: {
    dimensionality: '2D' | '3D'
    eventLogs: EventLog[]
    timeRange: TimeRange
    // その他Canvas設定
  },
  selection: {
    selectedObjects: Object3D[]
    inspectorOpen: boolean
  }
}
```

### TanStack Query（React Query）

サーバー状態の管理に使用。

**キャッシュ戦略:**
- デフォルトstaleTime: 5分
- クエリキーによる自動無効化
- Optimistic Updates対応

**主なクエリ:**
- `useProjects()`: プロジェクト一覧
- `useSessions()`: セッション一覧
- `useHeatmapData()`: ヒートマップデータ

## API通信

### APIクライアント

`src/modeles/query.ts:createClient()`で作成。

**特徴:**
- openapi-fetchによる型安全なリクエスト
- 自動認証ヘッダー付与
- エラーハンドリング

**使用例:**

```typescript
import { createClient } from '@src/modeles/query'

const client = createClient()

// GET request
const { data, error } = await client.GET('/api/projects')

// POST request
const { data, error } = await client.POST('/api/projects', {
  body: { name: 'New Project' }
})
```

### 型定義

`@generated/api.d.ts`から自動生成される型を使用。

```typescript
import type { components } from '@generated/api'

type Project = components['schemas']['Project']
type Session = components['schemas']['Session']
```

## スタイリング

### Emotionの使用

**必須ルール:**
- HTMLタグに直接スタイルを書かない
- 必ず`styled(Component)`パターンを使用

**正しい例:**

```typescript
import styled from '@emotion/styled'

const StyledButton = styled.button`
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.colors.primary.main};
`
```

**誤った例（避けるべき）:**

```typescript
// ❌ インラインスタイルは使わない
<button style={{ padding: '8px 16px' }}>Click</button>
```

### テーマ定義

`src/styles/style.ts`で定義。

```typescript
export const theme = {
  colors: {
    primary: { main: '#...', dark: '#...' },
    secondary: { main: '#...' },
    text: '#...',
    error: '#...'
  },
  zIndexes: {
    modal: 1000,
    sidebar: 100,
    // ...
  },
  dimensions: {
    sidebarWidth: '250px',
    headerHeight: '60px'
  }
}
```

## イベントシステム

### Canvas Event Bus

`src/utils/canvasEventBus.ts`でクロスコンポーネント通信を実現。

**イベント:**
- `click-menu-icon`: メニューアイコンクリック
- `click-event-log`: イベントログクリック

**使用例:**

```typescript
import { canvasEventBus } from '@src/utils/canvasEventBus'

// イベント発火
canvasEventBus.emit('click-menu-icon', { id: 'settings' })

// イベント購読
canvasEventBus.on('click-menu-icon', (data) => {
  console.log('Menu clicked:', data)
})
```

## パフォーマンス最適化

### Three.js最適化

- **PerformanceMonitor**: 動的にdprを調整
- **Memoization**: 不要な再レンダリング防止
- **Frustum Culling**: 画面外オブジェクトの非表示

### Next.js最適化

- **Standalone output**: 最小限のビルドサイズ
- **ISR (Incremental Static Regeneration)**: 静的生成 + 動的更新
- **Dynamic Imports**: コード分割

## テスト戦略

### ユニットテスト

- Jestを使用
- ユーティリティ関数を中心にテスト
- 例: `src/utils/flattenObject.test.ts`

### コンポーネントテスト

- Storybookでビジュアルテスト
- `test-storybook`で自動テスト

### 推奨テストパターン

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // テストコード
  })

  it('should handle user interaction', () => {
    // インタラクションテスト
  })
})
```

## 次のステップ

- [開発ガイドライン](/heatmap/docs/project/guidelines)でコーディング規約を確認
- [API連携ガイド](/heatmap/docs/project/api-integration)でAPI通信の詳細を学ぶ
