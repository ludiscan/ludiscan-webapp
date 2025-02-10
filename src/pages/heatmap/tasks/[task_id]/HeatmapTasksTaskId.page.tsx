import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

import { HeatMapViewer } from './HeatmapViewer';

import type { HeatmapTask } from '@/modeles/heatmaptask.ts';
import type { FC } from 'react';

import { RouterNavigate } from '@/component/templates/RouterNavigate.tsx';
import { useAuth } from '@/hooks/useAuth.ts';
import { query } from '@/modeles/qeury.ts';

export type HeatMapTaskIdPageProps = {
  className?: string;
};

const Component: FC<HeatMapTaskIdPageProps> = ({ className }) => {
  const { task_id: taskId } = useParams();

  const timer = useRef<NodeJS.Timeout>();

  const { isAuthorized } = useAuth();

  const { data: task, refetch: refetchTask } = useQuery({
    queryKey: ['heatmap', taskId],
    queryFn: async (): Promise<HeatmapTask | undefined> => {
      const { data, error } = await query.GET('/api/v0/heatmap/tasks/{task_id}', {
        params: { path: { task_id: Number(taskId) } },
      });
      if (error) return undefined;
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

  if (!isAuthorized) {
    return <RouterNavigate to={'/'} />;
  }

  return (
    <div className={className}>
      <h1>Task ID: {taskId}</h1>
      {task?.status === 'completed' && <HeatMapViewer task={task} className={`${className}__viewer`} />}
    </div>
  );
};

export const HeatMapTaskIdPage = styled(Component)`
  overflow: hidden auto;

  &__viewer {
    width: 100%;
    height: 100%;
  }
`;
