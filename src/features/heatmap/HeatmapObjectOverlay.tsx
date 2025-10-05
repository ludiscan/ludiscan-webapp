import { useMemo } from 'react';
import { Color } from 'three';

import type { FC } from 'react';

import { useSelectable } from '@src/features/heatmap/selection/hooks';
import { useGeneralPick } from '@src/hooks/useGeneral';

export type PointMarkersProps = {
  points: { x: number; y: number; z?: number | undefined; density: number }[];
  minThreshold?: number; // **最低表示密度**
  maxThreshold?: number; // **最大密度の閾値**
  colorIntensity?: number; // **色の強調度**
};

type RenderCell = {
  x: number;
  y: number;
  z: number;
  color: Color;
  density: number; // ← 生の密度
  srcIndex: number; // 元 points 内のインデックス（必要なら）
};

// ----------------------------------------------------------------
// ★ 定数定義
// ----------------------------------------------------------------
const MIN_COLOR = new Color(0x008dff); // Blue at lowest density
const MAX_COLOR = new Color(0xf75400); // Red  at highest density

// ----------------------------------------------------------------
// ★ 補完用ヘルパー関数
// ----------------------------------------------------------------
/**
 * Linearly interpolate between two colors.
 * @param t   normalized value [0,1]
 * @param from starting color
 * @param to   ending color
 */
function getColor(t: number, from: Color, to: Color): Color {
  return from.clone().lerp(to, t);
}

type ScaleMode = 'linear' | 'sqrt' | 'log1p' | 'asinh';

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function quantile(sortedAsc: number[], q: number) {
  const n = sortedAsc.length;
  if (n === 0) return 0;
  if (q <= 0) return sortedAsc[0];
  if (q >= 1) return sortedAsc[n - 1];
  const pos = (n - 1) * q;
  const i = Math.floor(pos);
  const frac = pos - i;
  const a = sortedAsc[i];
  const b = sortedAsc[Math.min(i + 1, n - 1)];
  return a + (b - a) * frac;
}

function transform(x: number, mode: ScaleMode): number {
  switch (mode) {
    case 'sqrt':
      return Math.sqrt(Math.max(0, x));
    case 'log1p':
      return Math.log1p(Math.max(0, x));
    case 'asinh':
      return Math.asinh(Math.max(0, x));
    default:
      return Math.max(0, x);
  }
}

const Cell: FC<{ cell: RenderCell; scale: number; opacity: number }> = ({ cell, scale, opacity }) => {
  const handlers = useSelectable('heatmap-cell', {
    getSelection: () => ({
      kind: 'heatmap-cell',
      index: cell.srcIndex, // 任意
      worldPosition: { x: cell.x, y: cell.y, z: cell.z },
      density: cell.density, // ★ ここで渡す
    }),
    fit: 'point',
  });

  return (
    <mesh position={[cell.x, cell.y, cell.z]} /* eslint-disable-line react/no-unknown-property */ {...handlers}>
      <boxGeometry args={[50 * scale, 50 * scale, 50 * scale]} /* eslint-disable-line react/no-unknown-property */ />
      <meshStandardMaterial color={cell.color} opacity={opacity} transparent /* eslint-disable-line react/no-unknown-property */ />
    </mesh>
  );
};

const Component: FC<PointMarkersProps> = ({ points, colorIntensity = 0.6 }) => {
  const {
    upZ,
    scale,
    minThreshold = 0.0,
    maxThreshold = 1.0,
    heatmapOpacity = 1.0,
    colorScale,
  } = useGeneralPick('upZ', 'scale', 'minThreshold', 'maxThreshold', 'heatmapOpacity', 'colorScale');

  // Z-up / Y-up の変換
  const pointList = useMemo(
    () =>
      points.map((pt) => ({
        x: pt.x,
        y: upZ ? (pt.z ?? 0) : pt.y,
        z: upZ ? pt.y : (pt.z ?? 0),
        density: pt.density,
      })),
    [points, upZ],
  );

  const { lo, hi, mode } = useMemo(() => {
    const dens = points.map((p) => p.density).filter((d) => Number.isFinite(d));
    if (dens.length === 0) return { lo: 0, hi: 1, mode: 'log1p' as ScaleMode };
    const sorted = [...dens].sort((a, b) => a - b);
    const loQ = 0.01; // 下位1%を下限に
    const hiQ = 0.99; // 上位1%を上限に（外れ値はここで頭打ち）
    const lo = Math.max(0, quantile(sorted, loQ));
    const hiRaw = quantile(sorted, hiQ);
    // hiがloと同値になるのを回避
    const hi = Math.max(hiRaw, lo + Number.EPSILON);

    // 分布の歪みが大きい場合は log1p、そこまででなければ sqrt でもOK
    // ここは簡単に「P99がP50の4倍超なら log1p、そうでなければ sqrt」などでも良い
    const median = quantile(sorted, 0.5);
    const skewed = hi / Math.max(1e-9, median) > 4;
    const mode: ScaleMode = skewed ? 'log1p' : 'sqrt';

    return { lo, hi, mode };
  }, [points]);

  // --- NEW: 正規化（winsorize + 変換 + γ補正 + colorScale一回だけ）---
  const normalizePoints = useMemo(() => {
    const tLo = transform(lo, mode);
    const tHi = transform(hi, mode);
    const denom = Math.max(tHi - tLo, 1e-9);

    return pointList.map(({ x, y, z, density }) => {
      // 分位点クリップ（ウィンズライジング）
      const dClip = clamp(density, lo, hi);
      // 変換（log1p / sqrt / asinh / linear）
      let t = (transform(dClip, mode) - tLo) / denom;
      // γ補正（= colorIntensity）。0.8〜1.2ぐらいが扱いやすい
      t = Math.pow(clamp(t, 0, 1), colorIntensity);
      // UIからの全体ゲイン colorScale を一回だけ適用
      t = clamp(t * colorScale, 0, 1);

      return { x: x * scale, y: y * scale, z: z * scale, t };
    });
  }, [lo, mode, hi, pointList, colorIntensity, colorScale, scale]);

  const renderCells: RenderCell[] = useMemo(() => {
    // ここはあなたの normalizePoints/memoizedPoints ロジックをベースに
    // フィルタ後の点について density と元インデックスを入れて返す
    return normalizePoints
      .map((np, idx) => {
        const d = points[idx].density; // ★ 元配列の密度を拾う
        const t = np.t; // 正規化済み 0..1
        if (t > maxThreshold || t < minThreshold) return null;

        const color = getColor(t, MIN_COLOR, MAX_COLOR);
        return { x: np.x, y: np.y, z: np.z, color, density: d, srcIndex: idx };
      })
      .filter(Boolean) as RenderCell[];
  }, [normalizePoints, points, maxThreshold, minThreshold]);

  return (
    <>
      {renderCells.map((c) => (
        <Cell key={c.srcIndex} cell={c} scale={scale} opacity={heatmapOpacity} />
      ))}
    </>
  );
};

export const HeatmapObjectOverlay = Component;
