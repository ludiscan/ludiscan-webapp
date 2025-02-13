import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import type { FC } from 'react';

import { ModelViewer } from '@/component/molecules/ModelViewer.tsx';
import PointMarkers from '@/component/molecules/PointMarkers';
import { useCanvasState } from '@/hooks/useCanvasState.ts';
import PointCircles from '@/pages/heatmap/tasks/[task_id]/PointCircles.tsx';
import { canvasEventBus } from '@/utils/canvasEventBus.ts';

type HeatmapCanvasProps = {
  modelPath: string | null;
  modelType: 'gltf' | 'glb' | 'obj' | null;
  pointList: { x: number; y: number; z?: number; density: number }[];
};

const Component: FC<HeatmapCanvasProps> = ({ modelPath, modelType, pointList }) => {
  const { invalidate } = useThree();
  const { showHeatmap } = useCanvasState();
  const orbitControlsRef = useRef(null);

  useEffect(() => {
    const handleInvalidate = () => {
      invalidate();
    };

    canvasEventBus.addListener('invalidate', handleInvalidate);

    return () => {
      canvasEventBus.removeListener('invalidate', handleInvalidate);
    };
  }, [invalidate]);

  return (
    <>
      <ambientLight intensity={0.3} /> {/* eslint-disable-line react/no-unknown-property */}
      <directionalLight position={[10, 10, 10]} intensity={3} castShadow /> {/* eslint-disable-line react/no-unknown-property */}
      {modelPath && modelType && <ModelViewer modelPath={modelPath} modelType={modelType} />}
      {pointList && showHeatmap && <PointMarkers points={pointList} />}
      {pointList && showHeatmap && <PointCircles points={pointList} />}
      <OrbitControls enableZoom enablePan enableRotate ref={orbitControlsRef} />
    </>
  );
};

export const HeatMapCanvas = Component;
