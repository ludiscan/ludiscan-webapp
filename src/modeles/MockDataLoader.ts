/**
 * Mock データの読み込みユーティリティ
 */

/**
 * JSONファイルをロード
 */
export async function loadMockJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load mock data from ${path}:`, error);
    return null;
  }
}

/**
 * ArrayBuffer（バイナリデータ）をロード
 */
export async function loadMockArrayBuffer(path: string): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch(path);
    if (!response.ok) {
      return null;
    }
    return await response.arrayBuffer();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load mock data from ${path}:`, error);
    return null;
  }
}

/**
 * パス テンプレートを実際のパスに変換
 * 例: "/mocks/task_{id}.json" + {id: 123} -> "/mocks/task_123.json"
 */
export function interpolatePath(template: string, params: Record<string, unknown>): string {
  return template.replace(/{(\w+)}/g, (_, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}
