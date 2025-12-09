import styled from '@emotion/styled';
import { useState, useCallback } from 'react';

import type { ImprovementRoute } from '@src/component/molecules/ImprovementRouteCard';
import type { FC } from 'react';

import { ImprovementRouteCard } from '@src/component/molecules/ImprovementRouteCard';
import { useImprovementRoutes } from '@src/hooks/useImprovementRoutes';
import { useSelectedClusterId } from '@src/hooks/useRouteCoach';

interface EventClusterViewerProps {
  className?: string;
  projectId: number;
  sessionId: number;
  playerId?: string;
  mapName?: string;
  onRouteVisualize?: (route: ImprovementRoute, clusterIndex: number) => void;
  onSelectCluster?: (clusterId: number) => void;
}

/**
 * イベントクラスタと改善案ルートを表示するviewer（アコーディオン形式）
 */
const Component: FC<EventClusterViewerProps> = ({ className, projectId, playerId, sessionId, mapName, onRouteVisualize, onSelectCluster }) => {
  // Redux から selectedClusterId を取得
  const selectedClusterId = useSelectedClusterId();
  // 展開中のクラスタIDを管理
  const [expandedClusterId, setExpandedClusterId] = useState<number | null>(null);

  const { data, isLoading, error } = useImprovementRoutes(projectId, sessionId, playerId, {
    mapName,
  });

  const handleClusterClick = useCallback(
    (clusterId: number) => {
      // クラスタ選択を通知
      onSelectCluster?.(clusterId);
      // アコーディオンの展開/折りたたみをトグル
      setExpandedClusterId((prev) => (prev === clusterId ? null : clusterId));
    },
    [onSelectCluster],
  );

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
        const isSelected = selectedClusterId === c.id;
        const isExpanded = expandedClusterId === c.id;

        return (
          <div key={`cluster-${c.id}`} className={`${className}__cluster ${isSelected ? `${className}__cluster--selected` : ''}`}>
            <div
              className={`${className}__clusterHeader`}
              onClick={() => handleClusterClick(c.id)}
              role='button'
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleClusterClick(c.id);
                }
              }}
            >
              <div className={`${className}__clusterLeft`}>
                <span className={`${className}__expandIcon ${isExpanded ? `${className}__expandIcon--expanded` : ''}`}>▶</span>
                <span className={`${className}__clusterTitle`}>#{String(c.id)}</span>
                {c.map_name ? <span className={`${className}__mapName`}>{String(c.map_name)}</span> : null}
              </div>
              <div className={`${className}__clusterRight`}>
                <span className={`${className}__statBadge`}>{String(c.raw_event_count)} events</span>
                <span className={`${className}__statBadge ${className}__statBadge--improvements`}>{String(c.improvements.length)} 改善案</span>
              </div>
            </div>

            {isExpanded ? (
              <div className={`${className}__clusterBody`}>
                <div className={`${className}__clusterMeta`}>
                  中心: ({c.cluster_center_x.toFixed(0)}, {c.cluster_center_y.toFixed(0)}, {c.cluster_center_z.toFixed(0)}) | 半径:{' '}
                  {c.cluster_radius.toFixed(0)}m
                </div>

                <div className={`${className}__routes`}>
                  {c.improvements.length > 0 ? (
                    c.improvements.map((improvement) => (
                      <ImprovementRouteCard
                        key={`improvement-${improvement.id}`}
                        route={improvement}
                        playerId={playerId}
                        onRouteVisualize={(route) => {
                          onRouteVisualize?.(route, clusterIndex);
                        }}
                        compact
                      />
                    ))
                  ) : (
                    <div className={`${className}__noRoutes`}>改善案なし</div>
                  )}
                </div>

                {c.routes && (c.routes as unknown[]).length > 0 ? (
                  <div className={`${className}__routePatterns`}>
                    <strong>ルートパターン:</strong> {String((c.routes as unknown[]).length)}個
                  </div>
                ) : null}
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
  gap: 4px;

  &__loading,
  &__error,
  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-size: 12px;
  }

  &__loading {
    color: #999;
  }

  &__error {
    padding: 12px;
    font-size: 11px;
    color: #c62828;
    background-color: #ffebee;
    border: 1px solid #ef5350;
    border-radius: 4px;
  }

  &__empty {
    padding: 16px;
    color: #999;
    text-align: center;
  }

  &__cluster {
    background-color: ${({ theme }) => theme.colors.surface.base};
    border: 1px solid ${({ theme }) => theme.colors.border.default};
    border-radius: 6px;
    transition: all 0.15s ease;

    &--selected {
      background-color: ${({ theme }) => theme.colors.primary.light}10;
      border-color: ${({ theme }) => theme.colors.primary.main};
    }
  }

  &__clusterHeader {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: ${({ theme }) => theme.colors.surface.hover};
    }

    &:focus {
      outline: 2px solid ${({ theme }) => theme.colors.primary.main};
      outline-offset: -2px;
    }
  }

  &__clusterLeft {
    display: flex;
    gap: 8px;
    align-items: center;
    min-width: 0;
  }

  &__expandIcon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 10px;
    color: ${({ theme }) => theme.colors.text.secondary};
    transition: transform 0.15s ease;

    &--expanded {
      transform: rotate(90deg);
    }
  }

  &__clusterTitle {
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  &__mapName {
    max-width: 100px;
    overflow: hidden;
    text-overflow: ellipsis;
    font-size: 11px;
    color: ${({ theme }) => theme.colors.text.secondary};
    white-space: nowrap;
  }

  &__clusterRight {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;
  }

  &__statBadge {
    padding: 2px 6px;
    font-size: 10px;
    color: ${({ theme }) => theme.colors.text.secondary};
    background-color: ${({ theme }) => theme.colors.surface.sunken};
    border-radius: 4px;

    &--improvements {
      color: ${({ theme }) => theme.colors.primary.contrast};
      background-color: ${({ theme }) => theme.colors.primary.main};
    }
  }

  &__clusterBody {
    padding: 8px 12px 12px;
    border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }

  &__clusterMeta {
    margin-bottom: 8px;
    font-size: 10px;
    color: ${({ theme }) => theme.colors.text.tertiary};
  }

  &__routes {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__noRoutes {
    padding: 8px;
    font-size: 11px;
    color: #999;
    text-align: center;
  }

  &__routePatterns {
    padding-top: 8px;
    margin-top: 8px;
    font-size: 10px;
    color: ${({ theme }) => theme.colors.text.secondary};
    border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  }
`;
