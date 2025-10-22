import { Billboard, Center } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Vector3, SphereGeometry, BoxGeometry, Sprite, SpriteMaterial, TextureLoader } from 'three';

import type { components } from '@generated/api';
import type { ThreeEvent } from '@react-three/fiber';
import type { FieldObjectData } from '@src/modeles/heatmapView';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';
import type { Group, Texture } from 'three';

import { useGeneralPick } from '@src/hooks/useGeneral';
import { getIconPath } from '@src/utils/heatmapIconMap';
import { compileHVQL, type ViewContext } from '@src/utils/vql';

export type FieldObjectMarkersProps = {
  _service: HeatmapDataService;
  logs: components['schemas']['FieldObjectLogDto'][];
  objectType: string;
  pref: FieldObjectData;
  queryText?: string; // HVQL query from Redux FieldObjectSettings
};

// Individual marker component
const FieldObjectMarker: FC<{
  pos: Vector3;
  id: string;
  color: string;
  eventType: 'spawn' | 'move' | 'despawn' | 'update';
  onClick: (e: ThreeEvent<MouseEvent>, id: string) => void;
  scale: number;
}> = ({ pos, id, color, eventType, onClick, scale }) => {
  const ref = useRef<Group>(null);
  const { gl } = useThree();

  const getGeometry = useMemo(() => {
    // スケール値に基づいてジオメトリサイズを決定
    const scaledSize = Math.max(scale * 5, 5); // 最小値5ユニット
    const boxSize = scaledSize * 0.8;
    const sphereRadius = scaledSize;

    switch (eventType) {
      case 'spawn':
        return new SphereGeometry(sphereRadius, 8, 8); // Sphere for spawn
      case 'despawn':
        return new BoxGeometry(boxSize, boxSize, boxSize); // Box for despawn
      case 'move':
        return new BoxGeometry(boxSize * 0.7, boxSize * 0.7, boxSize * 0.7); // Smaller box for move
      default:
        return new SphereGeometry(sphereRadius, 8, 8); // Default sphere
    }
  }, [eventType, scale]);

  return (
    <Billboard
      ref={ref}
      position={[pos.x, pos.y + 20, pos.z]}
      scale={10}
      follow
      lockX={false}
      lockY={false}
      lockZ={false}
      onClick={(e) => onClick(e, id)}
      onPointerOver={() => {
        gl.domElement.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        gl.domElement.style.cursor = 'auto';
      }}
    >
      <Center>
        <mesh geometry={getGeometry} /* eslint-disable-line react/no-unknown-property */>
          <meshBasicMaterial color={color} />
        </mesh>
      </Center>
    </Billboard>
  );
};

