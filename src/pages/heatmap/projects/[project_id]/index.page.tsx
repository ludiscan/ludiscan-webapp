import styled from '@emotion/styled';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { memo, useEffect, useMemo } from 'react';

import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { FC } from 'react';

import { Seo } from '@src/component/atoms/Seo';
import { StatusContent } from '@src/component/molecules/StatusContent';
import { Header } from '@src/component/templates/Header';
import { useAuth } from '@src/hooks/useAuth';
import { useGeneralSelect } from '@src/hooks/useGeneral';
import { useOnlineHeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

// Three.jsを使うHeatMapViewerはSSRを無効にして動的インポート
const HeatMapViewer = dynamic(() => import('@src/features/heatmap/HeatmapViewer').then((mod) => mod.HeatMapViewer), {
  ssr: false,
  loading: () => null, // StatusContentがローディングを表示するため
});

export type HeatMapTaskIdPageProps = {
  className?: string;
  project_id?: number;
};

// SSG: ビルド時にパスを生成せず、初回アクセス時に生成（fallback: 'blocking'）
export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [],
  fallback: 'blocking',
});

export const getStaticProps: GetStaticProps<HeatMapTaskIdPageProps> = async ({ params }) => {
  if (!params || !params.project_id) {
    return {
      notFound: true,
    };
  }

  const projectId = Number(params.project_id as string);
  if (isNaN(projectId)) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      project_id: projectId,
    },
    revalidate: 3600,
  };
};

export type HeatmapIdPageLayoutProps = {
  className?: string;
  service: HeatmapDataService;
};

const HeaderWrapper = memo(() => {
  return <Header showSidebar={false} title={'Heatmap'} />;
});
HeaderWrapper.displayName = 'HeaderWrapper';

export const HeatmapIdPageLayoutComponent: FC<HeatmapIdPageLayoutProps> = ({ className, service }) => {
  const statusContentStatus = useMemo(() => {
    if (!service.task) return 'success';
    if (service.task.status === 'pending' || service.task.status === 'processing') return 'loading';
    return service.task.status === 'completed' ? 'success' : service.task.status === 'failed' ? 'error' : 'loading';
  }, [service.task]);
  return (
    <>
      <HeaderWrapper />
      <div className={className}>
        <StatusContent status={statusContentStatus}>{service && service.isInitialized && <HeatMapViewer service={service} />}</StatusContent>
      </div>
    </>
  );
};

export const HeatmapIdPageLayout = styled(HeatmapIdPageLayoutComponent)`
  height: 100vh;
  height: 100dvh;
  background: ${({ theme }) => theme.colors.surface.raised};

  &__headerV {
    padding: 4px 12px;
    color: ${({ theme }) => theme.colors.primary.main};
    border: 1px solid ${({ theme }) => theme.colors.primary.main};
    border-radius: 16px;
  }
`;

const HeatMapTaskIdPage: FC<HeatMapTaskIdPageProps> = ({ className, project_id }) => {
  const router = useRouter();
  const { isAuthorized, isLoading, ready } = useAuth();

  const sessionHeatmap = useGeneralSelect((s) => s.sessionHeatmap);

  const service = useOnlineHeatmapDataService(project_id, null, sessionHeatmap);

  useEffect(() => {
    if (!isAuthorized && !isLoading && ready) {
      return router.push('/login');
    }
  }, [isAuthorized, isLoading, ready, router]);

  if (!project_id || isNaN(Number(project_id))) {
    return <div>Invalid Task ID</div>;
  }

  return (
    <>
      <Seo title={`Heatmap - Project ${project_id}`} path={`/heatmap/projects/${project_id}`} noIndex={true} />
      <HeatmapIdPageLayout className={className} service={service} />
    </>
  );
};

export default HeatMapTaskIdPage;
