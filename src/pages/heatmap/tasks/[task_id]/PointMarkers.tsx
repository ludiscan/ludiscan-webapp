import { useMemo } from 'react';
import { Color, Vector3 } from 'three';

import type { FC } from 'react';

import { useCanvasState } from '@src/hooks/useCanvasState';

export type PointMarkersProps = {
  points: { x: number; y: number; z?: number | undefined; density: number }[];
  minThreshold?: number; // **最低表示密度**
  maxThreshold?: number; // **最大密度の閾値**
  colorIntensity?: number; // **色の強調度**
};

class Point extends Vector3 {
  color: Color;

  constructor(x: number, y: number, z: number, color: Color) {
    super(x, y, z);
    this.color = color;
  }
}

const Component: FC<PointMarkersProps> = ({ points, minThreshold = 0.5, maxThreshold = 1.0, colorIntensity = 0.6 }) => {
  const {
    general: { upZ, scale },
  } = useCanvasState();

  const pointList = useMemo(() => {
    return points.map((point) => ({
      x: point.x,
      y: upZ ? (point.z ?? 0) : point.y,
      z: upZ ? point.y : (point.z ?? 0),
      density: point.density,
    }));
  }, [points, upZ]);
  // **密度の最大値を計算（maxThresholdを適用）**
  const maxDensity = useMemo(() => {
    return points.reduce((acc, { density }) => Math.max(acc, density), 0);
  }, [points]);

  const memoizedPoints = useMemo(() => {
    return pointList
      .filter(({ density }) => density >= minThreshold) // **最小閾値以下は除外**
      .map(({ x, y, z, density }) => {
        // **密度を `minThreshold ~ maxThreshold` の範囲に正規化**
        const normalizedDensity = Math.min(Math.max(density / maxDensity, 0), maxThreshold);

        // **色の強度を調整**
        const t = Math.pow(normalizedDensity, colorIntensity);

        // **赤 (低) → 黄緑 (高) のグラデーション**
        const color = new Color().setHSL(0.33 * t, 1, 0.5);

        return new Point(x * scale, y * scale, z * scale, color);
      });
  }, [maxDensity, pointList, scale, minThreshold, maxThreshold, colorIntensity]);

  return memoizedPoints.map((pos, index) => (
    <mesh
      key={index}
      position={new Vector3(pos.x, pos.y, pos.z)} /* eslint-disable-line react/no-unknown-property */
      castShadow={false} /* eslint-disable-line react/no-unknown-property */
      receiveShadow={false} /* eslint-disable-line react/no-unknown-property */
    >
      <boxGeometry args={[50 * scale, 50 * scale, 50 * scale]} /> {/* eslint-disable-line react/no-unknown-property */}
      <meshStandardMaterial color={pos.color} />
    </mesh>
  ));
};

export const PointMarkers = Component;
