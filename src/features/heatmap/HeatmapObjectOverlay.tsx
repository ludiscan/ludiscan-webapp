import { memo, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { FC } from 'react';

import { useSelectable } from '@src/features/heatmap/selection/hooks';
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
const MIN_COLOR = new THREE.Color(0x008dff); // Blue at lowest density
const MAX_COLOR = new THREE.Color(0xf75400); // Red at highest density
const BASE_BOX_SIZE = 50;

// ----------------------------------------------------------------
// ★ 補完用ヘルパー関数
// ----------------------------------------------------------------
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

function lerpColor(t01: number): THREE.Color {
  return MIN_COLOR.clone().lerp(MAX_COLOR, t01);
}

type RenderCell = {
  x: number;
  y: number;
  z: number;
  color: THREE.Color;
  density: number;
  srcIndex: number;
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

  const instRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

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
    const loQ = 0.01;
    const hiQ = 0.99;
    const lo = Math.max(0, quantile(sorted, loQ));
    const hiRaw = quantile(sorted, hiQ);
    const hi = Math.max(hiRaw, lo + Number.EPSILON);
    const median = quantile(sorted, 0.5);
    const skewed = hi / Math.max(1e-9, median) > 4;
    const mode: ScaleMode = skewed ? 'log1p' : 'sqrt';
    return { lo, hi, mode };
  }, [points]);

  // 正規化（winsorize + 変換 + γ補正 + colorScale）
  const normalizePoints = useMemo(() => {
    const tLo = transform(lo, mode);
    const tHi = transform(hi, mode);
    const denom = Math.max(tHi - tLo, 1e-9);

    return pointList.map(({ x, y, z, density }) => {
      const dClip = clamp(density, lo, hi);
      let t = (transform(dClip, mode) - tLo) / denom;
      t = Math.pow(clamp(t, 0, 1), colorIntensity);
      t = clamp(t * colorScale, 0, 1);
      return { x: x * scale, y: y * scale, z: z * scale, t };
    });
  }, [lo, mode, hi, pointList, colorIntensity, colorScale, scale]);

  // フィルタリング済みのセルデータ
  const renderCells: RenderCell[] = useMemo(() => {
    return normalizePoints
      .map((np, idx) => {
        const d = points[idx].density;
        const t = np.t;
        if (t > maxThreshold || t < minThreshold) return null;
        const color = lerpColor(t);
        return { x: np.x, y: np.y, z: np.z, color, density: d, srcIndex: idx };
      })
      .filter(Boolean) as RenderCell[];
  }, [normalizePoints, points, maxThreshold, minThreshold]);

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
        density: cell.density,
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

export const HeatmapObjectOverlay = memo(
  Component,
  (prevProps, nextProps) =>
    prevProps.points == nextProps.points &&
    prevProps.colorIntensity == nextProps.colorIntensity &&
    prevProps.minThreshold == nextProps.minThreshold &&
    prevProps.maxThreshold == nextProps.maxThreshold,
);
