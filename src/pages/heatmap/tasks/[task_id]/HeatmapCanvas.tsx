import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';

import type { FC } from 'react';

import { ModelViewer } from '@/component/molecules/ModelViewer.tsx';
import PointMarkers from '@/component/molecules/PointMarkers';
import { useCanvasState } from '@/hooks/useCanvasState.ts';
import { canvasEventBus } from '@/utils/canvasEventBus.ts';

type HeatmapCanvasProps = {
  modelPath: string | null;
  modelType: 'gltf' | 'glb' | 'obj' | null;
  pointList: { x: number; y: number; z?: number; density: number }[];
};

const Component: FC<HeatmapCanvasProps> = ({ modelPath, modelType, pointList }) => {
  const { invalidate } = useThree();
  const { upZ } = useCanvasState();
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
  const points = useMemo(() => {
    return pointList.map((point) => ({
      x: point.x,
      y: upZ ? (point.z ?? 0) : point.y,
      z: upZ ? point.y : (point.z ?? 0),
      density: point.density,
    }));
  }, [pointList, upZ]);

  return (
    <>
      <ambientLight /> {/* eslint-disable-line react/no-unknown-property */}
      <directionalLight position={[400, 400, 400]} intensity={2} /> {/* eslint-disable-line react/no-unknown-property */}
      {modelPath && modelType && <ModelViewer modelPath={modelPath} modelType={modelType} />}
      {points && <PointMarkers points={points} />}
      <OrbitControls enableZoom enablePan enableRotate ref={orbitControlsRef} />
    </>
  );
};

export const HeatMapCanvas = Component;
