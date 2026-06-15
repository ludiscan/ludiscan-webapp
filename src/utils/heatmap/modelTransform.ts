import type { GeneralSettings } from '@src/modeles/heatmapView';

/**
 * サーバーに保存されるモデルの配置情報。
 * - position: 位置 [x, y, z]
 * - rotation: 回転 [x, y, z]（ラジアン）
 * - scale: スケール [x, y, z]
 */
export type ModelTransform = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
};

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

// general state で扱う配置関連フィールド（度・均等スケール）
type AlignmentFields = Pick<
  GeneralSettings,
  'modelPositionX' | 'modelPositionY' | 'modelPositionZ' | 'modelRotationX' | 'modelRotationY' | 'modelRotationZ' | 'scale'
>;

/**
 * general state（度・均等スケール）をサーバー保存用 transform（ラジアン・軸別）に変換する。
 */
export function alignmentToTransform(g: AlignmentFields): ModelTransform {
  return {
    position: [g.modelPositionX, g.modelPositionY, g.modelPositionZ],
    rotation: [g.modelRotationX * DEG_TO_RAD, g.modelRotationY * DEG_TO_RAD, g.modelRotationZ * DEG_TO_RAD],
    scale: [g.scale, g.scale, g.scale],
  };
}

/**
 * サーバー保存の transform を general state への部分更新に変換する。
 * 回転はラジアン→度、スケールは均等とみなして x 成分を採用する。
 */
export function transformToAlignmentPatch(t: ModelTransform): Partial<GeneralSettings> {
  return {
    modelPositionX: t.position[0],
    modelPositionY: t.position[1],
    modelPositionZ: t.position[2],
    modelRotationX: t.rotation[0] * RAD_TO_DEG,
    modelRotationY: t.rotation[1] * RAD_TO_DEG,
    modelRotationZ: t.rotation[2] * RAD_TO_DEG,
    scale: t.scale[0],
  };
}

function isVec3(value: unknown): value is [number, number, number] {
  return Array.isArray(value) && value.length === 3 && value.every((n) => typeof n === 'number' && Number.isFinite(n));
}

/**
 * パース済みの値を ModelTransform に検証・正規化する。不正な場合は null を返す。
 */
export function toModelTransform(value: unknown): ModelTransform | null {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, unknown>;
  if (!isVec3(obj.position) || !isVec3(obj.rotation) || !isVec3(obj.scale)) {
    return null;
  }
  return {
    position: obj.position,
    rotation: obj.rotation,
    scale: obj.scale,
  };
}

/**
 * GET レスポンスの X-Model-Transform ヘッダー（JSON 文字列）を ModelTransform にパースする。
 * 不正な場合は null を返す。
 */
export function parseTransformHeader(header: string | null): ModelTransform | null {
  if (!header) return null;
  try {
    return toModelTransform(JSON.parse(header));
  } catch {
    return null;
  }
}
