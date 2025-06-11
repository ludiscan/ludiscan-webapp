import { useMemo } from 'react';
import { Color, Vector3 } from 'three';

import type { FC } from 'react';

import { useGeneralState } from '@src/hooks/useHeatmapState';

export type PointMarkersProps = {
  points: { x: number; y: number; z?: number | undefined; density: number }[];
  minThreshold?: number; // **最低表示密度**
  maxThreshold?: number; // **最大密度の閾値**
  colorIntensity?: number; // **色の強調度**
  colorScale?: number; // **色のスケール**
};

// ----------------------------------------------------------------
// ★ 定数定義
// ----------------------------------------------------------------
const MIN_COLOR = new Color(0xff1060ff); // Blue at lowest density
const MAX_COLOR = new Color(0xfff75a5a); // Red  at highest density

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

class Point extends Vector3 {
  color: Color;

  constructor(x: number, y: number, z: number, color: Color) {
    super(x, y, z);
    this.color = color;
  }
}

const Component: FC<PointMarkersProps> = ({ points, colorIntensity = 0.9, colorScale = 1 }) => {
  const {
    data: { upZ, scale, minThreshold = 0.0, maxThreshold = 1.0 },
  } = useGeneralState();

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

  // 元の密度の最大値を取得
  const maxDensity = useMemo(() => points.reduce((acc, { density }) => Math.max(acc, density), 0), [points]);

  // フィルタリング＆カラー作成
  const normalizePoints = useMemo(() => {
    return pointList
      .map(({ x, y, z, density }) => {
        // normalize density into [0,1] then clamp by maxThreshold
        // console.log(density);
        const raw = density / maxDensity;
        const normalized = Math.max(raw, 0);

        // apply intensity curve
        let t = Math.pow(normalized, colorIntensity);
        t = t * colorScale;
        t = Math.min(t, 1);
        t = Math.max(t, 0);

        return {
          x: x * scale,
          y: y * scale,
          z: z * scale,
          t,
        };
      })
      .filter((s) => s != null);
  }, [pointList, maxDensity, colorIntensity, colorScale, scale]);

  // const maxValue = useMemo(() => {
  //   return normalizePoints.reduce((acc, { t }) => Math.max(acc, t), 0);
  // }, [normalizePoints]);
  // const minValue = useMemo(() => {
  //   return normalizePoints.reduce((acc, { t }) => Math.min(acc, t), 1);
  // }, [normalizePoints]);

  const memoizedPoints = useMemo(() => {
    return normalizePoints
      .map(({ x, y, z, t }) => {
        if (t > maxThreshold) {
          return null;
        } else if (t < minThreshold) {
          return null;
        }
        // interpolate between blue and red
        const color = getColor(t, MIN_COLOR, MAX_COLOR);

        return new Point(x * scale, y * scale, z * scale, color);
      })
      .filter((s) => s != null);
  }, [maxThreshold, minThreshold, normalizePoints, scale]);

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
          <meshStandardMaterial color={pos.color} />
        </mesh>
      ))}
    </>
  );
};

export const PositionPointMarkers = Component;
