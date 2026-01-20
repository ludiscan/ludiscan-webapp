import { useLoader } from '@react-three/fiber';
import { Suspense, useState, useEffect, memo, useMemo, useCallback, useRef } from 'react';
import { Color, MathUtils, MeshLambertMaterial, MeshPhongMaterial, MeshStandardMaterial } from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

import type { ThreeEvent } from '@react-three/fiber';
import type { OpacityLevel } from '@src/features/heatmap/MapObjectContextMenu';
import type { FC, RefObject } from 'react';
import type { Group, Mesh, Material, Object3D } from 'three';

export type ModelFileType = 'obj' | 'fbx' | 'gltf' | 'glb';

import { setRaycastLayerRecursive } from '@src/features/heatmap/ObjectToggleList';
import { useSelectable } from '@src/features/heatmap/selection/hooks';
import { useGeneralPick, useGeneralSelect } from '@src/hooks/useGeneral';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

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

/**
 * モデルの全メッシュにシャドウ設定を適用する
 */
function applyShadowSettings(object: Group, receiveShadow: boolean): void {
  object.traverse((child) => {
    if ((child as Mesh).isMesh) {
      const mesh = child as Mesh;
      mesh.receiveShadow = receiveShadow;
    }
  });
}

/**
 * LocalStorageからオブジェクトの表示状態を取得する
 */
function getObjectDisplayState(mapName: string, modelName: string | undefined, uuid: string): { visible: boolean; opacity: OpacityLevel } {
  const storageKey = `ObjectToggleList:${mapName}:${modelName ?? 'Model'}`;
  const saved = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as Record<string, { visible: boolean; opacity: OpacityLevel }>;
      if (parsed[uuid]) {
        return parsed[uuid];
      }
    } catch {
      // Ignore corrupted data
    }
  }
  return { visible: true, opacity: 1.0 };
}

/**
 * 親オブジェクトを辿って直接の子オブジェクトを見つける
 */
function findDirectChild(model: Group, intersectedObject: Object3D): Object3D | null {
  let current: Object3D | null = intersectedObject;
  while (current) {
    if (current.parent === model) {
      return current;
    }
    current = current.parent;
  }
  return null;
}

type LocalModelLoaderProps = {
  modelPath: string;
  modelType: 'gltf' | 'glb' | 'obj';
  ref: RefObject<Group | null>;
};

