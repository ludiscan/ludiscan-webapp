import styled from '@emotion/styled';
import { useState } from 'react';
import { useParams } from 'react-router-dom';

import { HeatMapViewer } from './HeatmapViewer';

export type HeatMapTaskIdPageProps = {
  className?: string;
};

const Component: React.FC<HeatMapTaskIdPageProps> = ({ className }) => {
  const { task_id: taskId } = useParams();
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

  if (!taskId || isNaN(Number(taskId))) {
    return <div>Invalid Task ID</div>;
  }

  return (
    <div className={className}>
      <h1>Task ID: {taskId}</h1>
      <input type='file' accept='.gltf,.glb,.obj,.bin,.png' multiple onChange={handleFileChange} />
      <HeatMapViewer modelPath={modelPath} modelType={modelType} taskId={taskId} />
    </div>
  );
};

export const HeatMapTaskIdPage = styled(Component)`
  overflow-x: hidden;
  overflow-y: auto;
  input {
    margin-bottom: 10px;
  }
`;
