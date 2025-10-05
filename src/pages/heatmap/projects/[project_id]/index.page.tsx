import styled from '@emotion/styled';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';

import type { RootState } from '@src/store';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { GetServerSideProps } from 'next';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Text } from '@src/component/atoms/Text';
import { StatusContent } from '@src/component/molecules/StatusContent';
import { Header } from '@src/component/templates/Header';
import { HeatMapViewer } from '@src/features/heatmap/HeatmapViewer';
import { useAuth } from '@src/hooks/useAuth';
import { useGeneralSelect } from '@src/hooks/useGeneral';
import { useHeatmapState } from '@src/hooks/useHeatmapState';
import { dimensions, fontSizes } from '@src/styles/style';
import { useOnlineHeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

export type HeatMapTaskIdPageProps = {
  className?: string;
  project_id?: number;
};

export const getServerSideProps: GetServerSideProps<HeatMapTaskIdPageProps> = async (context) => {
  const { params } = context;
  if (!params || !params.project_id) {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      project_id: Number(params.project_id as string),
    },
  };
};

export type HeatmapIdPageLayoutProps = {
  className?: string;
  onBackClick?: () => void;
  service: HeatmapDataService;
};

const HeaderWrapper = memo(
  ({ className, onBackClick }: { className?: string; onBackClick?: () => void }) => {
    const { apply, hasDiff, discard } = useHeatmapState();
    const version = useSelector((s: RootState) => s.heatmapCanvas.version);
    return (
      <Header
        title={'Heatmap'}
        onClick={onBackClick}
        iconTitleEnd={<Text className={`${className}__headerV`} text={`${version || 'debug'}`} fontSize={fontSizes.small} fontWeight={'bold'} />}
        iconEnd={
          <>
            <Button fontSize={'small'} onClick={discard} scheme={'surface'} disabled={!hasDiff}>
              <Text text={'Discord'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={apply} scheme={'surface'} className={`${className}__badgeButton ${hasDiff ? 'badge' : ''}`}>
              <Text text={'Save'} fontWeight={'bold'} />
            </Button>
            <Button fontSize={'small'} onClick={() => {}} scheme={'secondary'}>
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

const HeatmapIdPageLayoutComponent: FC<HeatmapIdPageLayoutProps> = ({ className, service, onBackClick }) => {
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
  height: calc(100vh - ${dimensions.headerHeight}px);
  background: ${({ theme }) => theme.colors.surface.dark};

  &__headerV {
    align-self: end;
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
    box-shadow: 2px 2px 12px ${({ theme }) => theme.colors.border.dark};
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

  return <HeatmapIdPageLayout className={className} service={service} onBackClick={handleBackClick} />;
};

export default HeatMapTaskIdPage;
