/* eslint-disable react/no-unknown-property */
import { useFrame } from '@react-three/fiber';
import { memo, useMemo, useRef } from 'react';
import { CatmullRomCurve3, Color, DoubleSide, Vector3 } from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib';

import type { FC } from 'react';
import type { Group } from 'three';

import { useGeneralPick } from '@src/hooks/useGeneral';
import { useImprovementRoutes } from '@src/hooks/useImprovementRoutes';
import { useSelectedClusterId } from '@src/hooks/useRouteCoach';
import { zIndexes } from '@src/styles/style';

interface RouteCoachVisualizationProps {
  projectId: number;
  sessionId: number;
  playerId?: string;
}

// ルートの色（白系で視認性を確保）
const RAW_ROUTE_COLOR = 0xffffff;

// イベントタイプに基づく色
const EVENT_TYPE_COLORS = {
  death: 0xff4444,
  success: 0x44ff44,
} as const;

/**
 * Route Coach のルート可視化コンポーネント（HeatmapCanvas内で使用）
 * - シンプルな太線でルートを描画
 * - クラスター半径円を床面に投影
 * - パルスアニメーションで注目を集める
 */
const Component: FC<RouteCoachVisualizationProps> = ({ projectId, playerId, sessionId }) => {
  const selectedClusterId = useSelectedClusterId();
  const { upZ, scale } = useGeneralPick('upZ', 'scale');

  // アニメーション用のref
  const clusterMarkerRef = useRef<Group>(null);
  const radiusRingRef = useRef<Group>(null);

  // 改善ルートデータを取得
  const { data: clusterData } = useImprovementRoutes(projectId, sessionId, playerId);

  // 選択中のクラスターデータを取得
  const selectedClusterData = useMemo(() => {
    if (!selectedClusterId || !clusterData) return null;
    return clusterData.find((cluster) => cluster.id === selectedClusterId);
  }, [selectedClusterId, clusterData]);

  // クラスター中心座標を計算
  const clusterCenter = useMemo(() => {
    if (!selectedClusterData || selectedClusterData.cluster_center_x === undefined) return null;
    return new Vector3(
      selectedClusterData.cluster_center_x * scale,
      100,
      (upZ ? (selectedClusterData.cluster_center_y ?? 0) : (selectedClusterData.cluster_center_z ?? 0)) * scale,
    );
  }, [selectedClusterData, scale, upZ]);

  // クラスター半径（スケール適用）
  const clusterRadius = useMemo(() => {
    if (!selectedClusterData?.cluster_radius) return 50 * scale;
    return selectedClusterData.cluster_radius * scale * 400;
  }, [selectedClusterData?.cluster_radius, scale]);

  // イベントタイプに基づく色
  const eventTypeColor = useMemo(() => {
    const eventType = selectedClusterData?.event_type;
    if (eventType === 'death') return EVENT_TYPE_COLORS.death;
    if (eventType === 'success') return EVENT_TYPE_COLORS.success;
    return 0xff8800;
  }, [selectedClusterData?.event_type]);

  // Routes を Vector3 配列に変換
  const routeLines = useMemo(() => {
    if (!selectedClusterData?.routes) return [];

    return selectedClusterData.routes.map((route) => {
      const points = route.trajectory_points
        .filter((pt) => pt.x !== undefined && pt.y !== undefined)
        .sort((a, b) => (a.offset_timestamp ?? 0) - (b.offset_timestamp ?? 0))
        .map((pt) => {
          const x = (pt.x ?? 0) * scale;
          const y = (upZ ? (pt.z ?? 0) : (pt.y ?? 0)) * scale + 15;
          const z = (upZ ? (pt.y ?? 0) : (pt.z ?? 0)) * scale;
          return new Vector3(x, y, z);
        });
      return {
        id: route.id,
        points,
      };
    });
  }, [selectedClusterData?.routes, scale, upZ]);

  // Improvements を Vector3 配列に変換
  const improvementLines = useMemo(() => {
    if (!selectedClusterData?.improvements) return [];

    return selectedClusterData.improvements.map((improvement) => {
      const points = improvement.trajectory_points.map((pt) => {
        const x = (pt.x ?? 0) * scale;
        const y = (upZ ? (pt.z ?? 0) : (pt.y ?? 0)) * scale + 20;
        const z = (upZ ? (pt.y ?? 0) : (pt.z ?? 0)) * scale;
        return new Vector3(x, y, z);
      });
      return {
        id: improvement.id,
        points,
        strategy_type: improvement.strategy_type,
      };
    });
  }, [selectedClusterData?.improvements, scale, upZ]);

  // 改善戦略に基づいて色を取得
  const getImprovementColor = (strategy: string): number => {
    switch (strategy) {
      case 'divergence':
        return 0x00aaff;
      case 'safety_passage':
        return 0xffaa00;
      case 'faster':
        return 0x00ff66;
      default:
        return 0xcccccc;
    }
  };

  // パルスアニメーション
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 3) * 0.15;

    if (clusterMarkerRef.current) {
      clusterMarkerRef.current.scale.setScalar(pulse);
    }

    if (radiusRingRef.current) {
      const ringPulse = 1 + Math.sin(t * 2) * 0.05;
      radiusRingRef.current.scale.setScalar(ringPulse);
    }
  });

  // シンプルな線を作成するヘルパー関数
  const createLine = (points: Vector3[], color: number, lineWidth: number): Line2 | null => {
    if (points.length < 2) return null;

    const curve = new CatmullRomCurve3(points);
    const smoothPoints = curve.getPoints(Math.max(100, points.length * 10));
    const positions = smoothPoints.flatMap((pt) => [pt.x, pt.y, pt.z]);

    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    const material = new LineMaterial({
      color,
      linewidth: lineWidth,
      worldUnits: false,
      transparent: true,
      opacity: 0.9,
      depthTest: true,
    });
    material.resolution.set(window.innerWidth, window.innerHeight);

    return new Line2(geometry, material);
  };

  if (!selectedClusterData) return <></>;

  return (
    <>
      {/* クラスター半径円（床面に投影） */}
      {clusterCenter && (
        <group ref={radiusRingRef} position={[clusterCenter.x, 1, clusterCenter.z]}>
          {/* 外側のリング */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={zIndexes.renderOrder.heatmap - 1}>
            <ringGeometry args={[clusterRadius * 0.95, clusterRadius, 64]} />
            <meshBasicMaterial color={eventTypeColor} transparent opacity={0.25} side={DoubleSide} depthWrite={false} />
          </mesh>

          {/* 内側の円 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={zIndexes.renderOrder.heatmap - 2}>
            <circleGeometry args={[clusterRadius * 0.95, 64]} />
            <meshBasicMaterial color={eventTypeColor} transparent opacity={0.1} side={DoubleSide} depthWrite={false} />
          </mesh>

          {/* 境界線 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={zIndexes.renderOrder.heatmap}>
            <ringGeometry args={[clusterRadius - 2, clusterRadius, 64]} />
            <meshBasicMaterial color={eventTypeColor} transparent opacity={0.6} side={DoubleSide} />
          </mesh>
        </group>
      )}

      {/* クラスター中心マーカー */}
      {clusterCenter && (
        <group ref={clusterMarkerRef} position={clusterCenter} renderOrder={zIndexes.renderOrder.timelinePoints + 5}>
          <mesh>
            <sphereGeometry args={[100 * scale, 16, 16]} />
            <meshStandardMaterial color={new Color(eventTypeColor)} emissive={new Color(eventTypeColor)} emissiveIntensity={0.3} />
          </mesh>
        </group>
      )}

      {/* Raw Routes（シンプルな太線） */}
      {routeLines.map((route) => {
        const line = createLine(route.points, RAW_ROUTE_COLOR, 6);
        if (!line) return null;

        return <primitive key={`route-${route.id}`} object={line} renderOrder={zIndexes.renderOrder.timelinePoints} />;
      })}

      {/* Improvement Routes（より太い線） */}
      {improvementLines.map((improvement) => {
        const color = getImprovementColor(improvement.strategy_type);
        const line = createLine(improvement.points, color, 10);
        if (!line) return null;

        return <primitive key={`improvement-${improvement.id}`} object={line} renderOrder={zIndexes.renderOrder.timelineArrows} />;
      })}
    </>
  );
};

export const RouteCoachVisualization = memo(Component);
