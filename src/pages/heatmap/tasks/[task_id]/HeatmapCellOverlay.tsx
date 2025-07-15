// src/pages/heatmap/tasks/[task_id]/HeatmapCellOverlay.tsx
import { useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';

import type { FC } from 'react';

import { useGeneralState } from '@src/hooks/useHeatmapState';
import { zIndexes } from '@src/styles/style';

export type PointWithDensity = {
  x: number;
  y: number;
  z?: number;
  density: number;
};

const MIN_COLOR = new THREE.Color(0x1060ff);
const MAX_COLOR = new THREE.Color(0xf75a5a);
function lerpColor(t: number) {
  return MIN_COLOR.clone().lerp(MAX_COLOR, t);
}

type Cell = {
  pos: THREE.Vector3;
  normal: THREE.Vector3;
  color: THREE.Color;
};

type Props = {
  group: THREE.Group;
  points: PointWithDensity[];
  /** 1セルあたりの幅・奥行き */
  cellSize: number;
  /** density 正規化用の最大値 */
  maxDensity?: number;
  /** 0〜1 の閾値 */
  threshold?: number;
  /** ポリゴンを少し浮かせるオフセット */
  offset?: number;
  /** 不透明度 */
  opacity?: number;
};

export const HeatmapCellOverlay: FC<Props> = ({ group, points, cellSize, maxDensity, threshold = 0, offset = 0.1, opacity = 0.7 }) => {
  const {
    data: { upZ, scale },
  } = useGeneralState();

  const [cells, setCells] = useState<Cell[]>([]);
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const md = useMemo(() => maxDensity ?? Math.max(...points.map((p) => p.density), 1), [points, maxDensity]);

  useEffect(() => {
    const newCells: Cell[] = [];
    for (const pt of points) {
      if (pt.density < threshold) continue;
      const worldX = pt.x * scale;
      const worldY = (upZ ? (pt.z ?? 0) : pt.y) * scale;
      const worldZ = (upZ ? pt.y : (pt.z ?? 0)) * scale;
      const t = Math.min(Math.max(pt.density / md, 0), 1);

      // 高い位置から真下へレイを飛ばす
      const origin = new THREE.Vector3(worldX, worldY + cellSize * scale * 2 + 400, worldZ);
      raycaster.set(origin, new THREE.Vector3(0, -1, 0));
      const hit = raycaster.intersectObject(group, true)[0];
      if (!hit || !hit.face) continue;

      newCells.push({
        pos: hit.point,
        normal: hit.face.normal.clone(),
        color: lerpColor(t),
      });
    }
    setCells(newCells);
  }, [group, points, raycaster, md, threshold, upZ, scale, cellSize]);

  return (
    <group>
      {cells.map((cell, i) => {
        const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), cell.normal);
        const pos = cell.pos.clone().add(cell.normal.clone().multiplyScalar(offset));

        return (
          <mesh
            key={i}
            position={[pos.x, pos.y, pos.z]} /* eslint-disable-line react/no-unknown-property */
            quaternion={[q.x, q.y, q.z, q.w]} /* eslint-disable-line react/no-unknown-property */
            renderOrder={zIndexes.renderOrder.heatmap} /* eslint-disable-line react/no-unknown-property */
          >
            <planeGeometry args={[cellSize, cellSize]} /* eslint-disable-line react/no-unknown-property */ />
            <meshBasicMaterial
              color={cell.color}
              transparent /* eslint-disable-line react/no-unknown-property */
              opacity={opacity}
              side={THREE.DoubleSide} /* eslint-disable-line react/no-unknown-property */
              depthWrite={false} /* eslint-disable-line react/no-unknown-property */
              depthTest={false} /* eslint-disable-line react/no-unknown-property */
            />
          </mesh>
        );
      })}
    </group>
  );
};
