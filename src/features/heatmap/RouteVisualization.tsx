/* eslint-disable react/no-unknown-property */
// src/features/heatmap/RouteVisualization.tsx
import { useEffect, useState, useMemo } from 'react';
import { Vector3, BufferGeometry, Line, LineBasicMaterial, Color, ConeGeometry, Mesh, MeshBasicMaterial } from 'three';

import type { RouteEdgeData } from '@src/utils/canvasEventBus';
import type { FC } from 'react';

import { useGeneralPick } from '@src/hooks/useGeneral';
import { zIndexes } from '@src/styles/style';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

export interface RouteVisualizationProps {
  dimensionality: '2d' | '3d';
}

/**
 * ルート可視化コンポーネント
 * route-selectedイベントをリッスンして、選択されたルートを3D空間に矢印やラインで描画
 */
export const RouteVisualization: FC<RouteVisualizationProps> = ({ dimensionality }) => {
  const [selectedRoute, setSelectedRoute] = useState<RouteEdgeData | null>(null);
  const { scale } = useGeneralPick('scale');

  useEffect(() => {
    const handleRouteSelected = (event: CustomEvent<{ route: RouteEdgeData | null }>) => {
      setSelectedRoute(event.detail.route);
    };

    heatMapEventBus.on('route-selected', handleRouteSelected);

    return () => {
      heatMapEventBus.off('route-selected', handleRouteSelected);
    };
  }, []);

  const routeGeometry = useMemo(() => {
    if (!selectedRoute) return null;

    const fromX = (selectedRoute.from.x ?? 0) * scale;
    const fromZ = (selectedRoute.from.z ?? 0) * scale;
    const toX = (selectedRoute.to.x ?? 0) * scale;
    const toZ = (selectedRoute.to.z ?? 0) * scale;

    // 2Dの場合はY=10、3Dの場合は15（少し浮かせる）
    const yOffset = dimensionality === '2d' ? 10 : 15;

    const fromVec = new Vector3(fromX, yOffset, fromZ);
    const toVec = new Vector3(toX, yOffset, toZ);

    const direction = new Vector3().subVectors(toVec, fromVec);
    const length = direction.length();
    const midPoint = new Vector3().addVectors(fromVec, direction.clone().multiplyScalar(0.5));

    return {
      fromVec,
      toVec,
      direction: direction.normalize(),
      length,
      midPoint,
      points: [fromVec, toVec],
    };
  }, [selectedRoute, scale, dimensionality]);

  if (!selectedRoute || !routeGeometry) return null;

  const arrowSize = Math.min(routeGeometry.length * 0.1, 20 * scale);

  return (
    <group>
      {/* ルートライン */}
      <primitive
        object={new Line(new BufferGeometry().setFromPoints(routeGeometry.points), new LineBasicMaterial({ color: new Color(0x00ff00), linewidth: 3 }))}
        renderOrder={zIndexes.renderOrder.timelinePoints + 1}
      />

      {/* 始点マーカー（球） */}
      <mesh position={routeGeometry.fromVec} renderOrder={zIndexes.renderOrder.timelinePoints + 2}>
        <sphereGeometry args={[8 * scale, 16, 16]} />
        <meshBasicMaterial color={new Color(0x00ff00)} />
      </mesh>

      {/* 終点マーカー（円錐＝矢印） */}
      <primitive
        object={(() => {
          const cone = new Mesh(new ConeGeometry(arrowSize * 0.4, arrowSize, 8), new MeshBasicMaterial({ color: new Color(0x00ff00) }));
          cone.position.copy(routeGeometry.toVec);
          // 円錐を進行方向に向ける
          cone.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), routeGeometry.direction);
          return cone;
        })()}
        renderOrder={zIndexes.renderOrder.timelinePoints + 2}
      />
    </group>
  );
};
