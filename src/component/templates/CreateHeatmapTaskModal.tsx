import styled from '@emotion/styled';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { Button } from '../atoms/Button.tsx';
import { FlexRow, InlineFlexColumn, InlineFlexRow } from '../atoms/Flex.tsx';
import { Slider } from '../atoms/Slider.tsx';
import { VerticalSpacer } from '../atoms/Spacer.tsx';
import { Switch } from '../atoms/Switch.tsx';
import { Text } from '../atoms/Text.tsx';
import { Tooltip } from '../atoms/Tooltip.tsx';
import { ClampText } from '../molecules/ClampText.tsx';
import { Modal } from '../molecules/Modal';

import { RouterNavigate } from './RouterNavigate.tsx';

import type { FC } from 'react';

import { query } from '@/modeles/qeury.ts';
import { fontSizes } from '@/styles/style.ts';

type CreateHeatmapTaskModalProps = {
  className?: string | undefined;
  onClose: () => void | Promise<void>;
  isOpen: boolean;
};

export type CreateHeatmapTaskProjectModalProps = CreateHeatmapTaskModalProps & {
  projectId: number;
};

export type CreateHeatmapTaskSessionModalProps = CreateHeatmapTaskModalProps & {
  projectId: number;
  sessionId: number;
};

export type CreateHeatmapItemData = Pick<CreateHeatmapTaskProjectModalProps, 'projectId'> | Pick<CreateHeatmapTaskSessionModalProps, 'sessionId'>;

type CreateTask = {
  projectId: number;
  sessionId?: number | undefined;
};

const Component: FC<CreateHeatmapTaskSessionModalProps | CreateHeatmapTaskProjectModalProps> = (props) => {
  const [stepSize, setStepSize] = useState(100);
  const [zVisible, setZVisible] = useState(true);
  const queryClient = useQueryClient();
  const {
    mutate: createTaskMutation,
    isPending,
    isSuccess,
    data: task,
  } = useMutation({
    mutationKey: ['createProjectTask', props, stepSize, zVisible],
    mutationFn: async (dto: CreateTask) => {
      const { projectId, sessionId } = dto;
      if (!projectId || projectId === 0) {
        return undefined;
      }
      const { data, error } =
        sessionId && sessionId !== 0
          ? await query.POST('/api/v0/heatmap/projects/{project_id}/play_session/{session_id}/tasks', {
            params: {
              path: {
                project_id: projectId,
                session_id: sessionId,
              },
            },
            body: {
              stepSize: stepSize,
              zVisible: zVisible,
            },
          })
          : await query.POST('/api/v0/heatmap/projects/{project_id}/tasks', {
            params: {
              path: {
                project_id: projectId,
              },
            },
            body: {
              stepSize: stepSize,
              zVisible: zVisible,
            },
          });
      if (error) return undefined;
      return data;
    },
    retry: 2,
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['tasks', data.taskId] });
      }
    },
  });

  const { className, onClose, isOpen } = props;

  const handleZVisibleChange = useCallback((checked: boolean) => {
    setZVisible(checked);
  }, []);
  const handleStepSizeSliderChange = useCallback((value: number) => {
    setStepSize(value);
  }, []);

  const handleCreateButton = useCallback(async () => {
    if ('sessionId' in props) {
      const { projectId, sessionId } = props;
      createTaskMutation({ projectId, sessionId });
    } else {
      createTaskMutation({ projectId: props.projectId });
    }
  }, [createTaskMutation, props]);
  if (isSuccess && task && task.taskId > 0 && task.status !== 'failed') {
    return <RouterNavigate to={'/heatmap/tasks/:task_id'} params={{ task_id: String(task.taskId) }} />;
  }
  return (
    <Modal className={className} isOpen={isOpen} onClose={onClose} title={'Create Heatmap'}>
      <ClampText text={'詳細な設定'} lines={2} fontSize={fontSizes.medium} width={'100%'} />
      <VerticalSpacer size={12} />
      <InlineFlexColumn align={'flex-start'} gap={12} className={`${className}__content`}>
        <Tooltip tooltip={'create a 2D/3D view'}>
          <FlexRow align={'center'} gap={12} className={`${className}__inputRow`}>
            <div className={`${className}__input`}>
              <Switch onChange={handleZVisibleChange} label='ZVisible' checked={zVisible} />
            </div>
            <Text text='Z Visible' />
          </FlexRow>
        </Tooltip>
        <FlexRow align={'center'} gap={12} className={`${className}__inputRow`}>
          <InlineFlexRow className={`${className}__input`} gap={4} align={'center'}>
            <Text text='50' fontSize={fontSizes.small} />
            <div style={{ width: '70%' }}>
              <Tooltip tooltip={String(stepSize)} placement={'top'}>
                <Slider onChange={handleStepSizeSliderChange} min={50} max={500} step={10} value={stepSize} />
              </Tooltip>
            </div>
            <Text text='500' fontSize={fontSizes.small} />
          </InlineFlexRow>
          <Text text='Step Size' />
        </FlexRow>
      </InlineFlexColumn>
      <Button onClick={handleCreateButton} scheme={'primary'} fontSize={'medium'} width={'full'} disabled={isSuccess || isPending}>
        <Text text={'Create'} fontWeight={'bold'} />
      </Button>
    </Modal>
  );
};

export const CreateHeatmapTaskModal = styled(Component)`
  &__content {
    padding: 16px;
  }
  &__inputRow {
    width: 300px;
  }

  &__input {
    width: 200px;
  }
`;
