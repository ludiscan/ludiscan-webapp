/* eslint-disable react/no-unknown-property */
import { memo, useMemo } from 'react';
import { Color, Vector3, CatmullRomCurve3 } from 'three';
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
  const routeLines = useMemo(() => {
    if (!selectedClusterData?.routes) return [];

    return selectedClusterData.routes.map((route: RoutePatternData) => {
      const points = route.trajectory_points
        .filter((pt) => pt.x !== undefined && pt.y !== undefined) // 有効な座標のみ
        .map((pt) => {
          const x = (pt.x ?? 0) * scale;
          const y = (upZ ? (pt.z ?? 0) : (pt.y ?? 0)) * scale + 10;
          const z = (upZ ? (pt.y ?? 0) : (pt.z ?? 0)) * scale;
          return new Vector3(x, y, z);
        });
      return {
        id: route.id,
        points,
        success_rate: route.success_rate,
        occurrence_count: route.occurrence_count,
      };
    });
  }, [selectedClusterData?.routes, scale, upZ]);

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

  // 成功率に基づいてルートの色を取得（0: 赤 → 1: 緑）
  const getRouteColor = (success_rate: number): number => {
    const hue = success_rate * 120; // 0-120度（赤から緑）
    const saturation = 0.7;
    const lightness = 0.5;

    // HSLをRGBに変換
    const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = lightness - c / 2;

    let r = 0,
      g = 0,
      b = 0;
    if (hue < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (hue < 120) {
      r = x;
      g = c;
      b = 0;
    }

    // RGB値を0-255に変換してhexに
    const rInt = Math.round((r + m) * 255);
    const gInt = Math.round((g + m) * 255);
    const bInt = Math.round((b + m) * 255);

    return (rInt << 16) | (gInt << 8) | bInt;
  };

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
      {routeLines.map((route) => {
        if (route.points.length < 2) return null;

        // CatmullRomCurve3で滑らかな曲線を生成
        const curve = new CatmullRomCurve3(route.points);
        const curvePoints = curve.getPoints(Math.max(50, route.points.length * 10));

        // Line2用の位置配列を作成
        const positions = curvePoints.flatMap((pt) => [pt.x, pt.y, pt.z]);

        const geometry = new LineGeometry();
        geometry.setPositions(positions);

        // 成功率に応じて線の太さと透明度を調整
        const lineWidth = Math.max(2, route.occurrence_count / 10); // 出現回数に応じて太さを調整
        const opacity = Math.max(0.3, Math.min(0.8, route.occurrence_count / 20)); // 出現回数に応じて透明度を調整

        const material = new LineMaterial({
          color: getRouteColor(route.success_rate),
          linewidth: lineWidth,
          worldUnits: false,
          transparent: true,
          opacity: opacity,
          depthTest: true,
        });

        material.resolution.set(window.innerWidth, window.innerHeight);

        const line = new Line2(geometry, material);

        return <primitive key={`route-${route.id}`} object={line} renderOrder={zIndexes.renderOrder.timelinePoints} />;
      })}

      {/* Improvements を描画（改善案ルート） */}
      {improvementLines.map((improvement) => {
        if (improvement.points.length < 2) return null;

        // CatmullRomCurve3で滑らかな曲線を生成
        const curve = new CatmullRomCurve3(improvement.points);
        const curvePoints = curve.getPoints(Math.max(50, improvement.points.length * 10));

        // Line2用の位置配列を作成
        const positions = curvePoints.flatMap((pt) => [pt.x, pt.y, pt.z]);

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
