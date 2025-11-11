/**
 * Mock API用のパターンマッチング・ルーター
 * OpenAPI Fetchのパスを解析して対応するハンドラーを見つける
 */

type PathParams = Record<string, string | number | undefined>;

export interface MockRouteMatch {
  pattern: string;
  params: PathParams;
}

/**
 * パス文字列（例: `/api/v0/heatmap/tasks/{task_id}`）を正規表現に変換
 * パラメータ名を抽出して返す
 */
function parsePathPattern(pattern: string): { regex: RegExp; paramNames: string[] } {
  const paramNames: string[] = [];
  const regexPattern = pattern.replace(/{(\w+)}/g, (_, paramName) => {
    paramNames.push(paramName);
    return '([^/]+)'; // パラメータ値にスラッシュは含めない
  });

  return {
    regex: new RegExp(`^${regexPattern}$`),
    paramNames,
  };
}

/**
 * URLパスを複数のパターンに対してマッチングし、
 * マッチしたパターンと抽出されたパラメータを返す
 */
export function matchPath(urlPath: string, patterns: string[]): MockRouteMatch | null {
  for (const pattern of patterns) {
    const { regex, paramNames } = parsePathPattern(pattern);
    const match = urlPath.match(regex);

    if (match) {
      const params: PathParams = {};
      for (let i = 0; i < paramNames.length; i++) {
        const value = match[i + 1];
        // 数値に変換できるなら数値に、そうでなければ文字列として保存
        params[paramNames[i]] = isNaN(Number(value)) ? value : Number(value);
      }

      return {
        pattern,
        params,
      };
    }
  }

  return null;
}

/**
 * Mock APIハンドラーの基本シグネチャ
 */
export interface MockHandler {
  (params: PathParams, query?: Record<string, unknown>, body?: unknown, parseAs?: string): Promise<unknown> | unknown;
}

/**
 * Mock APIルーター
 * パターン -> ハンドラーのマッピングを管理
 */
export class MockApiRouter {
  private getHandlers = new Map<string, MockHandler>();
  private postHandlers = new Map<string, MockHandler>();
  private patchHandlers = new Map<string, MockHandler>();
  private deleteHandlers = new Map<string, MockHandler>();

  /**
   * GETハンドラーを登録
   */
  registerGet(pattern: string, handler: MockHandler): void {
    this.getHandlers.set(pattern, handler);
  }

  /**
   * POSTハンドラーを登録
   */
  registerPost(pattern: string, handler: MockHandler): void {
    this.postHandlers.set(pattern, handler);
  }

  /**
   * PATCHハンドラーを登録
   */
  registerPatch(pattern: string, handler: MockHandler): void {
    this.patchHandlers.set(pattern, handler);
  }

  /**
   * DELETEハンドラーを登録
   */
  registerDelete(pattern: string, handler: MockHandler): void {
    this.deleteHandlers.set(pattern, handler);
  }

  /**
   * GETリクエストを処理
   */
  async handleGet(path: string, query?: Record<string, unknown>, parseAs?: string): Promise<unknown> {
    const match = matchPath(path, Array.from(this.getHandlers.keys()));
    if (!match) {
      throw new Error(`No GET handler for path: ${path}`);
    }

    const handler = this.getHandlers.get(match.pattern)!;
    return handler(match.params, query, undefined, parseAs);
  }

  /**
   * POSTリクエストを処理
   */
  async handlePost(path: string, body?: unknown, query?: Record<string, unknown>): Promise<unknown> {
    const match = matchPath(path, Array.from(this.postHandlers.keys()));
    if (!match) {
      throw new Error(`No POST handler for path: ${path}`);
    }

    const handler = this.postHandlers.get(match.pattern)!;
    return handler(match.params, query, body);
  }

  /**
   * PATCHリクエストを処理
   */
  async handlePatch(path: string, body?: unknown, query?: Record<string, unknown>): Promise<unknown> {
    const match = matchPath(path, Array.from(this.patchHandlers.keys()));
    if (!match) {
      throw new Error(`No PATCH handler for path: ${path}`);
    }

    const handler = this.patchHandlers.get(match.pattern)!;
    return handler(match.params, query, body);
  }

  /**
   * DELETEリクエストを処理
   */
  async handleDelete(path: string, query?: Record<string, unknown>): Promise<unknown> {
    const match = matchPath(path, Array.from(this.deleteHandlers.keys()));
    if (!match) {
      throw new Error(`No DELETE handler for path: ${path}`);
    }

    const handler = this.deleteHandlers.get(match.pattern)!;
    return handler(match.params, query);
  }
}
