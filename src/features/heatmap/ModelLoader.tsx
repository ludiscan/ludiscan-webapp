import { useLoader } from '@react-three/fiber';
import { Suspense, useState, useEffect } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import type { FC, RefObject } from 'react';
import type { Group } from 'three';

import { setRaycastLayerRecursive } from '@src/features/heatmap/ObjectToggleList';
import { useSelectable } from '@src/features/heatmap/selection/hooks';
import { useGeneralSelect } from '@src/hooks/useGeneral';

type LocalModelLoaderProps = {
  modelPath: string;
  modelType: 'gltf' | 'glb' | 'obj';
  ref: RefObject<Group | null>;
};

const LocalModelLoaderContent: FC<LocalModelLoaderProps> = ({ modelPath, modelType, ref }) => {
  const scale = useGeneralSelect((s) => s.scale);
  const model = useLoader(modelType == 'obj' ? OBJLoader : GLTFLoader, modelPath);
  const handlers = useSelectable('map-mesh', { fit: 'object' });
  return (
    <group
      ref={ref}
      dispose={null} // eslint-disable-line react/no-unknown-property
      {...handlers}
    >
      <primitive
        object={'scene' in model ? model.scene : model} // eslint-disable-line react/no-unknown-property
        position={[0, 1, 0]} // eslint-disable-line react/no-unknown-property
        scale={[scale, scale, scale]}
        castShadow={true} // eslint-disable-line react/no-unknown-property
      />
      <shadowMaterial opacity={1} />
    </group>
  );
};

export const LocalModelLoader = LocalModelLoaderContent;

type StreamModelLoaderProps = {
  model: Group;
  ref: RefObject<Group | null>;
};
/**
 * ArrayBuffer から OBJ ファイルをパースして Three.js の Group を返すカスタムフック
 * @param arrayBuffer OBJ ファイルの ArrayBuffer。存在しない場合は null
 * @returns Three.js の Group オブジェクト（パース成功時）または null
 */
export function useOBJFromArrayBuffer(arrayBuffer: ArrayBuffer | null): Group | null {
  const [object3d, setObject3d] = useState<Group | null>(null);

  useEffect(() => {
    if (!arrayBuffer) return;

    // ArrayBuffer をテキストに変換
    const text = new TextDecoder('utf-8').decode(arrayBuffer);
    const loader = new OBJLoader();

    try {
      const obj = loader.parse(text);
      setRaycastLayerRecursive(obj, true);
      setObject3d(obj);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      /* empty */
    }
  }, [arrayBuffer]);

  return object3d;
}

const StreamModelLoaderComponent: FC<StreamModelLoaderProps> = ({ model, ref }) => {
  const scale = useGeneralSelect((s) => s.scale);
  return (
    <Suspense fallback={null}>
      <group
        ref={ref}
        dispose={null} // eslint-disable-line react/no-unknown-property
      >
        {model && (
          <primitive
            object={model} // eslint-disable-line react/no-unknown-property
            position={[0, 1, 0]} // eslint-disable-line react/no-unknown-property
            scale={[scale, scale, scale]}
            castShadow={true} // eslint-disable-line react/no-unknown-property
          />
        )}
        <shadowMaterial opacity={1} />
      </group>
    </Suspense>
  );
};

export const StreamModelLoader = StreamModelLoaderComponent;
