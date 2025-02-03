// utils/flatObject.ts
export interface FlattenObject {
  name: string;
  value: string;
}

/**
 * 入れ子になったカラーオブジェクトをフラットな配列に変換する関数
 * @param colors 入れ子オブジェクト（例：theme.colors）
 * @param prefix キーの接頭辞（再帰的に利用）
 * @returns フラットな { name, value } の配列
 */
export const flattenObject = (colors: object, prefix: string = ''): FlattenObject[] => {
  return Object.entries(colors).reduce<FlattenObject[]>((acc, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null) {
      // オブジェクトの場合は再帰的に展開
      acc.push(...flattenObject(value, newKey));
    } else if (typeof value === 'string') {
      // 文字列の場合はフラットなオブジェクトに追加
      acc.push({ name: newKey, value });
    }
    return acc;
  }, []);
};
