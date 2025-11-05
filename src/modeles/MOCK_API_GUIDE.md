# Mock API Router ガイド

このドキュメントでは、リファクタリングされた Mock API Router の使用方法を説明します。

## 概要

Mock API Router は、OpenAPI Fetch のパスをパターンマッチングして、対応するハンドラーを見つけます。これにより、以下のメリットが得られます：

✅ **パターンベースの自動マッチング**: `{parameter}` の形式でパラメータを自動抽出
✅ **スケーラビリティ**: 新しいエンドポイントの追加が簡単
✅ **メンテナンス性**: 決め打ちの if 文がなくなり、コードが読みやすい
✅ **再利用可能**: ハンドラーの実装を分離して、複数のクライアントで再利用可能

## アーキテクチャ

### ファイル構成

```
src/modeles/
├── MockApiRouter.ts         # パターンマッチング + ハンドラー管理
├── MockDataLoader.ts        # JSON/ArrayBuffer 読み込みユーティリティ
├── MockApiClient.ts         # openapi-fetch のオーバーライド実装
├── ApiClientContext.tsx     # API クライアントの Context 化
└── MOCK_API_GUIDE.md        # このドキュメント
```

### 各モジュールの役割

#### `MockApiRouter.ts`

パターンマッチングとハンドラーレジストリを管理するコア実装：

```typescript
class MockApiRouter {
  // パターン -> ハンドラーのマッピング
  private getHandlers = new Map<string, MockHandler>();

  // パターン登録
  registerGet(pattern: string, handler: MockHandler): void
  registerPost(pattern: string, handler: MockHandler): void

  // リクエスト処理
  async handleGet(path: string, query?: Record<string, any>, parseAs?: string)
  async handlePost(path: string, body?: any, query?: Record<string, any>)
}
```

**パターンマッチングの仕組み：**

1. パターン `/api/v0/projects/{id}` と URL `/api/v0/projects/123` をマッチング
2. 正規表現に変換: `/api/v0/projects/([^/]+)`
3. パラメータを抽出: `{ id: 123 }` (自動的に数値に変換)

#### `MockDataLoader.ts`

JSON/バイナリデータを読み込む汎用ユーティリティ：

```typescript
// JSON ファイルをロード
await loadMockJson<T>(path: string): Promise<T | null>

// バイナリデータをロード
await loadMockArrayBuffer(path: string): Promise<ArrayBuffer | null>

// パステンプレートを補間
interpolatePath(template: string, params: Record<string, any>): string
```

#### `MockApiClient.ts`

openapi-fetch のクライアントをオーバーライドして、ルーターを使用：

```typescript
const router = new MockApiRouter();

// ハンドラーを登録
router.registerGet('/api/v0/projects/{id}', async (params) => {
  return await loadMockJson(`/mocks/project_${params.id}.json`);
});

// openapi-fetch のメソッドをオーバーライド
client.GET = async (path: string, ...args: any[]) => {
  const data = await router.handleGet(path, query, parseAs);
  // ... レスポンス形成
};
```

## 使用方法

### 基本的な使い方

```typescript
import { createMockApiClient } from '@src/modeles/MockApiClient';
import { ApiClientProvider } from '@src/modeles/ApiClientContext';

// Mock クライアントを作成
const mockClient = createMockApiClient('/mocks/heatmap');

// Provider で接続
<ApiClientProvider createClient={() => mockClient}>
  <YourComponent />
</ApiClientProvider>
```

### 新しいエンドポイントを追加

`src/modeles/MockApiClient.ts` の `createMockApiClient()` 関数内に、ハンドラーを追加するだけです：

```typescript
// GETエンドポイント
router.registerGet('/api/v0/users/{user_id}', async (params) => {
  const userId = params.user_id;
  return await loadMockJson(`${mockDataDir}/user_${userId}.json`);
});

// クエリパラメータを使用
router.registerGet('/api/v0/events', async (_params, query) => {
  const type = query?.type;
  return await loadMockJson(`${mockDataDir}/events_${type}.json`);
});

// POSTエンドポイント
router.registerPost('/api/v0/tasks', async (_params, query, body) => {
  // body の内容をもとに適切なモックデータを返す
  return { id: 123, ...body };
});
```

### パラメータの種類

#### パスパラメータ

URL パスに含まれるパラメータ：

