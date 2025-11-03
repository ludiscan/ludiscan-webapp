import styled from '@emotion/styled';

import type { FC } from 'react';

import { ImprovementRouteCard } from '@src/component/molecules/ImprovementRouteCard';
import { useImprovementRoutes } from '@src/hooks/useImprovementRoutes';

interface ImprovementRoute {
  id: number;
  strategy_type: 'divergence' | 'safety_passage' | 'faster';
  trajectory_points: Array<{ x: number; y: number; z: number }>;
  success_rate: number;
  success_count: number;
  avg_duration_ms: number;
  time_saved_ms?: number;
  divergence_analysis?: {
    divergence_point: { x: number; y: number; z: number };
    distance_to_event_cluster: number;
    common_prefix_length: number;
    improvement_segment: Array<{ x: number; y: number; z: number }>;
  };
  safety_score?: number;
  evidence: {
    description: string;
    reference_player_count: number;
    data_source: string;
    sample_count: number;
    confidence: 'high' | 'medium' | 'low';
  };
  feedback_total_count: number;
  feedback_avg_rating: number;
}

interface EventClusterViewerProps {
  className?: string;
  projectId: number;
  playerId?: string;
  mapName?: string;
  onRouteVisualize?: (route: ImprovementRoute, clusterIndex: number) => void;
}

/**
 * イベントクラスタと改善案ルートを表示するviewer
 */
const Component: FC<EventClusterViewerProps> = ({ className, projectId, playerId, mapName, onRouteVisualize }) => {
  const { data, isLoading, error } = useImprovementRoutes(projectId, playerId, {
    mapName,
  });

  if (isLoading) {
    return <div className={`${className} ${className}__loading`}>読み込み中...</div>;
  }

  if (error) {
    return <div className={`${className} ${className}__error`}>エラーが発生しました: {error.message}</div>;
  }

  const clusters = data || [];

  if (clusters.length === 0) {
    return <div className={`${className} ${className}__empty`}>改善案はまだ生成されていません</div>;
  }

  return (
    <div className={className}>
      {clusters.map((cluster, clusterIndex) => {
        const c = cluster;
        return (
          <div key={`cluster-${c.id}`} className={`${className}__cluster`}>
            <div className={`${className}__clusterHeader`}>
              <div>
                <h3 className={`${className}__clusterTitle`}>
                  クラスタ #{String(c.id)}
                  {c.map_name ? ` - ${String(c.map_name)}` : ''}
                </h3>
                <div className={`${className}__clusterInfo`}>
                  中心: ({c.cluster_center_x.toFixed(1)},{c.cluster_center_y.toFixed(1)},{c.cluster_center_z.toFixed(1)}) | 半径: {c.cluster_radius.toFixed(1)}m
                </div>
              </div>
              <div className={`${className}__clusterStats`}>
                <span>イベント数: {String(c.raw_event_count)}</span>
                <span>改善案数: {String(c.improvements.length)}</span>
              </div>
            </div>

            <div className={`${className}__routes`}>
              {(c.improvements as unknown[]).length > 0 ? (
                (c.improvements as ImprovementRoute[]).map((improvement: ImprovementRoute, _index: number) => {
                  return (
                    <ImprovementRouteCard
                      key={`improvement-${improvement.id}`}
                      route={improvement}
                      playerId={playerId}
                      onRouteVisualize={(route) => {
                        onRouteVisualize?.(route, clusterIndex);
                      }}
                    />
                  );
                })
              ) : (
                <div className={`${className}__noRoutes`}>このクラスタに対する改善案がありません</div>
              )}
            </div>

            {c.routes && (c.routes as unknown[]).length > 0 ? (
              <div className={`${className}__routePatterns`}>
                <strong>ルートパターン:</strong> {String((c.routes as unknown[]).length)}個
                {(c.routes as unknown[]).map((route: unknown, idx: number) => {
                  const r = route as Record<string, unknown>;
                  return (
                    <div key={idx}>
                      ルート {idx + 1}: 出現回数 {String(r.occurrence_count)}, 成功率{' '}
                      {(((r.success_count as number) / (r.occurrence_count as number)) * 100).toFixed(0)}%
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

export const EventClusterViewer = styled(Component)`
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__loading,
  &__error,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
  }

  &__loading {
    color: #999;
  }

  &__error {
    padding: 16px;
    color: #c62828;
    background-color: #ffebee;
    border: 1px solid #ef5350;
    border-radius: 4px;
  }

  &__empty {
    padding: 24px;
    color: #999;
    text-align: center;
  }

  &__cluster {
    padding: 16px;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 8px;
  }

  &__clusterHeader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    margin-bottom: 16px;
    border-bottom: 2px solid #2196f3;
  }

  &__clusterTitle {
    margin: 0;
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }

  &__clusterInfo {
    margin-top: 4px;
    font-size: 12px;
    color: #999;
  }

  &__clusterStats {
    display: flex;
    gap: 16px;
    font-size: 13px;
    color: #666;

    & > span {
      display: flex;
      gap: 4px;
      align-items: center;
    }
  }

  &__routes {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__noRoutes {
    padding: 16px;
    color: #999;
    text-align: center;
  }

  &__routePatterns {
    padding-top: 12px;
    margin-top: 12px;
    font-size: 12px;
    color: #666;
    border-top: 1px solid #ddd;
  }
`;
