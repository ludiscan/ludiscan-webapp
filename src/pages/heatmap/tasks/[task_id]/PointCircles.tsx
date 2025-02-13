import { useMemo } from 'react';
import { Color, Vector3 } from 'three';

import type { FC } from 'react';

import { useCanvasState } from '@/hooks/useCanvasState.ts';

export type PointCirclesProps = {
  points: { x: number; y: number; z?: number | undefined; density: number }[];
  thresholdCount?: number; // **上位N%を可視化**
  circleSize?: number; // **円の基本サイズ**
  radius?: number; // **近傍探索の半径**
};

const PointCircles: FC<PointCirclesProps> = ({ points, thresholdCount = 6, circleSize = 200, radius = 600 }) => {
  const { scale, upZ } = useCanvasState();
  const clearNearDuplication = true;

  // **各ポイントの周囲の密度を集計**
  const areaDensities = useMemo(() => {
    const areaMap = new Map<string, { position: Vector3; totalDensity: number }>();

    points.forEach(({ x, y, z }) => {
      const pos = new Vector3(x * scale, upZ ? (z ?? 0) * scale : y * scale, upZ ? y * scale : (z ?? 0) * scale);
      const key = `${pos.x}, ${pos.y}, ${pos.z}`;

      if (!areaMap.has(key)) {
        areaMap.set(key, { position: pos, totalDensity: 0 });
      }

      // **現在のポイントを半径内にある他のポイントと一緒に集計**
      points.forEach((other) => {
        const otherPos = new Vector3(other.x * scale, upZ ? (other.z ?? 0) * scale : other.y * scale, upZ ? other.y * scale : (other.z ?? 0) * scale);
        if (pos.distanceTo(otherPos) <= radius) {
          areaMap.get(key)!.totalDensity += other.density;
        }
      });
    });

    return Array.from(areaMap.values());
  }, [points, scale, upZ, radius]);

  // **密度の上位N%のしきい値を決定**
  const sorted = useMemo(() => areaDensities.sort((a, b) => b.totalDensity - a.totalDensity), [areaDensities]);

  const highDensityAreas = useMemo(() => {
    const areas: { position: Vector3; size: number; force: number }[] = [];
    for (let i = 0; i < sorted.length; i++) {
      const area = sorted[i];
      // clearNearDuplicationなら半径/2の近さのareaを排除する
      const sameAreaIndex = areas.findIndex(({ position }) => area.position.distanceTo(position) < radius / 2);
      if (clearNearDuplication && sameAreaIndex != -1) {
        areas[sameAreaIndex] = {
          ...areas[sameAreaIndex],
          force: areas[sameAreaIndex].force + 0.001,
        };
        continue;
      }
      areas.push({
        position: area.position,
        size: circleSize,
        force: area.totalDensity * 0.1,
      });
      if (areas.length == thresholdCount) {
        break;
      }
    }
    return areas;
  }, [circleSize, clearNearDuplication, radius, sorted, thresholdCount]);

  return highDensityAreas.map((area, index) => (
    <mesh key={index} position={area.position}>
      <sphereGeometry args={[area.size, 32]} />
      <meshBasicMaterial color={new Color().setHSL(area.force * 0.1, 1, 0.5)} transparent opacity={0.7} />
    </mesh>
  ));
};

export default PointCircles;
