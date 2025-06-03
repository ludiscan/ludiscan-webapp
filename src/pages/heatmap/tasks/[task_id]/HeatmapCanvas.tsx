import { OrbitControls } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import { Vector3 } from 'three';

import { PositionPointMarkers } from './PositionPointMarkers';

import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';
import type { Group } from 'three';

import { useCanvasState } from '@src/hooks/useCanvasState';
import { EventLogMarkers } from '@src/pages/heatmap/tasks/[task_id]/EventLogMarkers';
import { HotspotCircles } from '@src/pages/heatmap/tasks/[task_id]/HotspotCircles';
import { LocalModelLoader, StreamModelLoader } from '@src/pages/heatmap/tasks/[task_id]/ModelLoader';

type HeatmapCanvasProps = {
  model: Group | null;
  service: HeatmapDataService;
  map?: string | ArrayBuffer | null;
  modelType?: 'gltf' | 'glb' | 'obj' | 'server' | null;
  pointList: { x: number; y: number; z?: number; density: number }[];
};

const Component: FC<HeatmapCanvasProps> = ({ model, map, modelType, pointList, service }) => {
  // const { invalidate } = useThree();
  const {
    general: { showHeatmap },
    eventLogs,
  } = useCanvasState();
  const orbitControlsRef = useRef(null);

  const visibleEventLogs = useMemo(() => eventLogs.filter((event) => event.visible), [eventLogs]);

  // useEffect(() => {
  //   const handleInvalidate = () => {
  //     invalidate();
  //   };
  //
  //   canvasEventBus.on('invalidate', handleInvalidate);
  //
  //   return () => {
  //     canvasEventBus.off('invalidate', handleInvalidate);
  //   };
  // }, [invalidate]);

  return (
    <>
      <ambientLight intensity={0.3} /> {/* eslint-disable-line react/no-unknown-property */}
      <directionalLight position={[10, 10, 10]} intensity={3} castShadow={true} /> {/* eslint-disable-line react/no-unknown-property */}
      {modelType && map && modelType !== 'server' && typeof map === 'string' && <LocalModelLoader modelPath={map} modelType={modelType} />}
      {modelType && model && modelType === 'server' && typeof map !== 'string' && <StreamModelLoader model={model} />}
      {pointList && showHeatmap && <PositionPointMarkers points={pointList} />}
      {pointList && showHeatmap && <HotspotCircles points={pointList} />}
      {visibleEventLogs.length > 0 &&
        visibleEventLogs.map((event) => <EventLogMarkers key={event.key} logName={event.key} service={service} color={event.color} />)}
      <OrbitControls enableZoom enablePan enableRotate ref={orbitControlsRef} position0={new Vector3(1, 1, 3000)} />
    </>
  );
};

export const HeatMapCanvas = Component;