```typescript
// パターン: /api/v0/projects/{project_id}/sessions/{session_id}
// URL:     /api/v0/projects/1/sessions/42

router.registerGet('/api/v0/projects/{project_id}/sessions/{session_id}', async (params) => {
  console.log(params.project_id);  // 1 (自動的に数値化)
  console.log(params.session_id);  // 42 (自動的に数値化)
});
```

#### クエリパラメータ

URL の `?key=value` で渡されるパラメータ：

```typescript
// URL: /api/v0/events?type=click&limit=10

router.registerGet('/api/v0/events', async (_params, query) => {
  console.log(query?.type);   // "click" (文字列)
  console.log(query?.limit);  // "10" (文字列 - 手動で変換が必要)
});
```

#### リクエストボディ

POST/PATCH リクエストのボディ：

```typescript
router.registerPost('/api/v0/tasks', async (_params, query, body) => {
  console.log(body);  // { title: "...", description: "..." }
});
```

#### parseAs パラメータ

バイナリデータなど、特殊な形式の取得時に使用：

```typescript
router.registerGet('/api/v0/heatmap/map_data/{map_name}', async (params, query, body, parseAs) => {
  if (parseAs === 'arrayBuffer') {
    return await loadMockArrayBuffer(`${mockDataDir}/maps/${params.map_name}`);
  }
  return await loadMockJson(`${mockDataDir}/maps/${params.map_name}.json`);
});
```

## パステンプレートの補間

複数のパラメータを含むファイルパスの場合、`interpolatePath()` が便利です：

```typescript
// 手動で各パラメータを指定する代わりに:
const projectId = params.project_id;
const sessionId = params.session_id;
const fileName = `project_${projectId}_session_${sessionId}.json`;

// こう書ける:
const fileName = interpolatePath('project_{project_id}_session_{session_id}.json', params);
```

## エラーハンドリング

ハンドラーが例外をスローした場合は、`client.GET/POST` で自動的にキャッチされます：

```typescript
try {
  const data = await router.handleGet(path, query, parseAs);
} catch (error) {
  console.warn(`Mock API error for GET ${path}:`, error);
  return {
    data: null,
    error: { message: String(error) },
    response: new Response(),
  };
}
```

## 既知のパターン

### 完全なエンドポイント一覧

現在、以下のエンドポイントが登録されています：

**GET:**
- `/api/v0/heatmap/tasks/{task_id}` - Heatmap Task 詳細
- `/api/v0.1/projects/{project_id}/maps` - Project Maps
- `/api/v0/heatmap/map_data/{map_name}` - Heatmap Map Data (JSON/Binary)
- `/api/v0/general_log/position/keys` - Position Keys (クエリパラメータ対応)
- `/api/v0/projects/{id}/general_log/position/{event_type}` - Event Logs
- `/api/v0/projects/{project_id}/play_session/{session_id}/general_log/position/{event_type}` - Session Event Logs
- `/api/v0/projects/{id}` - Project 詳細
- `/api/v0/projects/{project_id}/play_session/{session_id}/field_object_log` - Field Object Logs

**POST:**
- `/api/v0/heatmap/projects/{project_id}/tasks` - Create Heatmap Task (Project-level)
- `/api/v0/heatmap/projects/{project_id}/play_session/{session_id}/tasks` - Create Heatmap Task (Session-level)

## Mock データの構造

Mock データは以下のディレクトリ構造を想定しています：

```
public/mocks/heatmap/
├── project_1.json
├── project_1_maps.json
├── task_123.json
├── project_1_keys.json
├── project_1_session_42_keys.json
├── project_1_event_click.json
├── project_1_session_42_event_click.json
├── create_task_project_1.json
├── maps/
│   ├── map_data_1
│   ├── map_data_1.json
│   └── ...
└── ...
```

## デバッグのヒント

1. **パターンマッチエラー**: コンソールに `No {METHOD} handler for path: ...` というエラーが出た場合、パターンが登録されていない可能性があります
2. **ファイルが見つからない**: ブラウザ DevTools の Network タブで、期待していないパスへのリクエストが発生していないか確認してください
3. **パラメータ値が異なる**: 数値は自動的に変換されますが、クエリパラメータは文字列のままです（必要に応じて手動で変換）

## Future Improvements

- [ ] PATCH/DELETE メソッドの実装例を追加
- [ ] より複雑なクエリパラメータのマッチング（複数値など）
- [ ] モック遅延（ネットワーク遅延をシミュレート）
- [ ] ハンドラーのホットリロード機能
