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
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';

const POLL_MS = 2000;

/** Query key constants for cache invalidation */
const QUERY_KEYS = {
  improvementRoutesTask: (projectId: number | undefined, sessionId: number | null) => ['improvementRoutesTask', projectId, sessionId] as const,
  improvementRoutes: (projectId: number, sessionId: number | null, playerId?: string) => ['improvementRoutes', projectId, sessionId, playerId] as const,
  sessionPlayers: (projectId: number | undefined, sessionId: number | null) => ['sessionPlayers', projectId, sessionId] as const,
};

/* ===== Styled Components (following BEM pattern) ===== */
interface HintProps {
  children: React.ReactNode;
  className?: string;
}

const HintComponent: FC<HintProps> = ({ children, className }) => <div className={className}>{children}</div>;

const Hint = styled(HintComponent)`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
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
  flex: 1;
  min-height: 0;
  max-height: calc(100vh - 320px);
  padding-right: 4px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 2px;

    &:hover {
      background: #999;
    }
  }
`;

const Component: FC<HeatmapMenuProps> = ({ className, service }) => {
  const { theme } = useSharedTheme();
  const qc = useQueryClient();
  const projectId = service.projectId;
  const sessionId = service.sessionId;
  const enabled = useMemo(() => Number.isFinite(projectId) && sessionId != null, [projectId, sessionId]);

  // プレイヤーID入力
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  // タスクIDを管理（mutation成功後に設定）
  const [taskId, setTaskId] = useState<number | null>(null);

  // Redux から cluster 選択状態を更新
  const patchRouteCoach = useRouteCoachPatch();

  const apiClient = useApiClient();
  const routeCoachApi = useRouteCoachApi();

  // セッションのプレイヤー一覧を取得
  const { data: players, isLoading: isLoadingPlayers } = useQuery<number[]>({
    queryKey: QUERY_KEYS.sessionPlayers(projectId, sessionId),
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

  // タスク状態を取得（taskIdが存在する場合のみ、refetchIntervalで自動ポーリング）
  const { data: taskStatus, isFetching: isTaskFetching } = useQuery({
    // taskIdを含めてクエリの一意性を保証
    queryKey: [...QUERY_KEYS.improvementRoutesTask(projectId, sessionId), taskId],
    enabled: !!taskId,
    queryFn: () => routeCoachApi.getImprovementRoutesTaskStatus(taskId!),
    // AISummaryMenuContentと同様: statusに応じて自動ポーリング
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      // pending/processing の場合のみポーリング継続
      if (data.status === 'pending' || data.status === 'processing') {
        return POLL_MS;
      }
      return false;
    },
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // 改善ルート生成を開始
  const { mutate: startGeneration, isPending: isGenerating } = useMutation({
    mutationFn: (force: boolean = false) => routeCoachApi.generateImprovementRoutes(projectId!, sessionId!, undefined, force),
    onSuccess: async (result) => {
      if (result?.taskId) {
        setTaskId(result.taskId);
        // タスク状態のキャッシュを無効化して再取得
        // exact: false でtaskIdの違うキャッシュも含めて無効化
        await qc.invalidateQueries({
          queryKey: QUERY_KEYS.improvementRoutesTask(projectId, sessionId),
          exact: false,
        });
      }
    },
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.error('Failed to start generation:', error);
    },
  });

  // タスク完了時に改善ルートデータのキャッシュを無効化
  useEffect(() => {
    if (taskStatus?.status === 'completed') {
      // 改善ルートデータを再取得するためキャッシュを無効化
      qc.invalidateQueries({
        queryKey: ['improvementRoutes', projectId, sessionId],
        exact: false, // playerIdが異なるものも含む
      });
    }
  }, [taskStatus?.status, qc, projectId, sessionId]);

  const isTaskRunning = taskStatus?.status === 'pending' || taskStatus?.status === 'processing';
  const busy = isGenerating || isTaskFetching || isTaskRunning;
  const disabled = useMemo(() => {
    return !enabled || busy || !projectId || !sessionId;
  }, [busy, enabled, projectId, sessionId]);

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
    startGeneration(false);
  }, [disabled, startGeneration]);

  const onForceRegenerate = useCallback(() => {
    if (disabled) return;
    startGeneration(true);
  }, [disabled, startGeneration]);

  // セッション切り替え時にリセットし、自動的に改善ルートを生成
  useEffect(() => {
    setTaskId(null);
    setSelectedPlayerId('');
    patchRouteCoach({ selectedClusterId: null });

    // セッションが有効な場合、自動的に改善ルート生成を開始
    if (projectId && sessionId != null) {
      startGeneration(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, sessionId]);

  // アンマウント時にクエリをキャンセル
  useEffect(() => {
    return () => {
      qc.cancelQueries({ queryKey: QUERY_KEYS.improvementRoutesTask(projectId, sessionId) });
      qc.cancelQueries({ queryKey: QUERY_KEYS.sessionPlayers(projectId, sessionId) });
    };
  }, [qc, projectId, sessionId]);

  // プレイヤーを選択する
  const handlePlayerSelect = useCallback((playerId: string) => {
    setSelectedPlayerId(playerId);
  }, []);

  // 改善ルートデータを取得（クラスター一覧用）
  const { data: clusterData } = useImprovementRoutes(projectId || 0, sessionId, selectedPlayerId, {
    enabled: enabled && !!taskStatus,
  });

  return (
    <FlexColumn gap={12} className={className} wrap={'nowrap'}>
      <Text text={'Route Coach v2'} fontSize={theme.typography.fontSize['2xl']} />

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
          <Text text={'プレイヤーを選択'} fontSize={theme.typography.fontSize.base} />
          <FlexRow gap={8} align={'center'}>
            <TextField value={selectedPlayerId} onChange={handlePlayerSelect} placeholder={'プレイヤーIDを入力'} fontSize={theme.typography.fontSize.sm} />
            <Text text={'利用可能なプレイヤー: ' + players.join(', ')} fontSize={theme.typography.fontSize.sm} />
          </FlexRow>
        </FlexColumn>
      ) : (
        <Hint>このセッションにはプレイヤーがいません。</Hint>
      )}

      {/* クラスター選択リスト */}
      {taskStatus && sessionId && clusterData && clusterData.length > 0 ? (
        <ScrollableClusterSection>
          <FlexColumn gap={8}>
            <FlexRow gap={8} align={'space-between'}>
              <Text text='クラスター' fontSize={theme.typography.fontSize.sm} />
              <Text text={`${clusterData.length}件`} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} />
            </FlexRow>
            <EventClusterViewer
              projectId={projectId!}
              sessionId={sessionId}
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
