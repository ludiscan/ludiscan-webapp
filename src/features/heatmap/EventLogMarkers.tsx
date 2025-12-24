import { Billboard, Center } from '@react-three/drei';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Vector3, ShapeGeometry, DoubleSide, BackSide, Sprite, SpriteMaterial, TextureLoader } from 'three';
import { SVGLoader } from 'three-stdlib';

import type { ThreeEvent } from '@react-three/fiber';
import type { EventLogData } from '@src/modeles/heatmapView';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';
import type { Shape, Box3, Group, Texture } from 'three';

import { useEventLogPick } from '@src/hooks/useEventLog';
import { useGeneralPick } from '@src/hooks/useGeneral';
import { usePlayerTimelinePick } from '@src/hooks/usePlayerTimeline';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { heatMapEventBus } from '@src/utils/canvasEventBus';
import { getIconPath } from '@src/utils/heatmapIconMap';

export type EventLogMarkersProps = {
  service: HeatmapDataService;
  logName: string;
  pref: EventLogData; // { color: string; iconName: string; }
};

// Scaling reference
const REF_DISTANCE = 3000;
const REF_SCALE = 0.1;
const scaleFactor = REF_SCALE / REF_DISTANCE;

// Individual marker component
const MarkerBillboard: FC<{
  pos: Vector3;
  id: number;
  color: string;
  selected?: boolean;
  geometries: ShapeGeometry[];
  onClick: (e: ThreeEvent<MouseEvent>, id: number) => void;
}> = ({ pos, id, color, geometries, onClick, selected }) => {
  const ref = useRef<Group>(null);
  const { camera, gl } = useThree();

  // Throttle update: recalc scale every frame
  useFrame(() => {
    if (ref.current) {
      const dist = camera.position.distanceTo(pos);
      const s = dist * scaleFactor;
      ref.current.scale.set(s, s, s);
    }
  });

  return (
    <Billboard
      ref={ref}
      position={[pos.x, pos.y + 20, pos.z]}
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
        {geometries.map((geo, idx) => (
          <group key={idx}>
            {selected && (
              <mesh geometry={geo} /* eslint-disable-line react/no-unknown-property */ scale={[1.1, 1.1, 1.1]}>
                <meshBasicMaterial
                  side={BackSide} /* eslint-disable-line react/no-unknown-property */
                  toneMapped={false} /* eslint-disable-line react/no-unknown-property */
                  transparent /* eslint-disable-line react/no-unknown-property */
                  opacity={1}
                />
              </mesh>
            )}
            <mesh
              geometry={geo} /* eslint-disable-line react/no-unknown-property */
              castShadow={false} /* eslint-disable-line react/no-unknown-property */
              receiveShadow={false} /* eslint-disable-line react/no-unknown-property */
            >
              <meshBasicMaterial
                color={color}
                side={DoubleSide} /* eslint-disable-line react/no-unknown-property */
                toneMapped={false} /* eslint-disable-line react/no-unknown-property */
              />
            </mesh>
          </group>
        ))}
      </Center>
    </Billboard>
  );
};

// Time window for event visibility (±2 seconds)
const EVENT_TIME_WINDOW_MS = 2000;

