import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { useToast } from '@src/component/templates/ToastContext';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  padding: 8px;
  overflow-y: auto;
  background: ${({ theme }) => theme.colors.surface.raised};
  border-radius: 8px;
`;

const TaskItem = styled.div<{ isSelected?: boolean }>`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  font-size: 14px;
  cursor: pointer;
  background: ${({ theme, isSelected }) => (isSelected ? theme.colors.primary.main + '20' : theme.colors.surface.base)};
  border: 1px solid ${({ theme, isSelected }) => (isSelected ? theme.colors.primary.main : theme.colors.border.subtle)};
  border-radius: 6px;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
  }
`;

const TaskInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 2px 8px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ status }) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'processing':
        return '#f59e0b';
      case 'pending':
        return '#3b82f6';
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }};
  border-radius: 4px;
`;

const HintText = styled.div`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  padding: 24px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

export type HeatmapSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  service: HeatmapDataService;
};

export const HeatmapSelectorModal: FC<HeatmapSelectorModalProps> = ({ isOpen, onClose, service }) => {
  const { theme } = useSharedTheme();
  const toast = useToast();
  const apiClient = useApiClient();
  const projectId = service.projectId;
  const currentTaskId = service.task?.taskId;

  const { data: taskListData, isLoading } = useQuery({
    queryKey: ['heatmapTasksList', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const res = await apiClient.GET('/api/v0/heatmap/projects/{project_id}/tasks/list', {
        params: {
          path: { project_id: projectId },
          query: { limit: 20, offset: 0 },
        },
      });

      if (res.error) {
        throw new Error(`タスク一覧の取得に失敗しました`);
      }

      return res.data ?? null;
    },
    enabled: !!projectId && isOpen,
    staleTime: 1000 * 30, // 30 seconds
  });

  const tasks = taskListData?.tasks ?? [];

  const handleSelectTask = useCallback(
    (taskId: number) => {
      service.loadTask(taskId);
      toast.showToast('Heatmapを読み込み中...', 2, 'info');
      onClose();
    },
    [service, toast, onClose],
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Heatmap選択' closeOutside>
      <FlexColumn gap={16} style={{ width: '500px', maxWidth: '90vw' }}>
        <HintText>最近作成されたHeatmapから選択して読み込むことができます。</HintText>

        {isLoading && (
          <EmptyState>
            <Text text='読み込み中...' fontSize={theme.typography.fontSize.base} />
          </EmptyState>
        )}

        {!isLoading && tasks.length === 0 && (
          <EmptyState>
            <Text text='Heatmapがありません' fontSize={theme.typography.fontSize.base} />
          </EmptyState>
        )}

        {!isLoading && tasks.length > 0 && (
          <TaskList>
            {tasks.map((task) => (
              <TaskItem key={task.taskId} isSelected={task.taskId === currentTaskId} onClick={() => handleSelectTask(task.taskId)}>
                <TaskInfo>
                  <Text text={`Task #${task.taskId}`} fontSize={theme.typography.fontSize.base} fontWeight='bold' />
                  <TaskMeta>
                    <span>Step: {task.stepSize}</span>
                    <span>|</span>
                    <span>{task.zVisible ? '3D' : '2D'}</span>
                    <span>|</span>
                    <StatusBadge status={task.status}>{task.status}</StatusBadge>
                  </TaskMeta>
                  <TaskMeta>
                    <span>{formatDate(task.updatedAt)}</span>
                  </TaskMeta>
                </TaskInfo>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectTask(task.taskId);
                  }}
                  scheme={task.taskId === currentTaskId ? 'primary' : 'surface'}
                  fontSize='sm'
                  disabled={task.status !== 'completed'}
                >
                  <Text text={task.taskId === currentTaskId ? '選択中' : '選択'} fontSize={theme.typography.fontSize.sm} />
                </Button>
              </TaskItem>
            ))}
          </TaskList>
        )}

        {taskListData && taskListData.total > tasks.length && (
          <HintText>
            {taskListData.total}件中{tasks.length}件を表示しています
          </HintText>
        )}
      </FlexColumn>
    </Modal>
  );
};
