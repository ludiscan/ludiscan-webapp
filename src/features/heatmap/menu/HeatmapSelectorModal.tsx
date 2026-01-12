import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback, useState, useEffect, useMemo } from 'react';
import { IoCheckmark, IoGrid } from 'react-icons/io5';

import type { HeatmapTaskListItem } from '@src/features/heatmap/menu/HeatmapTaskDetail';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { useToast } from '@src/component/templates/ToastContext';
import { HeatmapTaskDetail } from '@src/features/heatmap/menu/HeatmapTaskDetail';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';

const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  width: 800px;
  max-width: calc(100vw - 32px);
  height: 500px;
  max-height: calc(100vh - 120px);
  max-height: calc(100dvh - 120px);
  overflow: hidden;

  @media (width <= 768px) {
    width: calc(100vw - 32px);
    height: calc(100vh - 100px);
    height: calc(100dvh - 100px);
    max-height: calc(100vh - 100px);
    max-height: calc(100dvh - 100px);
  }

  @media (width <= 480px) {
    width: calc(100vw - 16px);
    height: calc(100vh - 80px);
    height: calc(100dvh - 80px);
    max-height: calc(100vh - 80px);
    max-height: calc(100dvh - 80px);
  }
`;

const HintText = styled.div`
  flex-shrink: 0;
  padding: 12px 16px;
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const PanelContainer = styled.div`
  display: flex;
  flex: 1;
  gap: 0;
  min-height: 0;
  overflow: hidden;

  @media (width <= 600px) {
    flex-direction: column;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: 280px;
  min-width: 200px;
  min-height: 0;
  border-right: 1px solid ${({ theme }) => theme.colors.border.default};

  @media (width <= 600px) {
    flex: 1;
    width: 100%;
    min-height: 120px;
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  }
`;

const RightPanel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;

  @media (width <= 600px) {
    flex: 1;
    min-height: 120px;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
`;

const TaskCount = styled.span`
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.tertiary};
  background: ${({ theme }) => theme.colors.surface.base};
  border-radius: 10px;
`;

const ListWrapper = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.default};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.colors.border.strong};
    }
  }
`;

const DetailWrapper = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`;

const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
`;

const TaskItem = styled.button<{ isSelected?: boolean; isCurrent?: boolean }>`
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 12px;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  background: ${({ theme, isSelected }) => (isSelected ? theme.colors.primary.main + '15' : 'transparent')};
  border: 1px solid
    ${({ theme, isSelected, isCurrent }) => (isCurrent ? theme.colors.primary.main : isSelected ? theme.colors.primary.main + '40' : 'transparent')};
  border-radius: 8px;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme, isSelected }) => (isSelected ? theme.colors.primary.main + '20' : theme.colors.surface.hover)};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const TaskIcon = styled.span<{ isSelected?: boolean }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 16px;
  color: ${({ theme, isSelected }) => (isSelected ? theme.colors.primary.main : theme.colors.text.secondary)};
  background: ${({ theme }) => theme.colors.surface.base};
  border-radius: 6px;
`;

const TaskInfo = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const TaskName = styled.span`
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const StatusDot = styled.span<{ status: string }>`
  width: 6px;
  height: 6px;
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
  border-radius: 50%;
`;

const DimensionTag = styled.span`
  padding: 1px 4px;
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  background: ${({ theme }) => theme.colors.surface.raised};
  border-radius: 3px;
`;

const CheckMark = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary.contrast};
  background: ${({ theme }) => theme.colors.primary.main};
  border-radius: 50%;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
`;

const Footer = styled.div`
  display: flex;
  flex-shrink: 0;
  gap: 12px;
  justify-content: flex-end;
  padding: 12px 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
`;

export type HeatmapSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  service: HeatmapDataService;
};

