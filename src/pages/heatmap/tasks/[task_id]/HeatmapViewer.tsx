import styled from '@emotion/styled';
import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { PerformanceMonitorApi } from '@react-three/drei';
import type { Env } from '@src/modeles/env';
import type { HeatmapTask } from '@src/modeles/heatmaptask';
import type { FC } from 'react';

import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { useCanvasState } from '@src/hooks/useCanvasState';
import { createClient } from '@src/modeles/qeury';
import { HeatMapCanvas } from '@src/pages/heatmap/tasks/[task_id]/HeatmapCanvas';
import { HeatmapMenu } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenu';
import { useOBJFromArrayBuffer } from '@src/pages/heatmap/tasks/[task_id]/ModelLoader';
import { PerformanceList } from '@src/pages/heatmap/tasks/[task_id]/PerformanceList';
import { dimensions, zIndexes } from '@src/styles/style';

export type HeatmapViewerProps = {
  className?: string | undefined;
  task: HeatmapTask;
  env?: Env | undefined;
};

const Component: FC<HeatmapViewerProps> = ({ className, task, env }) => {
  const [map, setMap] = useState<string | ArrayBuffer | null>(null);
  const [modelType, setModelType] = useState<'gltf' | 'glb' | 'obj' | 'server' | null>(null);
  const [dpr, setDpr] = useState(2);
  const [performance, setPerformance] = useState<PerformanceMonitorApi>();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const {
    general: { mapName },
  } = useCanvasState();

  const taskId = useMemo(() => task.taskId, [task]);

  const { data: mapList } = useQuery({
    queryKey: ['mapList', taskId, env],
    queryFn: async () => {
      if (!taskId || !env) return [];
      const { data, error } = await createClient(env).GET('/api/v0/heatmap/tasks/{task_id}/maps', {
        params: {
          path: {
            task_id: taskId,
          },
        },
      });
      if (error) throw error;
      return data?.maps || [];
    },
  });

  const { data: mapContent } = useQuery({
    queryKey: ['mapData', mapName, env],
    queryFn: async () => {
      if (!mapName || !env) return null;
      const { data, error } = await createClient(env).GET('/api/v0/heatmap/map_data/{map_name}', {
        params: {
          path: {
            map_name: mapName,
          },
        },
        parseAs: 'arrayBuffer',
      });
      if (error) throw error;
      return data;
    },
  });

  const { data: generalLogKeys } = useQuery({
    queryKey: ['general', task, env],
    queryFn: async () => {
      if (!task || !env) return null;
      const { data, error } = await createClient(env).GET('/api/v0/general_log/position/keys', {
        params: {
          query: {
            project_id: task.project.id,
            session_id: task.session?.sessionId,
          },
        },
      });
      if (error) throw error;
      return data.keys;
    },
  });

  useEffect(() => {
    if (!mapContent) return;
    setMap(mapContent);
    setModelType('server');
  }, [mapContent]);

  // const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
  //   const files = event.target.files;
  //   if (!files || files.length === 0) return;
  //
  //   let mainFile: File | null = null;
  //   const additionalFiles: File[] = [];
  //
  //   // ファイルリストを走査
  //   Array.from(files).forEach((file) => {
  //     const ext = file.name.split('.').pop()?.toLowerCase();
  //
  //     if (ext === 'gltf' || ext === 'glb' || ext === 'obj') {
  //       mainFile = file;
  //       setModelType(ext as 'gltf' | 'glb' | 'obj');
  //     } else {
  //       additionalFiles.push(file);
  //     }
  //   });
  //
  //   if (!mainFile) return;
  //
  //   const objectURL = URL.createObjectURL(mainFile);
  //   setModelPath(objectURL);
  // };

  const pointList = useMemo(() => {
    return (
      task?.result?.map((point) => ({
        x: point.x - task.stepSize / 2,
        y: point.y - task.stepSize / 2,
        z: (point.z ?? 0) - task.stepSize / 2,
        density: point.density,
      })) ?? []
    );
  }, [task]);

  const handleMenuClose = useCallback((value: boolean) => {
    setIsMenuOpen(value);
  }, []);

  const handleOnPerformance = useCallback((api: PerformanceMonitorApi) => {
    setDpr(Math.floor(0.5 + 1.5 * api.factor));
    setPerformance(api);
  }, []);

  const buffer = useMemo(() => {
    if (typeof map === 'string') {
      return null;
    }
    return map;
  }, [map]);
  const model = useOBJFromArrayBuffer(buffer);

  return (
    <FlexColumn className={className} align={'center'}>
      {/*<input className={`${className}__inputfile`} type='file' accept='.gltf,.glb,.obj,.bin,.png' multiple onChange={handleFileChange} />*/}
      <FlexRow className={`${className}__canvasBox`} wrap={'nowrap'}>
        <div className={`${className}__canvasMenu`}>
          <HeatmapMenu
            task={task}
            isMenuOpen={isMenuOpen}
            toggleMenu={handleMenuClose}
            mapOptions={mapList ?? []}
            model={model}
            eventLogKeys={generalLogKeys ?? undefined}
          />
        </div>
        <div className={`${className}__canvas`}>
          <Canvas camera={{ position: [2500, 2500, 2500], fov: 50, near: 10, far: 10000 }} ref={canvasRef} dpr={dpr}>
            <PerformanceMonitor factor={1} onChange={handleOnPerformance} />
            <HeatMapCanvas task={task} pointList={pointList} map={map} modelType={modelType} model={model} env={env} />
          </Canvas>
          {performance && <PerformanceList api={performance} className={`${className}__performance`} />}
        </div>
      </FlexRow>
    </FlexColumn>
  );
};

export const HeatMapViewer = styled(Component)`
  width: 100%;

  &__inputfile {
    width: 100%;
    height: 40px;
  }

  &__canvasBox {
    position: relative;
    width: 100%;
    border: ${({ theme }) => `1px solid ${theme.colors.border.main}`};
  }

  &__canvasMenu {
    position: absolute;
    top: 0;
    right: 0;
    z-index: ${zIndexes.content + 2};
    max-width: 300px;
    max-height: 100%;
  }

  &__canvas {
    position: relative;
    width: 100%;
    height: calc(90vh - ${dimensions.headerHeight}px);
  }

  &__performance {
    position: absolute;
    top: 0;
    right: 10px;
  }
`;
