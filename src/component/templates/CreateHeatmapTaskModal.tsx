import styled from '@emotion/styled';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '../atoms/Button';
import { FlexRow, InlineFlexColumn, InlineFlexRow } from '../atoms/Flex';
import { Slider } from '../atoms/Slider';
import { VerticalSpacer } from '../atoms/Spacer';
import { Switch } from '../atoms/Switch';
import { Text } from '../atoms/Text';
import { Tooltip } from '../atoms/Tooltip';
import { ClampText } from '../molecules/ClampText';
import { Modal } from '../molecules/Modal';

import type { Env } from '@src/modeles/env';
import type { FC } from 'react';

import { createClient } from '@src/modeles/qeury';
import { fontSizes } from '@src/styles/style';

type CreateHeatmapTaskModalProps = {
  className?: string | undefined;
  onClose: () => void | Promise<void>;
  isOpen: boolean;
  env?: Env | undefined;
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
async function sessionCreateTask(env: Env, projectId: number, sessionId: number, stepSize: number, zVisible: boolean) {
  return await createClient(env).POST('/api/v0/heatmap/projects/{project_id}/play_session/{session_id}/tasks', {
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
  });
}

async function projectCreateTask(env: Env, projectId: number, stepSize: number, zVisible: boolean) {
  return await createClient(env).POST('/api/v0/heatmap/projects/{project_id}/tasks', {
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
}

const Component: FC<CreateHeatmapTaskSessionModalProps | CreateHeatmapTaskProjectModalProps> = (props) => {
  const { env, isOpen, onClose, className } = props;
  const [stepSize, setStepSize] = useState(100);
  const [zVisible, setZVisible] = useState(true);
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    mutate: createTaskMutation,
    isPending,
    isSuccess,
    data: task,
  } = useMutation({
    mutationKey: ['createProjectTask', env, stepSize, zVisible],
    mutationFn: async (dto: CreateTask) => {
      const { projectId, sessionId } = dto;
      if (!projectId || projectId === 0 || !env) {
        return undefined;
      }

      const { data, error } =
        sessionId && sessionId !== 0
          ? await sessionCreateTask(env, projectId, sessionId, stepSize, zVisible)
          : await projectCreateTask(env, projectId, stepSize, zVisible);
      if (error) return undefined;
      return data;
    },
    retry: 2,
    onSuccess: async (data) => {
      if (data) {
        await queryClient.invalidateQueries({ queryKey: ['tasks', data.taskId] });
      }
    },
  });

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
  useEffect(() => {
    if (isSuccess && task && task.taskId > 0 && task.status !== 'failed') {
      return router.push('/heatmap/tasks/:task_id'.replace(':task_id', String(task.taskId)));
    }
  }, [isSuccess, task, router]);
  return (
    <Modal className={className} isOpen={isOpen} onClose={onClose} title={'Create Heatmap'}>
      <ClampText text={'詳細な設定'} lines={2} fontSize={fontSizes.medium} width={'100%'} />
      <VerticalSpacer size={12} />
      <InlineFlexColumn align={'flex-start'} gap={12} className={`${className}__content`}>
        <Tooltip tooltip={'create a 2D/3D view'}>
          <FlexRow align={'center'} gap={12} className={`${className}__inputRow`}>
            <div className={`${className}__input`}>
              <Switch size={'large'} onChange={handleZVisibleChange} label='ZVisible' checked={zVisible} />
            </div>
            <Text text='Z Visible' />
          </FlexRow>
        </Tooltip>
        <FlexRow align={'center'} gap={12} className={`${className}__inputRow`}>
          <InlineFlexRow className={`${className}__input`} gap={4} align={'center'}>
            <Text text='50' fontSize={fontSizes.small} />
            <div style={{ width: '70%' }}>
              <Tooltip tooltip={String(stepSize)} placement={'top'}>
                <Slider value={stepSize} onChange={handleStepSizeSliderChange} min={50} max={500} step={10} />
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
