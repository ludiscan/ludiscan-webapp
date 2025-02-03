import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { ModelViewer } from '../../../../component/molecules/ModelViewer';
import PointMarkers from '../../../../component/molecules/PointMarkers';
import { query } from '../../../../modeles/qeury';

import type { HeatmapTask } from '../../../../modeles/heatmaptask';
import type { FC } from 'react';

type HeatMapViewerProps = {
  modelPath: string | null;
  modelType: 'gltf' | 'glb' | 'obj' | null;
  taskId: string;
};

const Component: FC<HeatMapViewerProps> = ({ modelPath, modelType, taskId }) => {
  const { data: task } = useQuery({
    queryKey: ['heatmap', taskId],
    queryFn: async (): Promise<HeatmapTask | undefined> => {
      const { data, error } = await query.GET('/api/v0/heatmap/tasks/{task_id}', {
        params: { path: { task_id: Number(taskId) } },
      });
      if (error) return undefined;
      return data;
    },
  });

  const points = useMemo(() => {
    if (!task) return [];
    return task.result?.map((point) => ({
      x: point.x,
      y: point.z ?? 0,
      z: point.y,
      density: point.density,
    }));
  }, [task]);

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

export const HeatMapViewer = Component;
