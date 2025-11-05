// src/features/heatmap/routecoach/RouteCoachMenuContent.tsx
import styled from '@emotion/styled';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useEffect, useCallback, useState, memo } from 'react';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { TextField } from '@src/component/molecules/TextField';
import { EventClusterViewer } from '@src/component/organisms/EventClusterViewer';
import { useRouteCoachApi } from '@src/features/heatmap/routecoach/api';
import { useImprovementRoutes } from '@src/hooks/useImprovementRoutes';
import { useRouteCoachPatch } from '@src/hooks/useRouteCoach';
import { useApiClient } from '@src/modeles/ApiClientContext';
import { fontSizes } from '@src/styles/style';

const POLL_MS = 2000;

/* ===== Styled Components (following BEM pattern) ===== */
interface HintProps {
  children: React.ReactNode;
  className?: string;
}

const HintComponent: FC<HintProps> = ({ children, className }) => <div className={className}>{children}</div>;

const Hint = styled(HintComponent)`
  font-size: 12px;
  color: #666;
`;

interface EmptyBoxProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const EmptyBoxComponent: FC<EmptyBoxProps> = ({ children, className, onClick }) => (
  <div className={className} onClick={onClick} role='presentation'>
    {children}
  </div>
);

const EmptyBox = styled(EmptyBoxComponent)`
  padding: 10px 12px;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  border: 1px dashed #bbb;
  border-radius: 8px;
`;

interface ErrorBoxProps {
  children: React.ReactNode;
  className?: string;
}

const ErrorBoxComponent: FC<ErrorBoxProps> = ({ children, className }) => <div className={className}>{children}</div>;

const ErrorBox = styled(ErrorBoxComponent)`
  padding: 10px 12px;
  font-size: 12px;
  color: #b00020;
  background: #fff2f2;
  border-radius: 8px;
`;

interface ScrollableClusterSectionProps {
  children: React.ReactNode;
  className?: string;
}

const ScrollableClusterSectionComponent: FC<ScrollableClusterSectionProps> = ({ children, className }) => <div className={className}>{children}</div>;

const ScrollableClusterSection = styled(ScrollableClusterSectionComponent)`
  max-height: calc(100vh - 450px);
  padding-right: 8px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;

    &:hover {
      background: #999;
    }
  }
`;

