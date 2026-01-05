import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { FC } from 'react';

import { useSelectable } from '@src/features/heatmap/selection/hooks';
import { useGeneralPick } from '@src/hooks/useGeneral';
import { layers, zIndexes } from '@src/styles/style';

// v0.1 API: normalizedDensity is already 0-1 range
export type PointWithDensity = { x: number; y: number; z?: number; normalizedDensity: number };

type Props = {
  group: THREE.Group;
  points: PointWithDensity[];
  /** 1セルあたりの幅・奥行き（モデル座標系） */
  cellSize: number;
  /** 真上からのレイを少し浮かせる距離（ワールド） */
  offset?: number;
  /** Instanced の透明度（useGeneralState の heatmapOpacity を上書きしたい場合に） */
  opacity?: number;
  /** レイの対象を限定したい場合の layer 指定 */
  targetLayer?: number;
};

const MIN_COLOR = new THREE.Color(0x008dff);
const MAX_COLOR = new THREE.Color(0xf75400);

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

function lerpColor(t01: number) {
  return MIN_COLOR.clone().lerp(MAX_COLOR, t01);
}

// v0.1 API: normalizedDensity is already 0-1 range (server-side normalization)
const HeatmapFillOverlayComponent: FC<Props> = ({ group, points, cellSize, offset = 0.08, opacity, targetLayer }) => {
  const {
    upZ,
    scale,
    minThreshold = 0.0,
    maxThreshold = 1.0,
    heatmapOpacity = 1.0,
  } = useGeneralPick('upZ', 'scale', 'minThreshold', 'maxThreshold', 'heatmapOpacity');
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  // Transform points to world coordinates
  const worldPts = useMemo(() => {
    const s = scale;
    return points.map((p) => ({
      x: p.x * s,
      y: (upZ ? (p.z ?? 0) : p.y) * s,
      z: (upZ ? p.y : (p.z ?? 0)) * s,
      d: p.normalizedDensity, // v0.1: already 0-1
    }));
  }, [points, upZ, scale]);

  // Bin points by cell (average normalized density per cell)
  const { bins, worldCellSize } = useMemo(() => {
    const cs = cellSize * scale;
    const m = new Map<string, { sum: number; max: number; count: number }>();
    for (const { x, z, d } of worldPts) {
      const i = Math.floor(x / cs);
      const k = Math.floor(z / cs);
      const key = `${i},${k}`;
      const prev = m.get(key);
      if (!prev) m.set(key, { sum: d, max: d, count: 1 });
      else {
        prev.sum += d;
        prev.count++;
        if (d > prev.max) prev.max = d;
      }
    }
    return { bins: m, worldCellSize: cs };
  }, [worldPts, cellSize, scale]);

  // Raycast + instance data (position + color)
  const instanceData = useMemo(() => {
    if (!group) return [];
    group.updateMatrixWorld(true);

    const bbox = new THREE.Box3().setFromObject(group);
    const rayY = bbox.max.y + worldCellSize * 4;

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(targetLayer ?? layers.raycast);
    if (raycaster.firstHitOnly !== undefined) raycaster.firstHitOnly = true;

    const out: { pos: THREE.Vector3; quat: THREE.Quaternion; color: THREE.Color }[] = [];

    for (const [key, v] of bins) {
      const [i, k] = key.split(',').map((n) => parseInt(n, 10));
      const cx = (i + 0.5) * worldCellSize;
      const cz = (k + 0.5) * worldCellSize;

      // v0.1: Cell average is already normalized 0-1
      const t = clamp(v.sum / v.count, 0, 1);

      if (t < minThreshold || t > maxThreshold) continue;

      const origin = new THREE.Vector3(cx, rayY, cz);
      raycaster.set(origin, new THREE.Vector3(0, -1, 0));
      const hit = raycaster.intersectObject(group, true)[0];
      if (!hit || !hit.face) continue;

      // Cell is always horizontal (parallel to XZ plane)
      const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
      const pos = hit.point.clone().addScaledVector(new THREE.Vector3(0, 1, 0), offset);
      out.push({ pos, quat, color: lerpColor(t) });
    }
    return out;
  }, [bins, group, worldCellSize, offset, minThreshold, maxThreshold, targetLayer]);

  const count = instanceData.length;
  const instRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const inst = instRef.current;
    if (!inst || count === 0) return;

    // 互換: setColorAt があれば使う（内部で instanceColor を整備してくれる版がある）
    const hasSetColorAt = typeof inst.setColorAt === 'function';

    const expected = count * 3;
    // 明示的に instanceColor を用意（無い/サイズ違いの両方に対応）
    if (!inst.instanceColor || inst.instanceColor.count !== count) {
      inst.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(expected), 3);
    }

    const m = new THREE.Matrix4();
    const s = new THREE.Vector3(1.5, 1.5, 1.5);
    const col = new THREE.Color();

    const arr = inst.instanceColor.array;

    instanceData.forEach((it, idx) => {
      m.compose(it.pos, it.quat, s);
      inst.setMatrixAt(idx, m);

      col.copy(it.color);
      // 明示的に instanceColor に書き込み
      arr[idx * 3] = col.r;
      arr[idx * 3 + 1] = col.g;
      arr[idx * 3 + 2] = col.b;

      // 互換パス（あればこちらも実行）
      if (hasSetColorAt) inst.setColorAt(idx, col);
    });

    inst.count = count;
    inst.instanceMatrix.needsUpdate = true;
    inst.instanceColor.needsUpdate = true;

    // ★ これが無いと真っ黒になり得る
    if (matRef.current) matRef.current.needsUpdate = true;
  }, [instanceData, count]);
  const matKey = useMemo(() => `heatmap-mat-${count}`, [count]);

  const cellHandlers = useSelectable('heatmap-cell', {
    getSelection: (e) => {
      const i = e.instanceId ?? -1;
      const p = e.point;
      return {
        kind: 'heatmap-cell',
        index: i,
        worldPosition: { x: p.x, y: p.y, z: p.z },
        // density: i >= 0 ? densities[i] : undefined,
      };
    },
    fit: 'point',
  });

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={instRef}
      args={[undefined, undefined, count]} /* eslint-disable-line react/no-unknown-property */
      renderOrder={zIndexes.renderOrder.heatmap} /* eslint-disable-line react/no-unknown-property */
      frustumCulled={false} /* eslint-disable-line react/no-unknown-property */
      {...cellHandlers}
    >
      <planeGeometry args={[worldCellSize, worldCellSize]} /* eslint-disable-line react/no-unknown-property */ />
      <meshBasicMaterial
        key={matKey}
        ref={matRef}
        vertexColors={false} /* eslint-disable-line react/no-unknown-property */
        transparent /* eslint-disable-line react/no-unknown-property */
        opacity={opacity ?? heatmapOpacity}
        side={THREE.DoubleSide} /* eslint-disable-line react/no-unknown-property */
        depthWrite={false} /* eslint-disable-line react/no-unknown-property */
        depthTest={false} /* eslint-disable-line react/no-unknown-property */
        toneMapped={false} /* eslint-disable-line react/no-unknown-property */
        color={0xffffff} // vertexColors と掛け算する基色は白
      />
    </instancedMesh>
  );
};

export const HeatmapFillOverlay = memo(
  HeatmapFillOverlayComponent,
  (prev, next) => prev.group === next.group && prev.points === next.points && prev.cellSize === next.cellSize && prev.opacity === next.opacity,
);
