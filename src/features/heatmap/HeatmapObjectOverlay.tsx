import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { FC } from 'react';

import { useSelectable } from '@src/features/heatmap/selection/hooks';
import { useGeneralPick } from '@src/hooks/useGeneral';

// v0.1 API: normalizedDensity is already 0-1 range (server-side normalization)
export type PointMarkersProps = {
  points: { x: number; y: number; z?: number | undefined; normalizedDensity: number }[];
};

// ----------------------------------------------------------------
// ★ 定数定義
// ----------------------------------------------------------------
const MIN_COLOR = new THREE.Color(0x008dff); // Blue at lowest density
const MAX_COLOR = new THREE.Color(0xf75400); // Red at highest density
const BASE_BOX_SIZE = 50;

// ----------------------------------------------------------------
// ★ 補完用ヘルパー関数
// ----------------------------------------------------------------
function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function lerpColor(t01: number): THREE.Color {
  return MIN_COLOR.clone().lerp(MAX_COLOR, t01);
}

type RenderCell = {
  x: number;
  y: number;
  z: number;
  color: THREE.Color;
  normalizedDensity: number;
  srcIndex: number;
};

const Component: FC<PointMarkersProps> = ({ points }) => {
  const {
    upZ,
    scale,
    minThreshold = 0.0,
    maxThreshold = 1.0,
    heatmapOpacity = 1.0,
  } = useGeneralPick('upZ', 'scale', 'minThreshold', 'maxThreshold', 'heatmapOpacity');

  const instRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  // Z-up / Y-up の変換 + スケール適用
  const pointList = useMemo(
    () =>
      points.map((pt) => ({
        x: pt.x * scale,
        y: upZ ? (pt.z ?? 0) * scale : pt.y * scale,
        z: upZ ? pt.y * scale : (pt.z ?? 0) * scale,
        normalizedDensity: pt.normalizedDensity,
      })),
    [points, upZ, scale],
  );

  // v0.1: normalizedDensity is already 0-1, just apply threshold filter
  const renderCells: RenderCell[] = useMemo(() => {
    return pointList
      .map((pt, idx) => {
        const t = clamp(pt.normalizedDensity, 0, 1);
        if (t > maxThreshold || t < minThreshold) return null;
        const color = lerpColor(t);
        return { x: pt.x, y: pt.y, z: pt.z, color, normalizedDensity: t, srcIndex: idx };
      })
      .filter(Boolean) as RenderCell[];
  }, [pointList, maxThreshold, minThreshold]);

  const count = renderCells.length;
  const boxSize = BASE_BOX_SIZE * scale;

  // InstancedMesh の更新
  useEffect(() => {
    const inst = instRef.current;
    if (!inst || count === 0) return;

    const expected = count * 3;
    if (!inst.instanceColor || inst.instanceColor.count !== count) {
      inst.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(expected), 3);
    }

    const m = new THREE.Matrix4();
    const s = new THREE.Vector3(1, 1, 1);
    const q = new THREE.Quaternion();
    const col = new THREE.Color();
    const arr = inst.instanceColor.array;

    renderCells.forEach((cell, idx) => {
      m.compose(new THREE.Vector3(cell.x, cell.y, cell.z), q, s);
      inst.setMatrixAt(idx, m);

      col.copy(cell.color);
      arr[idx * 3] = col.r;
      arr[idx * 3 + 1] = col.g;
      arr[idx * 3 + 2] = col.b;
    });

    inst.count = count;
    inst.instanceMatrix.needsUpdate = true;
    inst.instanceColor.needsUpdate = true;

    if (matRef.current) matRef.current.needsUpdate = true;
  }, [renderCells, count]);

  // 選択ハンドラ（InstancedMesh対応）
  const handlers = useSelectable('heatmap-cell', {
    getSelection: (e) => {
      const i = e.instanceId ?? -1;
      if (i < 0 || i >= renderCells.length) {
        return {
          kind: 'heatmap-cell',
          index: -1,
          worldPosition: { x: e.point.x, y: e.point.y, z: e.point.z },
        };
      }
      const cell = renderCells[i];
      return {
        kind: 'heatmap-cell',
        index: cell.srcIndex,
        worldPosition: { x: cell.x, y: cell.y, z: cell.z },
        density: cell.normalizedDensity, // v0.1: already normalized 0-1
      };
    },
    fit: 'point',
  });

  const matKey = useMemo(() => `heatmap-object-mat-${count}`, [count]);

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={instRef}
      args={[undefined, undefined, count]} /* eslint-disable-line react/no-unknown-property */
      frustumCulled={false} /* eslint-disable-line react/no-unknown-property */
      {...handlers}
    >
      <boxGeometry args={[boxSize, boxSize, boxSize]} /* eslint-disable-line react/no-unknown-property */ />
      <meshBasicMaterial
        key={matKey}
        ref={matRef}
        vertexColors={false} /* eslint-disable-line react/no-unknown-property */
        transparent /* eslint-disable-line react/no-unknown-property */
        opacity={heatmapOpacity}
        toneMapped={false} /* eslint-disable-line react/no-unknown-property */
        color={0xffffff}
      />
    </instancedMesh>
  );
};

export const HeatmapObjectOverlay = memo(Component, (prevProps, nextProps) => prevProps.points === nextProps.points);