const Component: FC<HeatmapSelectorModalProps> = ({ isOpen, onClose, service }) => {
  const { theme } = useSharedTheme();
  const toast = useToast();
  const apiClient = useApiClient();
  const projectId = service.projectId;
  const currentTaskId = service.task?.taskId;

  // プレビュー用タスク（確定前）
  const [previewTask, setPreviewTask] = useState<HeatmapTaskListItem | null>(null);

  const { data: taskListData, isLoading } = useQuery({
    queryKey: ['heatmapTasksList', projectId],
    queryFn: async () => {
      if (!projectId) return null;

      const res = await apiClient.GET('/api/v0.1/heatmap/projects/{project_id}/tasks/list', {
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

  const tasks = useMemo(() => taskListData?.tasks ?? [], [taskListData?.tasks]);

  // モーダルが開いた時、現在のタスクをプレビューに設定
  useEffect(() => {
    if (isOpen && tasks.length > 0) {
      const current = tasks.find((t) => t.taskId === currentTaskId) ?? null;
      setPreviewTask(current);
    }
  }, [isOpen, tasks, currentTaskId]);

  const handleSelectTask = useCallback((task: HeatmapTaskListItem) => {
    setPreviewTask(task);
  }, []);

  const handleConfirm = useCallback(() => {
    if (previewTask && previewTask.status === 'completed') {
      service.loadTask(previewTask.taskId);
      toast.showToast('Heatmapを読み込み中...', 2, 'info');
      onClose();
    }
  }, [previewTask, service, toast, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const taskCount = tasks.length;
  const countDisplay = taskListData && taskListData.total > tasks.length ? `${taskCount}+` : String(taskCount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Heatmap選択'
      closeOutside
      style={{
        width: 'fit-content',
        minWidth: 'unset',
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: 'calc(100vh - 32px)',
        padding: 0,
        overflow: 'hidden',
      }}
    >
      <ModalContent>
        <HintText>最近作成されたHeatmapから選択して読み込むことができます。</HintText>

        <PanelContainer>
          <LeftPanel>
            <PanelHeader>
              Heatmaps
              <TaskCount>{countDisplay}</TaskCount>
            </PanelHeader>
            <ListWrapper>
              {isLoading && (
                <EmptyState>
                  <Text text='読み込み中...' fontSize={theme.typography.fontSize.base} />
                </EmptyState>
              )}

              {!isLoading && tasks.length === 0 && (
                <EmptyState>
                  <IoGrid size={32} style={{ opacity: 0.3 }} />
                  <Text text='Heatmapがありません' fontSize={theme.typography.fontSize.base} />
                </EmptyState>
              )}

              {!isLoading && tasks.length > 0 && (
                <TaskList>
                  {tasks.map((task) => {
                    const isSelected = previewTask?.taskId === task.taskId;
                    const isCurrent = currentTaskId === task.taskId;
                    return (
                      <TaskItem
                        key={task.taskId}
                        isSelected={isSelected}
                        isCurrent={isCurrent}
                        onClick={() => handleSelectTask(task)}
                        disabled={task.status !== 'completed'}
                      >
                        <TaskIcon isSelected={isSelected}>
                          <IoGrid />
                        </TaskIcon>
                        <TaskInfo>
                          <TaskName>Task #{task.taskId}</TaskName>
                          <TaskMeta>
                            <StatusDot status={task.status} />
                            <span>{task.status}</span>
                            <span>•</span>
                            <DimensionTag>{task.zVisible ? '3D' : '2D'}</DimensionTag>
                          </TaskMeta>
                        </TaskInfo>
                        {isCurrent && (
                          <CheckMark>
                            <IoCheckmark />
                          </CheckMark>
                        )}
                      </TaskItem>
                    );
                  })}
                </TaskList>
              )}
            </ListWrapper>
          </LeftPanel>
          <RightPanel>
            <PanelHeader>Task Details</PanelHeader>
            <DetailWrapper>
              <HeatmapTaskDetail task={previewTask} />
            </DetailWrapper>
          </RightPanel>
        </PanelContainer>
        <Divider orientation='horizontal' />
        <Footer>
          <Button scheme='secondary' fontSize='sm' onClick={handleCancel}>
            Cancel
          </Button>
          <Button scheme='primary' fontSize='sm' onClick={handleConfirm} disabled={!previewTask || previewTask.status !== 'completed'}>
            Select
          </Button>
        </Footer>
      </ModalContent>
    </Modal>
  );
};

export const HeatmapSelectorModal = memo(Component);

HeatmapSelectorModal.displayName = 'HeatmapSelectorModal';
