import type { HeatmapTask } from '@src/modeles/heatmaptask';

/**
 * プロジェクトまたはヒートマップタスクから2D/3Dゲームを判定する
 * @param projectIs2D プロジェクトの is2D フラグ（優先）
 * @param task ヒートマップタスク（後方互換性のため）
 * @returns '2d' | '3d'
 */
export function detectDimensionality(projectIs2D: boolean | undefined, task?: HeatmapTask | undefined): '2d' | '3d' {
  // プロジェクトのis2Dフラグを優先的に使用
  if (projectIs2D !== undefined) {
    return projectIs2D ? '2d' : '3d';
  }

  // 後方互換性: taskのzVisibleで判定
  if (!task) return '3d'; // デフォルトは3D

  // バックエンドのz_visibleフラグで判定
  // z_visible=false → 2Dゲーム（Z軸を無視）
  // z_visible=true → 3Dゲーム
  // Note: 型定義が古い場合、zVisibleが存在しない可能性があるため、型アサーションを使用
  const taskWithZVisible = task as HeatmapTask & { zVisible?: boolean };

  // zVisibleが未定義の場合はデフォルトで3Dと判定
  return taskWithZVisible.zVisible === false ? '2d' : '3d';
}

/**
 * ポイントリストから実際にZ座標が使用されているかチェック（補助的な検証用）
 * @param points ヒートマップポイント配列
 * @returns Z座標に0以外の値があればtrue
 */
export function hasNonZeroZ(points: { z?: number }[]): boolean {
  return points.some((p) => p.z !== undefined && p.z !== 0);
}
