import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';

import { PointMarkers } from './PointMarkers.tsx';

import type { FC } from 'react';
import type { Group } from 'three';

import { useCanvasState } from '@/hooks/useCanvasState.ts';
import { HotspotCircles } from '@/pages/heatmap/tasks/[task_id]/HotspotCircles.tsx';
import { LocalModelLoader, StreamModelLoader } from '@/pages/heatmap/tasks/[task_id]/ModelLoader.tsx';
import { canvasEventBus } from '@/utils/canvasEventBus.ts';

type HeatmapCanvasProps = {
  model: Group | null;
  map?: string | ArrayBuffer | null;
  modelType?: 'gltf' | 'glb' | 'obj' | 'server' | null;
  pointList: { x: number; y: number; z?: number; density: number }[];
};

const Component: FC<HeatmapCanvasProps> = ({ model, map, modelType, pointList }) => {
  const { invalidate } = useThree();
  const {
    general: { showHeatmap },
  } = useCanvasState();
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
      {modelType && map && modelType !== 'server' && typeof map === 'string' && <LocalModelLoader modelPath={map} modelType={modelType} />}
      {modelType && model && modelType === 'server' && typeof map !== 'string' && <StreamModelLoader model={model} />}
      {pointList && showHeatmap && <PointMarkers points={pointList} />}
      {pointList && showHeatmap && <HotspotCircles points={pointList} />}
      <OrbitControls enableZoom enablePan enableRotate ref={orbitControlsRef} />
    </>
  );
};

export const HeatMapCanvas = Component;
