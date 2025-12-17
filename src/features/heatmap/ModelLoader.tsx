import { useLoader } from '@react-three/fiber';
import { Suspense, useState, useEffect, memo, useMemo } from 'react';
import { Color, MathUtils, MeshLambertMaterial, MeshPhongMaterial, MeshStandardMaterial } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import type { FC, RefObject } from 'react';
import type { Group, Mesh, Material } from 'three';

export type ModelFileType = 'obj' | 'fbx' | 'gltf' | 'glb';

import { setRaycastLayerRecursive } from '@src/features/heatmap/ObjectToggleList';
import { useSelectable } from '@src/features/heatmap/selection/hooks';
import { useGeneralPick } from '@src/hooks/useGeneral';

/**
 * FBXモデルのマテリアルを修正する
 * FBXLoaderで読み込んだマテリアルが真っ黒になる問題を防ぐ
 */
function fixFBXMaterials(object: Group): void {
  object.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      materials.forEach((material: Material, index: number) => {
        // MeshLambertMaterialの場合（FBXで使われることがある）
        if (material instanceof MeshLambertMaterial) {
          // 新しいマテリアルを作成（テクスチャは保持、色と発光を調整）
          const newMaterial = new MeshLambertMaterial({
            map: material.map,
            color: 0xffffff,
            emissive: 0x444444,
            emissiveIntensity: 1.0,
          });

          if (Array.isArray(mesh.material)) {
            mesh.material[index] = newMaterial;
          } else {
            mesh.material = newMaterial;
          }
          return;
        }
        // MeshPhongMaterialの場合
        else if (material instanceof MeshPhongMaterial) {
          material.color = new Color(0xffffff);
          material.emissive = new Color(0x222222);
          material.shininess = 30;
          material.needsUpdate = true;
        }
        // MeshStandardMaterialの場合
        else if (material instanceof MeshStandardMaterial) {
          material.color = new Color(0xffffff);
          material.emissive = new Color(0x111111);
          material.metalness = 0.1;
          material.roughness = 0.6;
          material.needsUpdate = true;
        }
      });
    }
  });
}

type LocalModelLoaderProps = {
  modelPath: string;
  modelType: 'gltf' | 'glb' | 'obj';
  ref: RefObject<Group | null>;
};

const LocalModelLoaderContent: FC<LocalModelLoaderProps> = ({ modelPath, modelType, ref }) => {
  const { scale, modelPositionX, modelPositionY, modelPositionZ, modelRotationX, modelRotationY, modelRotationZ } = useGeneralPick(
    'scale',
    'modelPositionX',
    'modelPositionY',
    'modelPositionZ',
    'modelRotationX',
    'modelRotationY',
    'modelRotationZ',
  );
  const model = useLoader(modelType === 'obj' ? OBJLoader : GLTFLoader, modelPath);
  const handlers = useSelectable('map-mesh', { fit: 'object' });

  // ユーザー設定値は親グループに適用（モデルの元の変換を保持するため）
  const userRotation: [number, number, number] = useMemo(
    () => [MathUtils.degToRad(modelRotationX), MathUtils.degToRad(modelRotationY), MathUtils.degToRad(modelRotationZ)],
    [modelRotationX, modelRotationY, modelRotationZ],
  );

  return (
    <group
      ref={ref}
      dispose={null} // eslint-disable-line react/no-unknown-property
      position={[modelPositionX, modelPositionY, modelPositionZ]} // eslint-disable-line react/no-unknown-property
      rotation={userRotation} // eslint-disable-line react/no-unknown-property
      scale={[scale, scale, scale]}
      {...handlers}
    >
      {/* primitiveにはposition/rotation/scaleを設定せず、モデルの元の変換を保持 */}
      <primitive
        object={'scene' in model ? model.scene : model} // eslint-disable-line react/no-unknown-property
        castShadow={true} // eslint-disable-line react/no-unknown-property
      />
      <shadowMaterial opacity={1} />
    </group>
  );
};

export const LocalModelLoader = memo(
  LocalModelLoaderContent,
  (prev, next) => prev.modelPath === next.modelPath && prev.modelType === next.modelType && prev.ref === next.ref,
);

type StreamModelLoaderProps = {
  model: Group;
  ref: RefObject<Group | null>;
};
/**
 * ファイル名から拡張子を取得してModelFileTypeを返す
 * @param fileName ファイル名
 * @returns ModelFileType または null（サポートされていない形式の場合）
 */
