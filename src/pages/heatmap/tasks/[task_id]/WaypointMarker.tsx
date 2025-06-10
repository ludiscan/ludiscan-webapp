// WaypointMarker.tsx (HeatmapCanvas と同じファイル内でも構いません)

import { Color } from 'three';

import type { ThreeEvent } from '@react-three/fiber';
import type { FC } from 'react';
import type { Vector3 } from 'three';

import { useCanvasState } from '@src/hooks/useCanvasState';

type WaypointMarkerProps = {
  position: Vector3;
  selected: boolean;
  onClick: () => void;
  onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
};

export const WaypointMarker: FC<WaypointMarkerProps> = ({ position, selected, onClick, onPointerDown, onPointerUp }) => {
  // ユーザーのスケール設定を反映する（Heatmap の他の要素と大きさを合わせるため）
  const {
    general: { scale },
  } = useCanvasState();

  return (
    <mesh
      position={[position.x, position.y, position.z]} // eslint-disable-line react/no-unknown-property
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        onPointerUp?.(e);
      }}
      castShadow={true} // eslint-disable-line react/no-unknown-property
      receiveShadow={false} // eslint-disable-line react/no-unknown-property
      rotation={[-Math.PI, 0, 0]} // eslint-disable-line react/no-unknown-property
    >
      {/* 円すいを上下逆向きにしてピンっぽく */}
      <coneGeometry
        args={[60 * scale, 200 * scale, 6]} // eslint-disable-line react/no-unknown-property
      />
      {/* 底辺の半径, 高さ, セグメント数 */}
      <meshStandardMaterial color={selected ? new Color(0xffff00ff) : new Color(0xff0000ff)} />
    </mesh>
  );
};
