import { useMemo } from 'react';
import { Color, Vector3 } from 'three';

import type { FC } from 'react';

import { useGeneralPick } from '@src/hooks/useGeneral';

export type PointMarkersProps = {
  points: { x: number; y: number; z?: number | undefined; density: number }[];
  minThreshold?: number; // **最低表示密度**
  maxThreshold?: number; // **最大密度の閾値**
  colorIntensity?: number; // **色の強調度**
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

class Point extends Vector3 {
  color: Color;

  constructor(x: number, y: number, z: number, color: Color) {
    super(x, y, z);
    this.color = color;
  }
}

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

  // ★ここでの getColor は「t」そのまま。colorScale の二重掛けを削除！
  const memoizedPoints = useMemo(() => {
    return normalizePoints
      .map(({ x, y, z, t }) => {
        if (t > maxThreshold || t < minThreshold) return null;
        const color = getColor(t, MIN_COLOR, MAX_COLOR);
        return new Point(x, y, z, color);
      })
      .filter((s): s is Point => s != null);
  }, [maxThreshold, minThreshold, normalizePoints]);

  return (
    <>
      {memoizedPoints.map((pos, i) => (
        <mesh
          key={i}
          position={new Vector3(pos.x, pos.y, pos.z)} /* eslint-disable-line react/no-unknown-property */
          castShadow={false} /* eslint-disable-line react/no-unknown-property */
          receiveShadow={false} /* eslint-disable-line react/no-unknown-property */
        >
          <boxGeometry args={[50 * scale, 50 * scale, 50 * scale]} /> {/* eslint-disable-line react/no-unknown-property */}
          <meshStandardMaterial color={pos.color} opacity={heatmapOpacity} transparent={true} /> {/* eslint-disable-line react/no-unknown-property */}
        </mesh>
      ))}
    </>
  );
};

export const HeatmapObjectOverlay = Component;
