import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

import type { FC } from 'react';

import { useGeneralPick } from '@src/hooks/useGeneral';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

type Ping = {
  id: number;
  pos: THREE.Vector3;
  t0: number; // ms
  ttl: number; // ms
};

export const FocusPingLayer: FC<{
  ttlMs?: number;
  baseRadius?: number;
}> = ({
  ttlMs = 1800,
  baseRadius = 60, // ワールド単位
}) => {
  const { scale } = useGeneralPick('scale');
  const [pings, setPings] = useState<Ping[]>([]);
  const idRef = useRef(1);

  // 受け口: FocusController 等から飛んでくる
  useEffect(() => {
    const onPing = (event: CustomEvent<{ position: { x: number; y: number; z: number } }>) => {
      setPings((prev) => [
        ...prev,
        {
          id: idRef.current++,
          pos: new THREE.Vector3(event.detail.position.x, event.detail.position.y + 30, event.detail.position.z),
          t0: performance.now(),
          ttl: ttlMs,
        },
      ]);
    };
    heatMapEventBus.on('focus:ping', onPing);
    return () => {
      heatMapEventBus.off('focus:ping', onPing);
    };
  }, [ttlMs]);

  // 経過で掃除
  useFrame(() => {
    const now = performance.now();
    setPings((prev) => prev.filter((p) => now - p.t0 < p.ttl));
  });

  const ringGeo = useMemo(() => {
    // RingGeometry は XY平面。Y-up の床は XZ なので回転で合わせる
    return new THREE.RingGeometry(1, 1.2, 64);
  }, []);

  return (
    <group renderOrder={9999} /* eslint-disable-line react/no-unknown-property */>
      {pings.map((p) => {
        const t = (performance.now() - p.t0) / p.ttl; // 0..1
        const ease = 1 - Math.pow(1 - Math.min(1, t), 2); // easeOutQuad
        const radius = baseRadius * scale * (0.6 + 1.8 * ease); // 拡大
        const opacity = (1 - ease) * 0.85;

        return (
          <group key={p.id} position={p.pos.toArray()} /* eslint-disable-line react/no-unknown-property */>
            {/* リング（床面） */}
            <mesh
              geometry={ringGeo} /* eslint-disable-line react/no-unknown-property */
              rotation={new THREE.Euler(-Math.PI / 2, 0, 0)} /* eslint-disable-line react/no-unknown-property */
              scale={[radius, radius, 1]}
            >
              <meshBasicMaterial
                color={0x2aa1ff}
                transparent /* eslint-disable-line react/no-unknown-property */
                opacity={opacity}
                depthWrite={false} /* eslint-disable-line react/no-unknown-property */
                depthTest={false} /* eslint-disable-line react/no-unknown-property */
              />
            </mesh>

            {/* 小さな点（中心） */}
            <mesh
              position={[0, 1, 0]} /* eslint-disable-line react/no-unknown-property */
              scale={[1, 1, 1].map(() => 0.6 + 0.8 * (1 - ease)) as [number, number, number]}
            >
              <sphereGeometry args={[22 * scale, 12, 12]} /* eslint-disable-line react/no-unknown-property */ />
              <meshBasicMaterial
                color={0xffffff}
                transparent /* eslint-disable-line react/no-unknown-property */
                opacity={opacity}
                depthWrite={false} /* eslint-disable-line react/no-unknown-property */
                depthTest={false} /* eslint-disable-line react/no-unknown-property */
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
