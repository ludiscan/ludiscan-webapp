/* eslint-disable react/no-unknown-property */
import { memo, useMemo } from 'react';
import { BufferGeometry, CatmullRomCurve3, Color, Line, LineBasicMaterial, Vector3 } from 'three';
import { Line2, LineGeometry, LineMaterial } from 'three-stdlib';

import type { FC } from 'react';

import { useGeneralPick } from '@src/hooks/useGeneral';
import { useImprovementRoutes } from '@src/hooks/useImprovementRoutes';
import { useSelectedClusterId } from '@src/hooks/useRouteCoach';
import { zIndexes } from '@src/styles/style';

interface RouteCoachVisualizationProps {
  projectId: number;
  playerId?: string;
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
    return clusterData.find((cluster) => cluster.id === selectedClusterId);
  }, [selectedClusterId, clusterData]);

  // Routes を Vector3 配列に変換（scale と upZ を適用）
  const routeLines = useMemo(() => {
    if (!selectedClusterData?.routes) return [];

    return selectedClusterData.routes.map((route) => {
      const points = route.trajectory_points
        .filter((pt) => pt.x !== undefined && pt.y !== undefined)
        .sort((a, b) => (a.offset_timestamp ?? 0) - (b.offset_timestamp ?? 0))
        .map((pt) => {
          const x = (pt.x ?? 0) * scale;
          const y = (upZ ? (pt.z ?? 0) : (pt.y ?? 0)) * scale + 10;
          const z = (upZ ? (pt.y ?? 0) : (pt.z ?? 0)) * scale;
          return new Vector3(x, y, z);
        });
      return {
        id: route.id,
        points,
      };
    });
  }, [selectedClusterData?.routes, scale, upZ]);

  // Improvements を Vector3 配列に変換（scale と upZ を適用）
  const improvementLines = useMemo(() => {
    if (!selectedClusterData?.improvements) return [];

    return selectedClusterData.improvements.map((improvement) => {
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

  // 改善戦略に基づいて色を取得
  const getImprovementColor = (strategy: string): number => {
    switch (strategy) {
      case 'divergence':
        return 0x0099ff; // 青
      case 'safety_passage':
        return 0xff9900; // オレンジ
      case 'faster':
        return 0x00cc00; // 緑
      default:
        return 0x999999;
    }
  };

  if (!selectedClusterData) return <></>;

  return (
    <>
      {/* Routes を描画（既存のルートパターン） */}
      {routeLines.slice(0, 1).map((route) => {
        if (route.points.length < 2) return null;

        // Line2用の位置配列を作成（直線で接続）
        const positions = route.points.flatMap((pt) => [pt.x, pt.y, pt.z]);

        const geometry = new LineGeometry();
        geometry.setPositions(positions);

        // 成功率に応じて線の太さと透明度を調整
        // const lineWidth = Math.max(2, route.occurrence_count / 10); // 出現回数に応じて太さを調整
        // const opacity = Math.max(0.3, Math.min(0.8, route.occurrence_count / 20)); // 出現回数に応じて透明度を調整

        const material = new LineMaterial({
          color: 0x00cc00,
          linewidth: 2,
          worldUnits: false,
          transparent: true,
          opacity: 1,
          depthTest: true,
        });

        material.resolution.set(window.innerWidth, window.innerHeight);

        const line = new Line(
          new BufferGeometry().setFromPoints(new CatmullRomCurve3(route.points).getPoints(200)),
          new LineBasicMaterial({ color: '#888888' }), // 全体：薄いグレー
        );

        return <primitive key={`route-${route.id}`} object={line} renderOrder={zIndexes.renderOrder.timelinePoints} />;
      })}

      {/* Improvements を描画（改善案ルート） */}
      {improvementLines.map((improvement) => {
        if (improvement.points.length < 2) return null;

        // Line2用の位置配列を作成（直線で接続）
        const positions = improvement.points.flatMap((pt) => [pt.x, pt.y, pt.z]);

        const geometry = new LineGeometry();
        geometry.setPositions(positions);

        const material = new LineMaterial({
          color: getImprovementColor(improvement.strategy_type),
          linewidth: 5, // 改善案は太めに
          worldUnits: false,
          transparent: true,
          opacity: 0.9, // 改善案は濃く表示
          depthTest: true,
        });

        material.resolution.set(window.innerWidth, window.innerHeight);

        const line = new Line2(geometry, material);

        return <primitive key={`improvement-${improvement.id}`} object={line} renderOrder={zIndexes.renderOrder.timelinePoints + 1} />;
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