export function getModelFileType(fileName: string): ModelFileType | null {
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'obj':
      return 'obj';
    case 'fbx':
      return 'fbx';
    case 'gltf':
      return 'gltf';
    case 'glb':
      return 'glb';
    default:
      return null;
  }
}

/**
 * ArrayBuffer から 3Dモデルファイル（OBJ/FBX）をパースして Three.js の Group を返すカスタムフック
 * @param arrayBuffer モデルファイルの ArrayBuffer。存在しない場合は null
 * @param fileType ファイル形式（'obj' | 'fbx'）。存在しない場合は 'obj'
 * @returns Three.js の Group オブジェクト（パース成功時）または null
 */
export function useModelFromArrayBuffer(arrayBuffer: ArrayBuffer | null, fileType: ModelFileType | null = 'obj'): Group | null {
  const [object3d, setObject3d] = useState<Group | null>(null);

  useEffect(() => {
    if (!arrayBuffer) {
      setObject3d(null);
      return;
    }

    const type = fileType ?? 'obj';

    try {
      if (type === 'obj') {
        // OBJ: テキスト形式なのでTextDecoderで変換してパース
        const text = new TextDecoder('utf-8').decode(arrayBuffer);
        const loader = new OBJLoader();
        const obj = loader.parse(text);
        setRaycastLayerRecursive(obj, true);
        setObject3d(obj);
      } else if (type === 'fbx') {
        // FBX: バイナリ形式なのでArrayBufferから直接パース
        const loader = new FBXLoader();
        const fbx = loader.parse(arrayBuffer, '');
        // FBXマテリアルの真っ黒問題を修正（色とemissiveが暗い場合のみ補正）
        fixFBXMaterials(fbx);
        setRaycastLayerRecursive(fbx, true);
        setObject3d(fbx);
      } else {
        // GLTF/GLB は useLoader を使用する必要があるため、ここではサポートしない
        // eslint-disable-next-line no-console
        console.warn(`Model type "${type}" is not supported for ArrayBuffer parsing. Use LocalModelLoader instead.`);
        setObject3d(null);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Failed to parse ${type.toUpperCase()} model from ArrayBuffer:`, error);
      setObject3d(null);
    }
  }, [arrayBuffer, fileType]);

  return object3d;
}

/**
 * ArrayBuffer から OBJ ファイルをパースして Three.js の Group を返すカスタムフック
 * @param arrayBuffer OBJ ファイルの ArrayBuffer。存在しない場合は null
 * @returns Three.js の Group オブジェクト（パース成功時）または null
 * @deprecated useModelFromArrayBuffer を使用してください
 */
export function useOBJFromArrayBuffer(arrayBuffer: ArrayBuffer | null): Group | null {
  return useModelFromArrayBuffer(arrayBuffer, 'obj');
}

const StreamModelLoaderComponent: FC<StreamModelLoaderProps> = ({ model, ref }) => {
  const { scale, modelPositionX, modelPositionY, modelPositionZ, modelRotationX, modelRotationY, modelRotationZ } = useGeneralPick(
    'scale',
    'modelPositionX',
    'modelPositionY',
    'modelPositionZ',
    'modelRotationX',
    'modelRotationY',
    'modelRotationZ',
  );

  // ユーザー設定値は親グループに適用（FBXの元の変換を保持するため）
  const userRotation: [number, number, number] = useMemo(
    () => [MathUtils.degToRad(modelRotationX), MathUtils.degToRad(modelRotationY), MathUtils.degToRad(modelRotationZ)],
    [modelRotationX, modelRotationY, modelRotationZ],
  );

  return (
    <Suspense fallback={null}>
      <group
        ref={ref}
        dispose={null} // eslint-disable-line react/no-unknown-property
        position={[modelPositionX, modelPositionY, modelPositionZ]} // eslint-disable-line react/no-unknown-property
        rotation={userRotation} // eslint-disable-line react/no-unknown-property
        scale={[scale, scale, scale]}
      >
        {/* primitiveにはposition/rotation/scaleを設定せず、FBXの元の変換を保持 */}
        {model && (
          <primitive
            object={model} // eslint-disable-line react/no-unknown-property
            castShadow={true} // eslint-disable-line react/no-unknown-property
          />
        )}
        <shadowMaterial opacity={1} />
      </group>
    </Suspense>
  );
};

export const StreamModelLoader = memo(StreamModelLoaderComponent, (prev, next) => prev.model === next.model && prev.ref === next.ref);
