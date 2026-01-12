import { Billboard, Center } from '@react-three/drei';
import { useThree, useLoader } from '@react-three/fiber';
import { memo, useCallback, useMemo } from 'react';
import { Vector3, SphereGeometry, BoxGeometry, TextureLoader, SRGBColorSpace } from 'three';

import type { components } from '@generated/api';
import type { FieldObjectData } from '@src/modeles/heatmapView';
import type { FC } from 'react';

import { useGeneralPick } from '@src/hooks/useGeneral';
import { usePlayerTimelinePick } from '@src/hooks/usePlayerTimeline';
import { zIndexes } from '@src/styles/style';
import { getIconPath } from '@src/utils/heatmapIconMap';
import { compileHVQL, type ViewContext } from '@src/utils/vql';

export type FieldObjectMarkersProps = {
  logs: components['schemas']['FieldObjectLogDto'][];
  objectType: string;
  pref: FieldObjectData;
  queryText?: string;
};

type EventType = 'spawn' | 'move' | 'despawn' | 'update';

// ジオメトリをキャッシュ
const geometryCache = {
  spawn: new SphereGeometry(1, 8, 8),
  despawn: new BoxGeometry(0.8, 0.8, 0.8),
  move: new BoxGeometry(0.56, 0.56, 0.56),
  update: new SphereGeometry(1, 8, 8),
};

// アイコンマーカーコンポーネント
const IconMarker: FC<{
  position: [number, number, number];
  iconPath: string;
  scale: number;
}> = memo(({ position, iconPath, scale }) => {
  const { gl } = useThree();
  const texture = useLoader(TextureLoader, iconPath);
  const markerScale = Math.max(scale * 70, 70);

  // テクスチャの色空間を設定
  useMemo(() => {
    texture.colorSpace = SRGBColorSpace;
  }, [texture]);

  return (
    <Billboard position={position} follow renderOrder={zIndexes.renderOrder.fieldObjectMarkers}>
      <Center>
        {}
        <sprite
          scale={[markerScale, markerScale, 1]}
          onPointerOver={() => (gl.domElement.style.cursor = 'pointer')}
          onPointerOut={() => (gl.domElement.style.cursor = 'auto')}
          renderOrder={zIndexes.renderOrder.fieldObjectMarkers} /* eslint-disable-line react/no-unknown-property */
        >
          {/* eslint-disable-next-line react/no-unknown-property */}
          <spriteMaterial map={texture} transparent depthTest={false} />
        </sprite>
      </Center>
    </Billboard>
  );
});

IconMarker.displayName = 'IconMarker';

// 個別マーカーコンポーネント（アイコンなしのフォールバック）
const FieldObjectMarker: FC<{
  position: [number, number, number];
  color: string;
  eventType: EventType;
  scale: number;
}> = memo(({ position, color, eventType, scale }) => {
  const { gl } = useThree();
  const geometry = geometryCache[eventType];
  const markerScale = Math.max(scale * 30, 30);

  return (
    <Billboard position={position} follow renderOrder={zIndexes.renderOrder.fieldObjectMarkers}>
      <Center>
        <mesh
          geometry={geometry} /* eslint-disable-line react/no-unknown-property */
          scale={markerScale}
          onPointerOver={() => (gl.domElement.style.cursor = 'pointer')}
          onPointerOut={() => (gl.domElement.style.cursor = 'auto')}
          renderOrder={zIndexes.renderOrder.fieldObjectMarkers} /* eslint-disable-line react/no-unknown-property */
        >
          {/* eslint-disable-next-line react/no-unknown-property */}
          <meshBasicMaterial color={color} depthTest={false} />
        </mesh>
      </Center>
    </Billboard>
  );
});

FieldObjectMarker.displayName = 'FieldObjectMarker';

