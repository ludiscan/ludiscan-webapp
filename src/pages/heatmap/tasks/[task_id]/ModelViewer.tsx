import { useLoader } from '@react-three/fiber';
import { Suspense } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import { useCanvasState } from '@/hooks/useCanvasState.ts';

type ModelViewerProps = {
  modelPath: string;
  modelType: 'gltf' | 'glb' | 'obj';
};

const Component: React.FC<ModelViewerProps> = ({ modelPath, modelType }) => {
  const {
    general: { scale },
  } = useCanvasState();
  const model = useLoader(modelType == 'obj' ? OBJLoader : GLTFLoader, modelPath);
  return (
    <Suspense fallback={null}>
      <primitive
        object={'scene' in model ? model.scene : model} // eslint-disable-line react/no-unknown-property
        position={[0, 1, 0]} // eslint-disable-line react/no-unknown-property
        scale={[scale, scale, scale]} // eslint-disable-line react/no-unknown-property
        castShadow={true} // eslint-disable-line react/no-unknown-property
      />
      <shadowMaterial opacity={1} />
    </Suspense>
  );
};

export const ModelViewer = Component;
