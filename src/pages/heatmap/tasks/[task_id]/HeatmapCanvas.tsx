import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';

import type { FC } from 'react';

import { ModelViewer } from '@/component/molecules/ModelViewer.tsx';
import PointMarkers from '@/component/molecules/PointMarkers';

type HeatmapCanvasProps = {
  modelPath: string | null;
  modelType: 'gltf' | 'glb' | 'obj' | null;
  pointList: { x: number; y: number; z?: number; density: number }[];
};

const Component: FC<HeatmapCanvasProps> = ({ modelPath, modelType, pointList }) => {
  const points = useMemo(() => {
    return pointList.map((point) => ({
      x: point.x,
      y: point.z ?? 0,
      z: point.y,
      density: point.density,
    }));
  }, [pointList]);

  return (
    <Canvas camera={{ position: [5, 5, 5], fov: 50 }}>
      <ambientLight intensity={0.5} /> {/* eslint-disable-line react/no-unknown-property */}
      <directionalLight position={[10, 10, 10]} intensity={1} /> {/* eslint-disable-line react/no-unknown-property */}
      {modelPath && modelType && <ModelViewer modelPath={modelPath} modelType={modelType} />}
      {points && <PointMarkers points={points} />}
      <OrbitControls enableZoom enablePan enableRotate />
    </Canvas>
  );
};

export const HeatMapCanvas = Component;
