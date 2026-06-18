import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import { Box3, MathUtils, Vector3 } from 'three';

import type { ModelFileType } from '@src/features/heatmap/ModelLoader';
import type { FC } from 'react';
import type { Group } from 'three';

import { useModelFromArrayBuffer } from '@src/features/heatmap/ModelLoader';

export type MapModelPreviewProps = {
  buffer: ArrayBuffer | null;
  fileType: ModelFileType | null;
  // 度・均等スケール（プロジェクトMapsタブの配置エディタと同じ単位）
  position: [number, number, number];
  rotationDeg: [number, number, number];
  scale: number;
};

/**
 * モデル読み込み時にカメラをモデル全体が収まる位置へ一度だけ合わせる。
 * 以降は OrbitControls でユーザーが自由に操作する。
 */
const FitCamera: FC<{ model: Group | null }> = ({ model }) => {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as { target: Vector3; update: () => void } | null;

  useEffect(() => {
    if (!model) return;
    const box = new Box3().setFromObject(model);
    if (box.isEmpty()) return;
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const dist = maxDim * 2.2;

    camera.position.set(center.x + dist, center.y + dist, center.z + dist);
    camera.near = Math.max(dist / 1000, 0.01);
    camera.far = dist * 1000;
    if ('updateProjectionMatrix' in camera) camera.updateProjectionMatrix();
    camera.lookAt(center);
    if (controls) {
      controls.target.copy(center);
      controls.update();
    }
  }, [model, camera, controls]);

  return null;
};

/**
 * map モデルの軽量3Dプレビュー（heatmap の Redux/Canvas に依存しない自己完結版）。
 * position/rotation/scale はプレビュー表示にのみ反映する。
 */
export const MapModelPreview: FC<MapModelPreviewProps> = ({ buffer, fileType, position, rotationDeg, scale }) => {
  const model = useModelFromArrayBuffer(buffer, fileType);
  const rotationRad: [number, number, number] = [MathUtils.degToRad(rotationDeg[0]), MathUtils.degToRad(rotationDeg[1]), MathUtils.degToRad(rotationDeg[2])];

  return (
    <Canvas camera={{ position: [100, 100, 100], fov: 50, near: 0.1, far: 1_000_000 }}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <ambientLight intensity={1} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <directionalLight position={[1, 2, 1]} intensity={0.8} />
      {/* eslint-disable-next-line react/no-unknown-property */}
      <directionalLight position={[-1, 0.5, -1]} intensity={0.3} />
      <OrbitControls makeDefault />
      <group
        position={position} // eslint-disable-line react/no-unknown-property
        rotation={rotationRad} // eslint-disable-line react/no-unknown-property
        scale={[scale, scale, scale]}
      >
        {/* eslint-disable-next-line react/no-unknown-property */}
        {model && <primitive object={model} />}
      </group>
      <FitCamera model={model} />
    </Canvas>
  );
};
