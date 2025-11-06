/* eslint-disable react/no-unknown-property */
import { memo, useMemo } from 'react';
import { Color, Line, LineBasicMaterial, Vector3, BufferGeometry, CatmullRomCurve3 } from 'three';

import type { FC } from 'react';

import { useGeneralPick } from '@src/hooks/useGeneral';
import { useImprovementRoutes } from '@src/hooks/useImprovementRoutes';
import { useSelectedClusterId } from '@src/hooks/useRouteCoach';
import { zIndexes } from '@src/styles/style';

interface RouteCoachVisualizationProps {
  projectId: number;
  playerId?: string;
}

interface RoutePoint {
  x?: number;
  y?: number;
  z?: number;
}

interface RoutePatternData {
  id: number;
  trajectory_points: RoutePoint[];
  occurrence_count: number;
  success_rate: number;
}

interface ImprovementRouteData {
  id: number;
  strategy_type: 'divergence' | 'safety_passage' | 'faster';
  trajectory_points: RoutePoint[];
  success_rate?: number | null;
}

interface ClusterData {
  id: number;
  routes?: RoutePatternData[];
  improvements?: ImprovementRouteData[];
  cluster_center_x?: number;
  cluster_center_y?: number;
  cluster_center_z?: number;
}

/**
 * Route Coach のルート可視化コンポーネント（HeatmapCanvas内で使用）
 */
const Component: FC<RouteCoachVisualizationProps> = ({ projectId, playerId }) => {
  const selectedClusterId = useSelectedClusterId();
  const { upZ, scale } = useGeneralPick('upZ', 'scale');

  // 改善ルートデータを取得
  const { data: clusterData } = useImprovementRoutes(projectId, playerId);

  // 選択中のクラスターデータを取得
  const selectedClusterData = useMemo(() => {
    if (!selectedClusterId || !clusterData) return null;
    return clusterData.find((cluster: ClusterData) => cluster.id === selectedClusterId);
  }, [selectedClusterId, clusterData]);

  // Routes を Vector3 配列に変換（scale と upZ を適用）
  // NOTE: 現在はroutesの描画をコメントアウトしているため、このコードも使用されていません
  // 必要に応じて復元可能
  /* const routeLines = useMemo(() => {
    if (!selectedClusterData?.routes) return [];

    return selectedClusterData.routes.map((route: RoutePatternData) => {
      const points = route.trajectory_points.map((pt) => {
        const x = (pt.x ?? 0) * scale;
        const y = (upZ ? (pt.z ?? 0) : (pt.y ?? 0)) * scale + 10;
        const z = (upZ ? (pt.y ?? 0) : (pt.z ?? 0)) * scale;
        return new Vector3(x, y, z);
      });
      return { id: route.id, points, success_rate: route.success_rate };
    });
  }, [selectedClusterData?.routes, scale, upZ]); */

  // Improvements を Vector3 配列に変換（scale と upZ を適用）
  const improvementLines = useMemo(() => {
    if (!selectedClusterData?.improvements) return [];

    return selectedClusterData.improvements.map((improvement: ImprovementRouteData) => {
      const points = improvement.trajectory_points.map((pt) => {
        const x = (pt.x ?? 0) * scale;
        const y = (upZ ? (pt.z ?? 0) : (pt.y ?? 0)) * scale + 10;
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

  // 成功率に基づいてルートの色を取得
  // NOTE: 現在はroutesの描画をコメントアウトしているため、この関数も使用されていません
  /* const getRouteColor = (success_rate: number) => {
    const hue = (success_rate * 120) / 360; // 0-120度（赤から緑）
    const saturation = 100;
    const lightness = 50;
    return `hsl(${hue * 360}, ${saturation}%, ${lightness}%)`;
  }; */

  // 改善戦略に基づいて色を取得
  const getImprovementColor = (strategy: string) => {
    switch (strategy) {
      case 'divergence':
        return '#0099FF'; // 青
      case 'safety_passage':
        return '#FF9900'; // オレンジ
      case 'faster':
        return '#00CC00'; // 緑
      default:
        return '#999999';
    }
  };

  if (!selectedClusterData) return <></>;

  return (
    <>
      {/* Routes を描画 - コメントアウト: 大量の線が描画されるのを防ぐため */}
      {/* {routeLines.map((route) => {
        if (route.points.length < 2) return null;

        const lineObject = new Line(
          new BufferGeometry().setFromPoints(new CatmullRomCurve3(route.points).getPoints(50)),
          new LineBasicMaterial({
            color: getRouteColor(route.success_rate),
            linewidth: Math.max(1, Math.floor(route.success_rate * 5)),
          }),
        );

        return <primitive key={`route-${route.id}`} object={lineObject} renderOrder={zIndexes.renderOrder.timelinePoints} />;
      })} */}

      {/* Improvements を描画 */}
      {improvementLines.map((improvement) => {
        if (improvement.points.length < 2) return null;

        const lineObject = new Line(
          new BufferGeometry().setFromPoints(new CatmullRomCurve3(improvement.points).getPoints(50)),
          new LineBasicMaterial({
            color: getImprovementColor(improvement.strategy_type),
            linewidth: 3,
          }),
        );

        return <primitive key={`improvement-${improvement.id}`} object={lineObject} renderOrder={zIndexes.renderOrder.timelinePoints + 1} />;
      })}

      {/* クラスター中心マーカー */}
      {selectedClusterData.cluster_center_x !== undefined && (
        <mesh
          position={
            new Vector3(
              selectedClusterData.cluster_center_x * scale,
              (upZ ? selectedClusterData.cluster_center_z : selectedClusterData.cluster_center_y) * scale + 10,
              (upZ ? selectedClusterData.cluster_center_y : selectedClusterData.cluster_center_z) * scale,
            )
          }
          renderOrder={zIndexes.renderOrder.timelinePoints}
        >
          <sphereGeometry args={[5 * scale, 16, 16]} />
          <meshStandardMaterial color={new Color(1, 0, 0)} transparent />
        </mesh>
      )}
    </>
  );
};

export const RouteCoachVisualization = memo(Component);
