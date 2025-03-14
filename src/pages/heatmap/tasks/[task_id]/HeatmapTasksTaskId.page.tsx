import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { HeatMapViewer } from './HeatmapViewer';

import type { HeatmapTask } from '@/modeles/heatmaptask.ts';
import type { FC } from 'react';

import { Text } from '@/component/atoms/Text.tsx';
import { RouterNavigate } from '@/component/templates/RouterNavigate.tsx';
import { useAuth } from '@/hooks/useAuth.ts';
import { query } from '@/modeles/qeury.ts';

export type HeatMapTaskIdPageProps = {
  className?: string;
};

const Component: FC<HeatMapTaskIdPageProps> = ({ className }) => {
  const { task_id: taskId } = useParams();

  const timer = useRef<NodeJS.Timeout>();

  const { isAuthorized, isLoading } = useAuth();

  const { data: task, refetch: refetchTask } = useQuery({
    queryKey: ['heatmap', taskId, isAuthorized],
    queryFn: async (): Promise<HeatmapTask | null> => {
      if (!taskId || isNaN(Number(taskId))) return null;
      if (!isAuthorized) return null;
      const { data, error } = await query.GET('/api/v0/heatmap/tasks/{task_id}', {
        params: { path: { task_id: Number(taskId) } },
      });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!task) return;

    if (task.status === 'pending' || task.status === 'processing') {
      timer.current = setInterval(() => {
        refetchTask();
      }, 700);
    }
  }, [refetchTask, task]);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearInterval(timer.current);
      }
    };
  }, []);

  if (!taskId || isNaN(Number(taskId))) {
    return <div>Invalid Task ID</div>;
  }

  if (!isAuthorized && !isLoading) {
    return <RouterNavigate to={'/ludiscan/view'} />;
  }

  return (
    <div className={className}>
      <Text text={`Task ID: ${taskId}`} />
      {task?.status === 'completed' && <HeatMapViewer task={task} className={`${className}__viewer`} />}
    </div>
  );
};

export const HeatMapTaskIdPage = styled(Component)`
  width: 100%;
  height: calc(100vh - 64px);
  background: ${({ theme }) => theme.colors.surface.dark};
`;