const EventLogMarkers: FC<EventLogMarkersProps> = ({ logName, service, pref }) => {
  const { color, iconName } = pref;
  const { upZ = false, scale } = useGeneralPick('upZ', 'scale');

  const { filters } = useEventLogPick('filters');
  const { camera, size } = useThree();

  // Timeline state for time-based filtering
  const { visible: isTimelineActive, currentTimelineSeek } = usePlayerTimelinePick('visible', 'currentTimelineSeek');

  // Compile HVQL script if provided
  // const hvqlCompiler = useMemo(() => {
  //   if (!hvqlScript) return null;
  //   try {
  //     return compileHVQL(hvqlScript);
  //   } catch {
  //     return null;
  //   }
  // }, [hvqlScript]);

  // テクスチャキャッシュ
  const textureCache = useRef<Map<string, Texture>>(new Map());
  const spriteRef = useRef<Sprite | null>(null);
  const materialRef = useRef<SpriteMaterial | null>(null);

  // Load and prepare SVG shapes
  const svgData = useLoader(SVGLoader, '/heatmap/target.svg');
  const shapes = useMemo<Shape[]>(() => {
    const arr: Shape[] = [];
    svgData.paths.forEach((path) => path.toShapes(true).forEach((shape) => arr.push(shape)));
    return arr;
  }, [svgData]);

  const [selectedData, setSelectedData] = useState<number | undefined>(undefined);
  const [currentIconPath, setCurrentIconPath] = useState<string | null>(null);

  const geometries = useMemo<ShapeGeometry[]>(
    () =>
      shapes.map((shape) => {
        const geo = new ShapeGeometry(shape);
        geo.computeBoundingBox();
        if (geo.boundingBox) {
          const bb = geo.boundingBox as Box3;
          const cx = (bb.min.x + bb.max.x) / 2;
          const cy = (bb.min.y + bb.max.y) / 2;
          geo.translate(-cx, -cy, 0);
        }
        return geo;
      }),
    [shapes],
  );

  // Fetch event logs
  const { data } = useQuery({
    queryKey: ['eventLogMarkers', logName],
    queryFn: () => service.getEventLog(logName),
    staleTime: DefaultStaleTime,
    refetchOnWindowFocus: false,
  });

  // Precompute world positions with metadata
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worldPositions = useMemo<{ pos: Vector3; id: number; offset_timestamp: number; metadata?: Record<string, any> }[]>(() => {
    let filtered = (data ?? [])
      .map((d) => {
        const playerFilter = filters['player'] || -1;
        if (playerFilter !== -1 && d.player !== playerFilter) return null; // Filter by player if specified
        const { x, y, z } = d.event_data;
        return {
          pos: upZ ? new Vector3(x * scale, z * scale, y * scale) : new Vector3(x * scale, y * scale, z * scale),
          id: d.id,
          offset_timestamp: d.offset_timestamp,
          // metadata: d.metadata || {},
        };
      })
      .filter((d) => d != null);

    // Apply timeline-based filtering when timeline is active
    if (isTimelineActive && currentTimelineSeek !== undefined) {
      filtered = filtered.filter((d) => {
        const timeDiff = Math.abs(d.offset_timestamp - currentTimelineSeek);
        return timeDiff <= EVENT_TIME_WINDOW_MS;
      });
    }

    return filtered;
  }, [data, upZ, scale, filters, isTimelineActive, currentTimelineSeek]);

  // Overlap filtering with useMemo
  const visibleWorldPositions = useMemo(() => {
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

  // Click handler
  const handlePointClick = useCallback(
    async (e: ThreeEvent<MouseEvent>, id: number) => {
      e.stopPropagation();
      heatMapEventBus.emit('click-event-log', { logName, id });
    },
    [logName],
  );

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

  useEffect(() => {
    const handleEventLogDetailLoaded = (event: CustomEvent<{ logName: string; id: number }>) => {
      if (event.detail.logName === logName) {
        setSelectedData(event.detail.id);
      }
    };
    heatMapEventBus.on('event-log-detail-loaded', handleEventLogDetailLoaded);
    return () => {
      heatMapEventBus.off('event-log-detail-loaded', handleEventLogDetailLoaded);
    };
  }, [logName]);

  // Helper function to get icon name based on HVQL or fallback
  // const getIconNameForMarker = useCallback(
  //   (metadata: Record<string, any> | undefined): string | undefined => {
  //     if (!metadata) return iconName;
  //
  //     if (hvqlCompiler) {
  //       try {
  //         const ctx: ViewContext = {
  //           player: 0,
  //           status: metadata,
  //           pos: { x: 0, y: 0, z: 0 },
  //           t: 0,
  //         };
  //         const style = hvqlCompiler(ctx);
  //         return style.icon || iconName;
  //       } catch (e) {
  //         console.error('Error applying HVQL:', e);
  //         return iconName;
  //       }
  //     }
  //
  //     return iconName;
  //   },
  //   [hvqlCompiler, iconName],
  // );

  return (
    <>
      {visibleWorldPositions.map((d) => (
        <MarkerBillboard
          key={d.id}
          selected={d.id === selectedData}
          pos={d.pos}
          id={d.id}
          color={color}
          geometries={geometries}
          onClick={handlePointClick}
          // iconName={getIconNameForMarker(d.metadata)}
          // metadata={d.metadata}
        />
      ))}
      {/* アイコン表示 */}
      {iconName &&
        visibleWorldPositions.length > 0 &&
        spriteRef.current &&
        currentIconPath &&
        (() => {
          // テクスチャの更新（必要時のみ）
          updateIconTexture(currentIconPath);

          // スプライトの位置とスケールを更新
          const randomPos = visibleWorldPositions[0];
          spriteRef.current.position.copy(randomPos.pos);
          spriteRef.current.position.y += 50 * scale; // マーカーの上に表示
          spriteRef.current.scale.set(0.07 * scale, 0.07 * scale, 1);

          // eslint-disable-next-line react/no-unknown-property
          return <primitive object={spriteRef.current} />;
        })()}
    </>
  );
};

export { EventLogMarkers };