// メインコンポーネント
const FieldObjectMarkersComponent: FC<FieldObjectMarkersProps> = ({ logs, objectType, pref, queryText }) => {
  const { color } = pref;
  const { upZ = false, scale } = useGeneralPick('upZ', 'scale');
  const { visible: isTimelineActive, currentTimelineSeek } = usePlayerTimelinePick('visible', 'currentTimelineSeek');
  const { camera, size } = useThree();

  // HVQL コンパイラ
  const hvqlCompiler = useMemo(() => {
    const script = queryText || pref.hvqlScript;
    if (!script) return null;
    try {
      return compileHVQL(script);
    } catch {
      return null;
    }
  }, [queryText, pref.hvqlScript]);

  // オブジェクトごとの spawn/despawn タイミング
  const objectTimings = useMemo(() => {
    const timings = new Map<string, { spawnTime: number; despawnTime: number }>();
    for (const log of logs) {
      if (log.object_type !== objectType) continue;

      let timing = timings.get(log.object_id);
      if (!timing) {
        timing = { spawnTime: Infinity, despawnTime: 0 };
        timings.set(log.object_id, timing);
      }

      if (log.event_type === 'spawn') {
        timing.spawnTime = Math.min(timing.spawnTime, log.offset_timestamp);
      } else if (log.event_type === 'despawn') {
        timing.despawnTime = Math.max(timing.despawnTime, log.offset_timestamp);
      }
    }
    return timings;
  }, [logs, objectType]);

  // 表示するマーカーデータ
  const markers = useMemo(() => {
    // 対象のオブジェクトタイプのみフィルタ
    let filtered = logs.filter((log) => log.object_type === objectType);

    // タイムライン表示時は時間でフィルタ
    if (isTimelineActive && currentTimelineSeek !== undefined) {
      filtered = filtered.filter((log) => {
        const timing = objectTimings.get(log.object_id);
        if (!timing) return false;
        const spawnTime = timing.spawnTime === Infinity ? 0 : timing.spawnTime;
        const despawnTime = timing.despawnTime === 0 ? Infinity : timing.despawnTime;
        return currentTimelineSeek >= spawnTime && currentTimelineSeek <= despawnTime;
      });
    }

    // 座標変換
    return filtered.map((log) => {
      const zVal = log.z ?? 0;
      return {
        id: log.object_id,
        eventType: log.event_type as EventType,
        position: new Vector3(log.x * scale, (upZ ? zVal : log.y) * scale, (upZ ? log.y : zVal) * scale),
        metadata: log.status,
      };
    });
  }, [logs, objectType, objectTimings, upZ, scale, isTimelineActive, currentTimelineSeek]);

  // 重なり除去
  const visibleMarkers = useMemo(() => {
    if (markers.length === 0) return [];

    const visible: typeof markers = [];
    const screenPositions: { x: number; y: number }[] = [];
    const thresholdSq = 20 * 20; // 20px threshold squared

    for (const marker of markers) {
      const ndc = marker.position.clone().project(camera);
      const screenX = ((ndc.x + 1) / 2) * size.width;
      const screenY = ((1 - ndc.y) / 2) * size.height;

      // 既存マーカーとの重なりチェック
      const overlaps = screenPositions.some((sp) => (screenX - sp.x) ** 2 + (screenY - sp.y) ** 2 < thresholdSq);

      if (!overlaps) {
        visible.push(marker);
        screenPositions.push({ x: screenX, y: screenY });
      }
    }

    return visible;
  }, [markers, camera, size]);

  // HVQL によるスタイルの取得（色とアイコン）
  const getStyle = useCallback(
    (metadata: Record<string, never> | null | undefined): { color: string; icon?: string } => {
      if (!hvqlCompiler) return { color };

      try {
        const ctx: ViewContext = {
          player: 0,
          status: (metadata ?? {}) as Record<string, string | number | boolean>,
          pos: { x: 0, y: 0, z: 0 },
          t: 0,
          objectType,
        };
        const style = hvqlCompiler(ctx);
        return {
          color: style.color || color,
          icon: style.icon,
        };
      } catch {
        return { color };
      }
    },
    [hvqlCompiler, color, objectType],
  );

  // マーカーにスタイル情報を付与
  const styledMarkers = useMemo(() => {
    return visibleMarkers.map((marker) => ({
      ...marker,
      style: getStyle(marker.metadata),
    }));
  }, [visibleMarkers, getStyle]);

  // アイコンパスを収集（useLoaderのプリロード用）
  const iconPaths = useMemo(() => {
    const paths = new Set<string>();
    for (const marker of styledMarkers) {
      if (marker.style.icon) {
        paths.add(getIconPath(marker.style.icon));
      }
    }
    return Array.from(paths);
  }, [styledMarkers]);

  // アイコンがない場合はフォールバックマーカーを表示
  if (iconPaths.length === 0) {
    return (
      <>
        {styledMarkers.map((marker, i) => (
          <FieldObjectMarker
            key={`${marker.id}-${i}`}
            position={[marker.position.x, marker.position.y + 20, marker.position.z]}
            color={marker.style.color}
            eventType={marker.eventType}
            scale={scale}
          />
        ))}
      </>
    );
  }

  // アイコンマーカーを表示
  return (
    <>
      {styledMarkers.map((marker, i) =>
        marker.style.icon ? (
          <IconMarker
            key={`${marker.id}-${i}`}
            position={[marker.position.x, marker.position.y + 20, marker.position.z]}
            iconPath={getIconPath(marker.style.icon)}
            scale={scale}
          />
        ) : (
          <FieldObjectMarker
            key={`${marker.id}-${i}`}
            position={[marker.position.x, marker.position.y + 20, marker.position.z]}
            color={marker.style.color}
            eventType={marker.eventType}
            scale={scale}
          />
        ),
      )}
    </>
  );
};

const FieldObjectMarkers = memo(FieldObjectMarkersComponent, (prev, next) => {
  return prev.logs === next.logs && prev.objectType === next.objectType && prev.pref === next.pref && prev.queryText === next.queryText;
});

FieldObjectMarkers.displayName = 'FieldObjectMarkers';

export default FieldObjectMarkers;
