import styled from '@emotion/styled';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '@src/store';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { GetStaticPaths, GetStaticProps } from 'next';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Seo } from '@src/component/atoms/Seo';
import { Text } from '@src/component/atoms/Text';
import { StatusContent } from '@src/component/molecules/StatusContent';
import { Header } from '@src/component/templates/Header';
import { useAuth } from '@src/hooks/useAuth';
import { useGeneralSelect } from '@src/hooks/useGeneral';
import { useHeatmapState } from '@src/hooks/useHeatmapState';
import { useIsDesktop } from '@src/hooks/useIsDesktop';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
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
  onBackClick?: () => void;
  service: HeatmapDataService;
};

const HeaderWrapper = memo(
  ({ className, onBackClick }: { className?: string; onBackClick?: () => void }) => {
    const { theme } = useSharedTheme();
    const { apply, hasDiff, discard } = useHeatmapState();
    const version = useSelector((s: RootState) => s.heatmapCanvas.version);
    const isDesktop = useIsDesktop();
    // const splitMode = useSelector((s: RootState) => s.heatmapCanvas.splitMode);
    // const dispatch = useDispatch();

    // const handleSplitHorizontal = useCallback(() => {
    //   dispatch(patchSplitMode({ enabled: true, direction: 'horizontal' }));
    // }, [dispatch]);
    //
    // const handleSplitVertical = useCallback(() => {
    //   dispatch(patchSplitMode({ enabled: true, direction: 'vertical' }));
    // }, [dispatch]);
    //
    // const handleSingleView = useCallback(() => {
    //   dispatch(patchSplitMode({ enabled: false }));
    // }, [dispatch]);

    return (
      <Header
        showSidebar={false}
        title={'Heatmap'}
        onClick={onBackClick}
        iconTitleEnd={
          isDesktop ? (
            <Text className={`${className}__headerV`} text={`${version || 'debug'}`} fontSize={theme.typography.fontSize.sm} fontWeight={'bold'} />
          ) : undefined
        }
        iconEnd={
          <>
            {/*<Button fontSize={'sm'} onClick={handleSplitHorizontal} scheme={splitMode.enabled && splitMode.direction === 'horizontal' ? 'primary' : 'surface'}>*/}
            {/*  <Text text={'Split ↔'} fontWeight={'bold'} />*/}
            {/*</Button>*/}
            {/*<Button fontSize={'sm'} onClick={handleSplitVertical} scheme={splitMode.enabled && splitMode.direction === 'vertical' ? 'primary' : 'surface'}>*/}
            {/*  <Text text={'Split ↕'} fontWeight={'bold'} />*/}
            {/*</Button>*/}
            {/*{splitMode.enabled && (*/}
            {/*  <Button fontSize={'sm'} onClick={handleSingleView} scheme={'surface'}>*/}
            {/*    <Text text={'Single'} fontWeight={'bold'} />*/}
            {/*  </Button>*/}
            {/*)}*/}
            <Button fontSize={'sm'} onClick={discard} scheme={'surface'} disabled={!hasDiff}>
              <Text text={'Discard'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'sm'} onClick={apply} scheme={'surface'} className={`${className}__badgeButton ${hasDiff ? 'badge' : ''}`}>
              <Text text={'Save'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'sm'} onClick={() => {}} scheme={'tertiary'}>
              <Text text={'Export'} fontWeight={'bold'} />
            </Button>
          </>
        }
      />
    );
  },
  (prev, next) => {
    return prev.className === next.className && prev.onBackClick === next.onBackClick;
  },
);
HeaderWrapper.displayName = 'HeaderWrapper';

export const HeatmapIdPageLayoutComponent: FC<HeatmapIdPageLayoutProps> = ({ className, service, onBackClick }) => {
  const statusContentStatus = useMemo(() => {
    if (!service.task) return 'success';
    if (service.task.status === 'pending' || service.task.status === 'processing') return 'loading';
    return service.task.status === 'completed' ? 'success' : service.task.status === 'failed' ? 'error' : 'loading';
  }, [service.task]);
  return (
    <>
      <HeaderWrapper className={className} onBackClick={onBackClick} />
      <div className={className}>
        <StatusContent status={statusContentStatus}>{service && service.isInitialized && <HeatMapViewer service={service} />}</StatusContent>
      </div>
    </>
  );
};

export const HeatmapIdPageLayout = styled(HeatmapIdPageLayoutComponent)`
  height: 100vh;
  background: ${({ theme }) => theme.colors.surface.raised};

  &__headerV {
    padding: 4px 12px;
    color: ${({ theme }) => theme.colors.primary.main};
    border: 1px solid ${({ theme }) => theme.colors.primary.main};
    border-radius: 16px;
  }

  &__badgeButton {
    position: relative;
  }

  &__badgeButton.badge::after {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 10px;
    height: 10px;
    content: '';
    background-color: ${({ theme }) => theme.colors.primary.main};
    border-radius: 50%;
    box-shadow: 2px 2px 12px ${({ theme }) => theme.colors.border.strong};
  }
`;

const HeatMapTaskIdPage: FC<HeatMapTaskIdPageProps> = ({ className, project_id }) => {
  const router = useRouter();
  const { isAuthorized, isLoading, ready } = useAuth();

  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);

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
      <HeatmapIdPageLayout className={className} service={service} onBackClick={handleBackClick} />
    </>
  );
};

export default HeatMapTaskIdPage;
