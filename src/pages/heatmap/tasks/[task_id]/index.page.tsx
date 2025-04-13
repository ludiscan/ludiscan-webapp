import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { HeatMapViewer } from './HeatmapViewer';

import type { Env } from '@src/modeles/env';
import type { HeatmapTask } from '@src/modeles/heatmaptask';
import type { GetServerSideProps } from 'next';
import type { FC } from 'react';

import { Text } from '@src/component/atoms/Text';
import { useAuth } from '@src/hooks/useAuth';
import { createClient } from '@src/modeles/qeury';

export type HeatMapTaskIdPageProps = {
  className?: string;
  env?: Env | undefined;
  taskId?: string;
};

export const getServerSideProps: GetServerSideProps<HeatMapTaskIdPageProps> = async (context) => {
  const { params } = context;
  const { env } = await import('@src/config/env');
  if (!params || !params.task_id) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      env,
      taskId: params.task_id as string,
    },
  };
};

const Component: FC<HeatMapTaskIdPageProps> = ({ className, env, taskId }) => {
  const timer = useRef<NodeJS.Timeout>(undefined);

  const router = useRouter();
  const { isAuthorized, isLoading, ready } = useAuth({ env });

  const { data: task, refetch: refetchTask } = useQuery({
    queryKey: ['heatmap', taskId, isAuthorized, env],
    queryFn: async (): Promise<HeatmapTask | null> => {
      if (!taskId || isNaN(Number(taskId)) || !env) return null;
      if (!isAuthorized) return null;
      const { data, error } = await createClient(env).GET('/api/v0/heatmap/tasks/{task_id}', {
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

  useEffect(() => {
    if (!isAuthorized && !isLoading && ready) {
      return router.replace('/');
    }
  }, [isAuthorized, isLoading, ready, router]);

  if (!taskId || isNaN(Number(taskId))) {
    return <div>Invalid Task ID</div>;
  }

  return (
    <div className={className}>
      <Text text={`Task ID: ${taskId}`} />
      {task?.status === 'completed' && <HeatMapViewer task={task} className={`${className}__viewer`} env={env} />}
    </div>
  );
};

export const HeatMapTaskIdPage = styled(Component)`
  max-width: 1200px;
  height: calc(100vh - 64px);
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.surface.dark};
`;

export default HeatMapTaskIdPage;
