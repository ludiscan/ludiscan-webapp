import { Billboard, Center } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Vector3, ShapeGeometry, DoubleSide } from 'three';
import { SVGLoader } from 'three-stdlib';

import type { EventLogData } from '@src/modeles/heatmapView';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';
import type { Shape, Box3 } from 'three';

import { useGeneralState } from '@src/hooks/useHeatmapState';

export type EventLogMarkersProps = {
  service: HeatmapDataService;
  logName: string;
  pref: EventLogData; // { color: string; iconName: string; }
};

const EventLogMarkers: FC<EventLogMarkersProps> = ({ logName, service, pref }) => {
  const { color } = pref;
  const {
    data: { upZ = false },
  } = useGeneralState();

  // 1) SVG→Path→Shape 取り込み
  const svgData = useLoader(SVGLoader, '/heatmap/target.svg');
  const shapes = useMemo<Shape[]>(() => {
    const tmp: Shape[] = [];
    svgData.paths.forEach((path) => path.toShapes(true).forEach((shape) => tmp.push(shape)));
    return tmp;
  }, [svgData]);

  // 2) ShapeGeometry の中心を原点に揃えた geometry リストを作成
  const geometries = useMemo(() => {
    return shapes.map((shape) => {
      const geo = new ShapeGeometry(shape);
      geo.computeBoundingBox();
      if (geo.boundingBox) {
        const bb = geo.boundingBox as Box3;
        const centerX = (bb.min.x + bb.max.x) / 2;
        const centerY = (bb.min.y + bb.max.y) / 2;
        // 中心を原点に
        geo.translate(-centerX, -centerY, 0);
      }
      return geo;
    });
  }, [shapes]);

  // 3) イベントログ取得
  const { data } = useQuery({
    queryKey: ['eventLogMarkers', logName],
    queryFn: () => service.getEventLog(logName),
  });

  return (
    <>
      {data?.map((d) => {
        const {
          event_data: { x, y, z },
          offset_timestamp,
        } = d;
        const pos = upZ ? new Vector3(x, z, y) : new Vector3(x, y, z);

        return (
          <Billboard
            key={offset_timestamp}
            position={[pos.x, pos.y + 100, pos.z]}
            follow
            // 必要なら軸ロック
            lockX={false}
            lockY={false}
            lockZ={false}
            // 大きさ調整
            scale={0.1}
          >
            {/* <Center> を使うと、ラップ内の全ジオメトリをまとめて中央揃えできます */}
            <Center>
              {geometries.map((geo, i) => (
                <mesh
                  key={i}
                  geometry={geo} /* eslint-disable-line react/no-unknown-property */
                  castShadow={false} /* eslint-disable-line react/no-unknown-property */
                  receiveShadow={false} /* eslint-disable-line react/no-unknown-property */
                >
                  <meshStandardMaterial color={color} side={DoubleSide} /* eslint-disable-line react/no-unknown-property */ />
                </mesh>
              ))}
            </Center>
          </Billboard>
        );
      })}
    </>
  );
};

export { EventLogMarkers };
