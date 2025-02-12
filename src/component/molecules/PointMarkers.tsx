import { useMemo } from 'react';
import { Color, Vector3 } from 'three';

import type { FC } from 'react';

export type PointMarkersProps = {
  points: { x: number; y: number; z: number; density: number }[];
  scale?: number;
};

class Point extends Vector3 {
  color: Color;

  constructor(x: number, y: number, z: number, color: Color) {
    super(x, y, z);
    this.color = color;
  }
}

const PointMarkers: FC<PointMarkersProps> = ({ points, scale = 0.2 }) => {
  const memoizedPoints = useMemo(() => {
    return points.map(({ x, y, z, density }) => {
      return new Point(x * scale, y * scale, z * scale, new Color().setHSL((1 - density) * 0.33, 1, 0.5));
    });
  }, [points, scale]);

  return memoizedPoints.map((pos, index) => (
    <mesh key={index} position={new Vector3(pos.x, pos.y, pos.z)} /* eslint-disable-line react/no-unknown-property */>
      <boxGeometry args={[8, 8, 8]} /> {/* eslint-disable-line react/no-unknown-property */}
      <meshStandardMaterial color={pos.color} />
    </mesh>
  ));
};

export default PointMarkers;
