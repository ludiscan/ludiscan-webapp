import styled from '@emotion/styled';
import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useCallback, useMemo, useRef, useState } from 'react';

import type { HeatmapTask } from '@/modeles/heatmaptask.ts';
import type { PerformanceMonitorApi } from '@react-three/drei';
import type { FC, ChangeEvent } from 'react';

import { FlexColumn, FlexRow } from '@/component/atoms/Flex.tsx';
import { HeatMapCanvas } from '@/pages/heatmap/tasks/[task_id]/HeatmapCanvas.tsx';
import { HeatmapMenu } from '@/pages/heatmap/tasks/[task_id]/HeatmapMenu.tsx';
import { PerformanceList } from '@/pages/heatmap/tasks/[task_id]/PerformanceList.tsx';
import { dimensions, zIndexes } from '@/styles/style.ts';

export type HeatmapViewerProps = {
  className?: string | undefined;
  task: HeatmapTask;
};

const Component: FC<HeatmapViewerProps> = ({ className, task }) => {
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [modelType, setModelType] = useState<'gltf' | 'glb' | 'obj' | null>(null);
  const [dpr, setDpr] = useState(2);
  const [performance, setPerformance] = useState<PerformanceMonitorApi>();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let mainFile: File | null = null;
    const additionalFiles: File[] = [];

    // ファイルリストを走査
    Array.from(files).forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'gltf' || ext === 'glb' || ext === 'obj') {
        mainFile = file;
        setModelType(ext as 'gltf' | 'glb' | 'obj');
      } else {
        additionalFiles.push(file);
      }
    });

    if (!mainFile) return;

    const objectURL = URL.createObjectURL(mainFile);
    setModelPath(objectURL);
  };

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
      <input className={`${className}__inputfile`} type='file' accept='.gltf,.glb,.obj,.bin,.png' multiple onChange={handleFileChange} />
      <FlexRow className={`${className}__canvasBox`} wrap={'nowrap'}>
        <div className={`${className}__canvasMenu`}>
          <HeatmapMenu isMenuOpen={isMenuOpen} toggleMenu={handleMenuClose} />
        </div>
        <div className={`${className}__canvas`}>
          <Canvas camera={{ position: [2500, 2500, 2500], fov: 50, near: 10, far: 10000 }} ref={canvasRef} dpr={dpr}>
            <PerformanceMonitor factor={1} onChange={handleOnPerformance} />
            <HeatMapCanvas modelPath={modelPath} modelType={modelType} pointList={pointList} />
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
