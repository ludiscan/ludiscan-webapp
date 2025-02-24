import styled from '@emotion/styled';
import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { HeatmapTask } from '@/modeles/heatmaptask.ts';
import type { PerformanceMonitorApi } from '@react-three/drei';
import type { FC } from 'react';

import { FlexColumn, FlexRow } from '@/component/atoms/Flex.tsx';
import { useCanvasState } from '@/hooks/useCanvasState.ts';
import { query } from '@/modeles/qeury.ts';
import { HeatMapCanvas } from '@/pages/heatmap/tasks/[task_id]/HeatmapCanvas.tsx';
import { HeatmapMenu } from '@/pages/heatmap/tasks/[task_id]/HeatmapMenu.tsx';
import { PerformanceList } from '@/pages/heatmap/tasks/[task_id]/PerformanceList.tsx';
import { dimensions, zIndexes } from '@/styles/style.ts';

export type HeatmapViewerProps = {
  className?: string | undefined;
  task: HeatmapTask;
};

const Component: FC<HeatmapViewerProps> = ({ className, task }) => {
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
    queryKey: ['mapList', taskId],
    queryFn: async () => {
      if (!taskId) return;
      const { data, error } = await query.GET('/api/v0/heatmap/tasks/{task_id}/maps', {
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
    queryKey: ['mapData', mapName],
    queryFn: async () => {
      if (!mapName) return undefined;
      const { data, error } = await query.GET('/api/v0/heatmap/map_data/{map_name}', {
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

  return (
    <FlexColumn className={className} align={'center'}>
      {/*<input className={`${className}__inputfile`} type='file' accept='.gltf,.glb,.obj,.bin,.png' multiple onChange={handleFileChange} />*/}
      <FlexRow className={`${className}__canvasBox`} wrap={'nowrap'}>
        <div className={`${className}__canvasMenu`}>
          <HeatmapMenu isMenuOpen={isMenuOpen} toggleMenu={handleMenuClose} mapOptions={mapList ?? []} />
        </div>
        <div className={`${className}__canvas`}>
          <Canvas camera={{ position: [2500, 2500, 2500], fov: 50, near: 10, far: 10000 }} ref={canvasRef} dpr={dpr}>
            <PerformanceMonitor factor={1} onChange={handleOnPerformance} />
            <HeatMapCanvas pointList={pointList} map={map} modelType={modelType} />
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
    left: 0;
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
