import styled from '@emotion/styled';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';

import type { HeatmapTask } from '@/modeles/heatmaptask.ts';
import type { FC } from 'react';

import { FlexColumn } from '@/component/atoms/Flex.tsx';
import { HeatMapCanvas } from '@/pages/heatmap/tasks/[task_id]/HeatmapCanvas.tsx';
import { dimensions } from '@/styles/style.ts';

export type HeatmapViewerProps = {
  className?: string | undefined;
  task: HeatmapTask;
};

const Component: FC<HeatmapViewerProps> = ({ className, task }) => {
  const [modelPath, setModelPath] = useState<string | null>(null);
  const [modelType, setModelType] = useState<'gltf' | 'glb' | 'obj' | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <FlexColumn className={className} align={'center'}>
      <input className={`${className}__inputfile`} type='file' accept='.gltf,.glb,.obj,.bin,.png' multiple onChange={handleFileChange} />
      <div className={`${className}__canvas`}>
        <Canvas camera={{ position: [500, 500, 500], fov: 50, near: 0.1, far: 10000 }}>
          <HeatMapCanvas modelPath={modelPath} modelType={modelType} pointList={task?.result ?? []} />
        </Canvas>
      </div>
    </FlexColumn>
  );
};

export const HeatMapViewer = styled(Component)`
  width: 100%;

  &__inputfile {
    width: 100%;
    height: 40px;
  }

  &__canvas {
    width: 100%;
    height: calc(90vh - ${dimensions.headerHeight}px);
  }
`;