const LocalModelLoaderContent: FC<LocalModelLoaderProps> = ({ modelPath, modelType, ref }) => {
  const { scale, modelPositionX, modelPositionY, modelPositionZ, modelRotationX, modelRotationY, modelRotationZ, showShadow } = useGeneralPick(
    'scale',
    'modelPositionX',
    'modelPositionY',
    'modelPositionZ',
    'modelRotationX',
    'modelRotationY',
    'modelRotationZ',
    'showShadow',
  );
  const model = useLoader(modelType === 'obj' ? OBJLoader : GLTFLoader, modelPath);
  const handlers = useSelectable('map-mesh', { fit: 'object' });

  // モデルにシャドウ設定を適用
  const modelObject = 'scene' in model ? model.scene : model;
  useEffect(() => {
    if (modelObject) {
      applyShadowSettings(modelObject as Group, showShadow);
    }
  }, [modelObject, showShadow]);

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
        object={modelObject} // eslint-disable-line react/no-unknown-property
      />
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
  const { scale, modelPositionX, modelPositionY, modelPositionZ, modelRotationX, modelRotationY, modelRotationZ, showShadow } = useGeneralPick(
    'scale',
    'modelPositionX',
    'modelPositionY',
    'modelPositionZ',
    'modelRotationX',
    'modelRotationY',
    'modelRotationZ',
    'showShadow',
  );
  const mapName = useGeneralSelect((s) => s.mapName);

  // モデルにシャドウ設定を適用
  useEffect(() => {
    if (model) {
      applyShadowSettings(model, showShadow);
    }
  }, [model, showShadow]);

  // ユーザー設定値は親グループに適用（FBXの元の変換を保持するため）
  const userRotation: [number, number, number] = useMemo(
    () => [MathUtils.degToRad(modelRotationX), MathUtils.degToRad(modelRotationY), MathUtils.degToRad(modelRotationZ)],
    [modelRotationX, modelRotationY, modelRotationZ],
  );

  // 長押し検出用の状態
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressDataRef = useRef<{ object: Object3D; x: number; y: number } | null>(null);
  const LONG_PRESS_DURATION = 500; // 500ms で長押し判定

  // コンテキストメニューを表示する共通処理
  const showContextMenu = useCallback(
    (intersectedObject: Object3D, screenX: number, screenY: number) => {
      if (!model) return;

      // モデルの直接の子オブジェクトを見つける
      const directChild = findDirectChild(model, intersectedObject);
      if (!directChild) return;

      // 現在の表示状態をlocalStorageから取得
      const displayState = getObjectDisplayState(mapName ?? '', model.name, directChild.uuid);

      // コンテキストメニューイベントを発行
      heatMapEventBus.emit('map-object:context-menu', {
        uuid: directChild.uuid,
        name: directChild.name || directChild.type,
        visible: displayState.visible,
        opacity: displayState.opacity,
        position: { x: screenX, y: screenY },
      });
    },
    [model, mapName],
  );

  // 右クリックハンドラ（デスクトップ用）
  const handleContextMenu = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      const nativeEvent = event.nativeEvent;
      nativeEvent.preventDefault();

      const intersectedObject = event.object;
      if (!intersectedObject) return;

      showContextMenu(intersectedObject, nativeEvent.clientX, nativeEvent.clientY);
    },
    [showContextMenu],
  );

  // ポインターダウンハンドラ（長押し開始）
  const handlePointerDown = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      // 左クリック/タッチのみ対象
      if (event.nativeEvent.button !== 0) return;

      const intersectedObject = event.object;
      if (!intersectedObject) return;

      // 長押しデータを保存
      longPressDataRef.current = {
        object: intersectedObject,
        x: event.nativeEvent.clientX,
        y: event.nativeEvent.clientY,
      };

      // 長押しタイマーを開始
      longPressTimeoutRef.current = setTimeout(() => {
        if (longPressDataRef.current) {
          showContextMenu(longPressDataRef.current.object, longPressDataRef.current.x, longPressDataRef.current.y);
          longPressDataRef.current = null;
        }
      }, LONG_PRESS_DURATION);
    },
    [showContextMenu],
  );

  // ポインターアップハンドラ（長押しキャンセル）
  const handlePointerUp = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
    longPressDataRef.current = null;
  }, []);

  // ポインター移動ハンドラ（長押しキャンセル - 指が動いた場合）
  const handlePointerMove = useCallback((event: ThreeEvent<PointerEvent>) => {
    if (!longPressDataRef.current || !longPressTimeoutRef.current) return;

    // 移動距離が10px以上なら長押しをキャンセル
    const dx = event.nativeEvent.clientX - longPressDataRef.current.x;
    const dy = event.nativeEvent.clientY - longPressDataRef.current.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
      longPressDataRef.current = null;
    }
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Suspense fallback={null}>
      <group
        ref={ref}
        dispose={null} // eslint-disable-line react/no-unknown-property
        position={[modelPositionX, modelPositionY, modelPositionZ]} // eslint-disable-line react/no-unknown-property
        rotation={userRotation} // eslint-disable-line react/no-unknown-property
        scale={[scale, scale, scale]}
        onContextMenu={handleContextMenu}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        {/* primitiveにはposition/rotation/scaleを設定せず、FBXの元の変換を保持 */}
        {model && (
          <primitive
            object={model} // eslint-disable-line react/no-unknown-property
          />
        )}
      </group>
    </Suspense>
  );
};

export const StreamModelLoader = memo(StreamModelLoaderComponent, (prev, next) => prev.model === next.model && prev.ref === next.ref);
