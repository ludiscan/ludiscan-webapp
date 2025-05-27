import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';

import { HeatMapViewer } from './HeatmapViewer';

import type { Env } from '@src/modeles/env';
import type { HeatmapTask } from '@src/modeles/heatmaptask';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { GetServerSideProps } from 'next';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Text } from '@src/component/atoms/Text';
import { Header } from '@src/component/templates/Header';
import { useAuth } from '@src/hooks/useAuth';
import { useCanvasState } from '@src/hooks/useCanvasState';
import { createClient } from '@src/modeles/qeury';
import { InnerContent } from '@src/pages/_app.page';
import { fontSizes } from '@src/styles/style';
import { useOnlineHeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

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

export type HeatmapIdPageLayoutProps = {
  className?: string;
  version: string;
  onBackClick?: () => void;
  service: HeatmapDataService;
};

export const HeatmapIdPageLayout: FC<HeatmapIdPageLayoutProps> = ({ className, version, service, onBackClick }) => {
  const task = useMemo(() => service.getTask(), [service]);
  return (
    <InnerContent>
      <Header
        title={'Heatmap'}
        onClick={onBackClick}
        iconTitleEnd={<Text className={`${className}__headerV`} text={`${version || 'debug'}`} fontSize={fontSizes.small} fontWeight={'bold'} />}
        iconEnd={
          <>
            <Button fontSize={'small'} onClick={() => {}} scheme={'surface'}>
              <Text text={'Discord'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'surface'}>
              <Text text={'Save'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'primary'}>
              <Text text={'Export'} fontWeight={'bold'} />
            </Button>
          </>
        }
      />
      <div className={className}>{task?.status === 'completed' && service && service.isInitialized && <HeatMapViewer dataService={service} />}</div>
    </InnerContent>
  );
};

const Component: FC<HeatMapTaskIdPageProps> = ({ className, env, taskId }) => {
  const timer = useRef<NodeJS.Timeout>(undefined);

  const router = useRouter();
  const { version } = useCanvasState();
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
    initialData: null,
  });

  const service = useOnlineHeatmapDataService(env, task);

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

  return <HeatmapIdPageLayout className={className} service={service} version={version ? `v${version}` : '---'} />;
};

export const HeatMapTaskIdPage = styled(Component)`
  max-width: 1200px;
  height: calc(100vh - 64px);
  margin: 0 auto;
  background: ${({ theme }) => theme.colors.surface.dark};

  &__headerV {
    align-self: end;
    padding: 4px 12px;
    color: ${({ theme }) => theme.colors.primary.main};
    border: 1px solid ${({ theme }) => theme.colors.primary.main};
    border-radius: 16px;
  }
`;

export default HeatMapTaskIdPage;
