import { useMemo } from 'react';
import { Vector3 } from 'three';

export type PointMarkersProps = {
  points: { x: number; y: number; z: number; density: number }[];
  scale?: number;
};

class Point extends Vector3 {
  density: number;

  constructor(x: number, y: number, z: number, density: number) {
    super(x, y, z);
    this.density = density;
  }
}

const PointMarkers: React.FC<PointMarkersProps> = ({ points, scale = 0.2 }) => {
  const memoizedPoints = useMemo(() => points.map(({ x, y, z, density }) => new Point(x * scale, y * scale, z * scale, density)), [points, scale]);

  return (
    <>
      {memoizedPoints.map((pos, index) => (
        <mesh key={index} position={new Vector3(pos.x, pos.y, pos.z)} /* eslint-disable-line react/no-unknown-property */>
          <sphereGeometry args={[1, 16, 16]} /> {/* eslint-disable-line react/no-unknown-property */}
          <meshStandardMaterial color={pos.density > 1 ? 'green' : 'red'} />
        </mesh>
      ))}
    </>
  );
};

export default PointMarkers;
