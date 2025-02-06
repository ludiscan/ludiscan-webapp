import styled from '@emotion/styled';
import { useState } from 'react';

import type { HeatmapTask } from '@/modeles/heatmaptask.ts';
import type { FC } from 'react';

import { HeatMapCanvas } from '@/pages/heatmap/tasks/[task_id]/HeatmapCanvas.tsx';

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
    <div className={className}>
      <input type='file' accept='.gltf,.glb,.obj,.bin,.png' multiple onChange={handleFileChange} />
      <HeatMapCanvas modelPath={modelPath} modelType={modelType} pointList={task?.result ?? []} />
    </div>
  );
};

export const HeatMapViewer = styled(Component)``;