const FieldObjectMarkers: FC<FieldObjectMarkersProps> = ({ _service, logs, objectType, pref, queryText }) => {
  const { color, iconName, hvqlScript } = pref;
  const { upZ = false, scale } = useGeneralPick('upZ', 'scale');
  const { camera, size } = useThree();

  // Use queryText from Redux if provided, otherwise fallback to hvqlScript from pref
  const scriptToCompile = queryText || hvqlScript;

  // Compile HVQL script if provided
  const hvqlCompiler = useMemo(() => {
    if (!scriptToCompile) return null;
    try {
      return compileHVQL(scriptToCompile);
    } catch {
      return null;
    }
  }, [scriptToCompile]);

  // テクスチャキャッシュ
  const textureCache = useRef<Map<string, Texture>>(new Map());
  const spriteRef = useRef<Sprite | null>(null);
  const materialRef = useRef<SpriteMaterial | null>(null);
  const [currentIconPath, setCurrentIconPath] = useState<string | null>(null);

  // Precompute world positions for this object type
  // Apply same coordinate transformation as PlayerPositionLog (HeatmapObjectOverlay.tsx)
  // Database stores: x=Z_unity*100, y=X_unity*100, z=Y_unity*100
  // Display: Keep X, swap Y/Z based on upZ flag
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worldPositions = useMemo<{ pos: Vector3; id: string; eventType: 'spawn' | 'move' | 'despawn' | 'update'; metadata?: Record<string, any> }[]>(
    () =>
      logs
        .filter((log) => log.object_type === objectType)
        .map((log) => {
          const { x, y, z } = log;
          const zVal = z ?? 0;
          // Apply Y/Z swap transform (same as HeatmapObjectOverlay.tsx)
          return {
            pos: new Vector3(x * scale, (upZ ? zVal : y) * scale, (upZ ? y : zVal) * scale),
            id: log.object_id,
            eventType: log.event_type,
            metadata: log.status || {},
          };
        }),
    [logs, objectType, upZ, scale],
  );

  // Overlap filtering with useMemo
  const visiblePositions = useMemo(() => {
    if (!worldPositions || worldPositions.length === 0) return [];

    const visible: typeof worldPositions = [];
    const screenCache: { px: number; py: number }[] = [];
    const thresholdPx = 20;

    for (let i = 0; i < worldPositions.length; i++) {
      const wp = worldPositions[i];
      const ndc = wp.pos.clone().project(camera);
      const px = ((ndc.x + 1) / 2) * size.width;
      const py = ((1 - ndc.y) / 2) * size.height;

      let skip = false;
      for (const cached of screenCache) {
        if ((px - cached.px) ** 2 + (py - cached.py) ** 2 < thresholdPx * thresholdPx) {
          skip = true;
          break;
        }
      }

      if (!skip) {
        visible.push(wp);
        screenCache.push({ px, py });
      }
    }

    return visible;
  }, [worldPositions, camera, size]);

  // Helper function to get icon name based on HVQL or fallback
  const getIconNameForObject = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (metadata: Record<string, any> | undefined): string | undefined => {
      if (!metadata) return iconName;

      if (hvqlCompiler) {
        try {
          const ctx: ViewContext = {
            player: 0,
            status: metadata,
            pos: { x: 0, y: 0, z: 0 },
            t: 0,
          };
          const style = hvqlCompiler(ctx);
          return style.icon || iconName;
        } catch {
          return iconName;
        }
      }

      return iconName;
    },
    [hvqlCompiler, iconName],
  );

  // Click handler
  const handlePointClick = useCallback((e: ThreeEvent<MouseEvent>, _id: string) => {
    e.stopPropagation();
    // Possible future extensions: show FieldObject panel, display details, etc.
  }, []);

  // テクスチャのキャッシュ機能
  const getCachedTexture = useCallback((iconPath: string): Texture => {
    if (textureCache.current.has(iconPath)) {
      return textureCache.current.get(iconPath)!;
    }

    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(iconPath);
    textureCache.current.set(iconPath, texture);
    return texture;
  }, []);

  // アイコンの更新を最適化
  const updateIconTexture = useCallback(
    (iconPath: string) => {
      if (materialRef.current && materialRef.current.map !== textureCache.current.get(iconPath)) {
        materialRef.current.map = getCachedTexture(iconPath);
      }
    },
    [getCachedTexture],
  );

  // スプライトの初期化
  useEffect(() => {
    if (!spriteRef.current) {
      const material = new SpriteMaterial({
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: false,
        depthTest: false,
      });
      materialRef.current = material;

      spriteRef.current = new Sprite(material);
    }
  }, []);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (materialRef.current) {
        materialRef.current.dispose();
      }
      textureCache.current.forEach((texture) => texture.dispose());
      textureCache.current = new Map<string, Texture>();
    };
  }, []);

  // アイコンパスの更新
  useEffect(() => {
    if (iconName) {
      const newIconPath = getIconPath(iconName);
      if (newIconPath !== currentIconPath) {
        setCurrentIconPath(newIconPath);
      }
    } else {
      setCurrentIconPath(null);
    }
  }, [iconName, currentIconPath]);

  return (
    <>
      {visiblePositions.map((wp, index) => {
        const dynamicIconName = wp.metadata ? getIconNameForObject(wp.metadata) : iconName;
        const iconPathForMarker = dynamicIconName ? getIconPath(dynamicIconName) : null;

        return (
          <group key={`${wp.id}-${index}`}>
            <FieldObjectMarker pos={wp.pos} id={wp.id} color={color} eventType={wp.eventType} onClick={handlePointClick} scale={scale} />
            {/* Dynamic icon display for each marker when query is active */}
            {scriptToCompile &&
              dynamicIconName &&
              iconPathForMarker &&
              (() => {
                const sprite = new Sprite(materialRef.current ?? undefined);
                const texture = getCachedTexture(iconPathForMarker);
                if (materialRef.current) {
                  materialRef.current.map = texture;
                }
                sprite.position.copy(wp.pos);
                sprite.position.y += 100 * scale;
                sprite.scale.set(0.07 * scale, 0.07 * scale, 1);
                // eslint-disable-next-line react/no-unknown-property
                return <primitive object={sprite} />;
              })()}
          </group>
        );
      })}
      {/* Default icon display (when query is not active) */}
      {!scriptToCompile &&
        iconName &&
        visiblePositions.length > 0 &&
        spriteRef.current &&
        currentIconPath &&
        (() => {
          // テクスチャの更新（必要時のみ）
          updateIconTexture(currentIconPath);

          // スプライトの位置とスケールを更新
          const randomPos = visiblePositions[0];
          spriteRef.current.position.copy(randomPos.pos);
          spriteRef.current.position.y += 100 * scale; // マーカーの上に表示
          spriteRef.current.scale.set(0.07 * scale, 0.07 * scale, 1);

          // eslint-disable-next-line react/no-unknown-property
          return <primitive object={spriteRef.current} />;
        })()}
    </>
  );
};

export default FieldObjectMarkers;
