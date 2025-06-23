import { Billboard, Center } from '@react-three/drei';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Vector3, ShapeGeometry, DoubleSide, BackSide } from 'three';
import { SVGLoader } from 'three-stdlib';

import type { ThreeEvent } from '@react-three/fiber';
import type { EventLogData } from '@src/modeles/heatmapView';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';
import type { Shape, Box3, Group } from 'three';

import { useGeneralState } from '@src/hooks/useHeatmapState';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

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

const EventLogMarkers: FC<EventLogMarkersProps> = ({ logName, service, pref }) => {
  const { color } = pref;
  const {
    data: { upZ = false, scale },
  } = useGeneralState();
  const { camera, size } = useThree();

  // Load and prepare SVG shapes
  const svgData = useLoader(SVGLoader, '/heatmap/target.svg');
  const shapes = useMemo<Shape[]>(() => {
    const arr: Shape[] = [];
    svgData.paths.forEach((path) => path.toShapes(true).forEach((shape) => arr.push(shape)));
    return arr;
  }, [svgData]);

  const [selectedData, setSelectedData] = useState<number | undefined>(undefined);

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

  // Precompute world positions
  const worldPositions = useMemo<Vector3[]>(
    () =>
      (data ?? []).map((d) => {
        const { x, y, z } = d.event_data;
        return upZ ? new Vector3(x * scale, z * scale, y * scale) : new Vector3(x * scale, y * scale, z * scale);
      }),
    [data, upZ, scale],
  );

  // Overlap filtering state
  const [visibleIds, setVisibleIds] = useState<Set<number>>(new Set());
  const thresholdPx = 20;
  const screenCache = useRef<{ px: number; py: number }[]>([]);
  const keptIndices: number[] = useRef<number[]>([]).current;

  useFrame(() => {
    if (!data) return;
    const newSet = new Set<number>();
    screenCache.current = [];
    keptIndices.length = 0;

    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const wp = worldPositions[i];
      const ndc = wp.clone().project(camera);
      const px = ((ndc.x + 1) / 2) * size.width;
      const py = ((1 - ndc.y) / 2) * size.height;

      let skip = false;
      for (const idx of keptIndices) {
        const { px: kx, py: ky } = screenCache.current[idx];
        if ((px - kx) ** 2 + (py - ky) ** 2 < thresholdPx * thresholdPx) {
          skip = true;
          break;
        }
      }
      if (!skip) {
        newSet.add(d.id);
        keptIndices.push(i);
        screenCache.current[i] = { px, py };
      }
    }

    // Update if changed
    if (newSet.size !== visibleIds.size || [...newSet].some((id) => !visibleIds.has(id))) {
      setVisibleIds(newSet);
    }
  });

  // Click handler
  const handlePointClick = useCallback(
    async (e: ThreeEvent<MouseEvent>, id: number) => {
      e.stopPropagation();
      heatMapEventBus.emit('click-event-log', { logName, id });
    },
    [logName],
  );

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

  return (
    <>
      {data?.map((d, i) =>
        visibleIds.has(d.id) ? (
          <MarkerBillboard
            key={d.id}
            selected={d.id == selectedData}
            pos={worldPositions[i]}
            id={d.id}
            color={color}
            geometries={geometries}
            onClick={handlePointClick}
          />
        ) : null,
      )}
    </>
  );
};

export { EventLogMarkers };