const Component: FC<HeatmapMenuProps> = ({ className, service }) => {
  const qc = useQueryClient();
  const projectId = service.projectId;
  const sessionId = service.sessionId;
  const enabled = useMemo(() => Number.isFinite(projectId) && sessionId != null, [projectId, sessionId]);

  // タスクID を管理する状態
  const [taskId, setTaskId] = useState<number | null>(null);

  // プレイヤーID入力
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  // 強制再生成フラグ
  const [forceRegenerate, setForceRegenerate] = useState<boolean>(false);

  // Redux から cluster 選択状態を更新
  const patchRouteCoach = useRouteCoachPatch();

  const apiClient = useApiClient();
  const routeCoachApi = useRouteCoachApi();

  // セッションのプレイヤー一覧を取得
  const { data: players, isLoading: isLoadingPlayers } = useQuery<number[]>({
    queryKey: ['sessionPlayers', projectId, sessionId, apiClient],
    enabled,
    queryFn: async () => {
      if (!projectId || !sessionId) return [];
      const { data, error } = await apiClient.GET('/api/v0/projects/{project_id}/play_session/{session_id}/player_position_log/{session_id}/players', {
        params: {
          path: {
            project_id: projectId,
            session_id: sessionId,
          },
        },
      });
      if (error || !data) return [];
      return data;
    },
    refetchOnWindowFocus: false,
  });

  // タスク状態を定期的に取得（taskIdが存在する場合）
  const {
    data: taskStatus,
    isFetching: isTaskFetching,
    refetch: refetchTaskStatus,
  } = useQuery({
    queryKey: ['improvementRoutesTask', taskId],
    enabled: !!taskId,
    queryFn: () => routeCoachApi.getImprovementRoutesTaskStatus(taskId!),
    refetchOnWindowFocus: false,
  });

  // ポーリング管理：status が 'completed' または 'failed' 以外の場合のみポーリング継続
  useEffect(() => {
    if (!taskStatus || taskStatus.status === 'completed' || taskStatus.status === 'failed') {
      return;
    }

    const interval = setInterval(() => {
      refetchTaskStatus();
    }, POLL_MS);

    return () => clearInterval(interval);
  }, [taskStatus, refetchTaskStatus]);

  // 改善ルート生成を開始
  const { mutate: startGeneration, isPending: isGenerating } = useMutation({
    mutationFn: () => routeCoachApi.generateImprovementRoutes(projectId!, undefined, forceRegenerate),
    onSuccess: (result) => {
      if (result) {
        // eslint-disable-next-line
        console.log('Improvement routes generation started, taskId:', result.taskId, 'force:', forceRegenerate);
        setTaskId(result.taskId ?? null);
        setForceRegenerate(false);
      }
    },
    onError: (error) => {
      // eslint-disable-next-line
      console.error('Failed to start generation:', error);
      setForceRegenerate(false);
    },
  });

  const busy = isGenerating || isTaskFetching;
  const disabled = !enabled || busy;

  // タスク実行中のメッセージ
  const taskStatusMessage = useMemo(() => {
    if (!taskStatus) return null;
    switch (taskStatus.status) {
      case 'pending':
      case 'processing':
        return '改善ルート生成中…';
      case 'completed':
        return taskStatus.result
          ? `改善ルート生成完了 (クラスター: ${taskStatus.result.clusters_generated}, 改善案: ${taskStatus.result.improvements_generated})`
          : '改善ルート生成完了';
      case 'failed':
        return `生成失敗: ${taskStatus.error_message || 'Unknown error'}`;
      default:
        return null;
    }
  }, [taskStatus]);

  const onStartGeneration = useCallback(() => {
    if (disabled) return;
    startGeneration();
  }, [disabled, startGeneration]);

  const onForceRegenerate = useCallback(() => {
    if (disabled) return;
    setForceRegenerate(true);
    startGeneration();
  }, [disabled, startGeneration]);

  // セッション切り替え時にtaskIdをリセット
  useEffect(() => {
    setTaskId(null);
    setSelectedPlayerId('');
    setForceRegenerate(false);
    patchRouteCoach({ selectedClusterId: null });
  }, [projectId, sessionId, patchRouteCoach]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      qc.cancelQueries({ queryKey: ['improvementRoutesTask'] });
      qc.cancelQueries({ queryKey: ['sessionPlayers'] });
    };
  }, [qc]);

  // プレイヤーを選択する
  const handlePlayerSelect = useCallback((playerId: string) => {
    setSelectedPlayerId(playerId);
  }, []);

  // 改善ルートデータを取得（クラスター一覧用）
  const { data: clusterData } = useImprovementRoutes(projectId || 0, selectedPlayerId, {
    enabled: enabled && !!taskStatus,
  });

  return (
    <FlexColumn gap={12} className={className} wrap={'nowrap'}>
      <Text text={'Route Coach v2'} fontSize={fontSizes.large3} />

      {/* 改善ルート生成ボタン */}
      <FlexRow gap={8}>
        <Button onClick={onStartGeneration} disabled={disabled} title='プロジェクトの改善ルートを生成' scheme={'primary'} fontSize={'sm'}>
          {busy ? '生成中…' : '改善ルート生成'}
        </Button>
        {taskStatus?.status === 'completed' && (
          <Button onClick={onForceRegenerate} disabled={disabled} title='既存のタスクを削除して強制的に再生成' scheme={'secondary'} fontSize={'sm'}>
            再生成
          </Button>
        )}
      </FlexRow>

      {/* タスク実行中のステータス */}
      {taskStatusMessage ? <Hint>{taskStatusMessage}</Hint> : null}

      {/* タスク失敗時のエラーメッセージ */}
      {taskStatus?.status === 'failed' ? <ErrorBox>生成に失敗しました：{taskStatus.error_message || '不明なエラー'}</ErrorBox> : null}

      {/* まだ生成がない */}
      {!taskStatus ? (
        <EmptyBox onClick={onStartGeneration}>
          <u>改善ルート生成</u>ボタンでプロジェクトの改善ルートを生成できます。
        </EmptyBox>
      ) : null}

      {/* プレイヤー選択UI */}
      {isLoadingPlayers ? (
        <Hint>プレイヤー一覧を読み込み中...</Hint>
      ) : players && players.length > 0 ? (
        <FlexColumn gap={8}>
          <Text text={'プレイヤーを選択'} fontSize={fontSizes.medium} />
          <FlexRow gap={8} align={'center'}>
            <TextField value={selectedPlayerId} onChange={handlePlayerSelect} placeholder={'プレイヤーIDを入力'} fontSize={fontSizes.small} />
            <Text text={'利用可能なプレイヤー: ' + players.join(', ')} fontSize={fontSizes.small} />
          </FlexRow>
        </FlexColumn>
      ) : (
        <Hint>このセッションにはプレイヤーがいません。</Hint>
      )}

      {/* クラスター選択リスト */}
      {taskStatus && clusterData && clusterData.length > 0 ? (
        <ScrollableClusterSection>
          <FlexColumn gap={16}>
            <Text text='クラスター選択' fontSize={fontSizes.large1} />
            <EventClusterViewer
              projectId={projectId!}
              playerId={selectedPlayerId}
              onSelectCluster={(clusterId) => patchRouteCoach({ selectedClusterId: clusterId })}
            />
          </FlexColumn>
        </ScrollableClusterSection>
      ) : taskStatus ? (
        <Hint>このプレイヤーのクラスターはまだ生成されていません。</Hint>
      ) : null}
    </FlexColumn>
  );
};

export const RouteCoachMenuContent = memo(
  Component,
  (prev, next) => prev.service.sessionId === next.service.sessionId && prev.service.projectId === next.service.projectId,
);
