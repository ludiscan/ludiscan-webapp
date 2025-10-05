import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { FC } from 'react';

import { useGeneralPick } from '@src/hooks/useGeneral';
import { layers, zIndexes } from '@src/styles/style';

export type PointWithDensity = { x: number; y: number; z?: number; density: number };

type Props = {
  group: THREE.Group;
  points: PointWithDensity[];
  /** 1セルあたりの幅・奥行き（モデル座標系） */
  cellSize: number;
  /** density 正規化用の最大値（未指定ならデータから推定） */
  maxDensity?: number;
  /** 真上からのレイを少し浮かせる距離（ワールド） */
  offset?: number;
  /** Instanced の透明度（useGeneralState の heatmapOpacity を上書きしたい場合に） */
  opacity?: number;
  /** 密度分布の歪み補正 γ。ObjectOverlay の colorIntensity 相当（既定 0.6） */
  colorIntensity?: number;
  /** レイの対象を限定したい場合の layer 指定 */
  targetLayer?: number;
};

const MIN_COLOR = new THREE.Color(0x008dff);
const MAX_COLOR = new THREE.Color(0xf75400);

type ScaleMode = 'linear' | 'sqrt' | 'log1p' | 'asinh';
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

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
function transform(x: number, mode: ScaleMode) {
  const v = Math.max(0, x);
  switch (mode) {
    case 'sqrt':
      return Math.sqrt(v);
    case 'log1p':
      return Math.log1p(v);
    case 'asinh':
      return Math.asinh(v);
    default:
      return v;
  }
}
function lerpColor(t01: number) {
  return MIN_COLOR.clone().lerp(MAX_COLOR, t01);
}

export const HeatmapFillOverlay: FC<Props> = ({ group, points, cellSize, offset = 0.08, opacity, colorIntensity = 0.6, targetLayer }) => {
  const {
    upZ,
    scale,
    minThreshold = 0.0, // ObjectOverlay 準拠
    maxThreshold = 1.0,
    heatmapOpacity = 1.0,
    colorScale,
  } = useGeneralPick('upZ', 'scale', 'minThreshold', 'maxThreshold', 'heatmapOpacity', 'colorScale');
  const matRef = useRef<THREE.MeshBasicMaterial>(null);

  const worldPts = useMemo(() => {
    const s = scale;
    return points.map((p) => ({
      x: p.x * s,
      y: (upZ ? (p.z ?? 0) : p.y) * s,
      z: (upZ ? p.y : (p.z ?? 0)) * s,
      d: p.density,
    }));
  }, [points, upZ, scale]);

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

  // ---- ObjectOverlay と同等の正規化（winsorize + sqrt/log1p + γ + colorScale 一回だけ）
  const normConfig = useMemo(() => {
    const dens: number[] = [];
    for (const v of bins.values()) dens.push(v.sum / v.count); // セル平均で評価
    if (dens.length === 0) {
      return { lo: 0, hi: 1, mode: 'log1p' as ScaleMode, tLo: 0, tHi: 1, denom: 1 };
    }
    const sorted = dens.sort((a, b) => a - b);
    const lo = Math.max(0, quantile(sorted, 0.01));
    const hiRaw = quantile(sorted, 0.99);
    const hi = Math.max(hiRaw, lo + Number.EPSILON);
    const median = quantile(sorted, 0.5);
    const skewed = hi / Math.max(1e-9, median) > 4;
    const mode: ScaleMode = skewed ? 'log1p' : 'sqrt';
    const tLo = transform(lo, mode);
    const tHi = transform(hi, mode);
    const denom = Math.max(tHi - tLo, 1e-9);
    return { lo, hi, mode, tLo, tHi, denom };
  }, [bins]);

  // ---- レイキャスト（1セル1回）＋ インスタンス情報（姿勢＋色）
  const instanceData = useMemo(() => {
    if (!group) return [];
    group.updateMatrixWorld(true);

    const bbox = new THREE.Box3().setFromObject(group);
    const rayY = bbox.max.y + worldCellSize * 4;

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(targetLayer ?? layers.raycast);
    if (raycaster.firstHitOnly !== undefined) raycaster.firstHitOnly = true;

    const up = new THREE.Vector3(0, 0, 1);
    const nTmp = new THREE.Vector3();

    const out: { pos: THREE.Vector3; quat: THREE.Quaternion; color: THREE.Color }[] = [];
    const { tLo, mode } = normConfig;

    for (const [key, v] of bins) {
      const [i, k] = key.split(',').map((n) => parseInt(n, 10));
      const cx = (i + 0.5) * worldCellSize;
      const cz = (k + 0.5) * worldCellSize;
      // セルの代表値: 平均
      const avg = v.sum / v.count;

      // ObjectOverlay と同じ正規化
      let t = (transform(clamp(avg, 0, Infinity), mode) - tLo) / normConfig.denom;
      t = Math.pow(clamp(t, 0, 1), colorIntensity); // γ補正
      t = clamp(t * colorScale, 0, 1); // UIゲイン（1回だけ）

      if (t < minThreshold || t > maxThreshold) continue;

      const origin = new THREE.Vector3(cx, rayY, cz);
      raycaster.set(origin, new THREE.Vector3(0, -1, 0));
      const hit = raycaster.intersectObject(group, true)[0];
      if (!hit || !hit.face) continue;

      const n = nTmp.copy(hit.face.normal).normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(up, n);
      const pos = hit.point.clone().add(n.multiplyScalar(offset));
      out.push({ pos, quat, color: lerpColor(t) });
    }
    return out;
  }, [bins, group, worldCellSize, offset, normConfig, minThreshold, maxThreshold, colorIntensity, colorScale, targetLayer]);

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

  if (count === 0) return null;

  return (
    <instancedMesh
      ref={instRef}
      args={[undefined, undefined, count]} /* eslint-disable-line react/no-unknown-property */
      renderOrder={zIndexes.renderOrder.heatmap} /* eslint-disable-line react/no-unknown-property */
      frustumCulled={false} /* eslint-disable-line react/no-unknown-property */
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
