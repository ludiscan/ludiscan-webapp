import styled from '@emotion/styled';
import { memo, useEffect, useMemo, useState } from 'react';

import type { components } from '@generated/api';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { GetServerSideProps } from 'next';
import type { FC } from 'react';

import { Text } from '@src/component/atoms/Text';
import { StatusContent } from '@src/component/molecules/StatusContent';
import { env } from '@src/config/env';
import { HeatMapViewer } from '@src/features/heatmap/HeatmapViewer';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useEmbedHeatmapDataService } from '@src/utils/heatmap/EmbedHeatmapDataService';

export type EmbedHeatmapPageProps = {
  className?: string;
  token: string;
};

export const getServerSideProps: GetServerSideProps<EmbedHeatmapPageProps> = async (context) => {
  const { params } = context;
  if (!params || !params.token || typeof params.token !== 'string') {
    return {
      notFound: true,
    };
  }
  return {
    props: {
      token: params.token,
    },
  };
};

type EmbedLayoutProps = {
  className?: string;
  service: HeatmapDataService;
  error?: string;
};

const EmbedLayoutComponent: FC<EmbedLayoutProps> = ({ className, service, error }) => {
  const { theme } = useSharedTheme();

  const statusContentStatus = useMemo(() => {
    if (error) return 'error';
    if (!service.task) return 'success';
    if (service.task.status === 'pending' || service.task.status === 'processing') return 'loading';
    return service.task.status === 'completed' ? 'success' : service.task.status === 'failed' ? 'error' : 'loading';
  }, [service.task, error]);

  if (error) {
    return (
      <div className={`${className} ${className}__error`}>
        <Text text={error} fontSize={theme.typography.fontSize.base} />
      </div>
    );
  }

  return (
    <div className={className}>
      <StatusContent status={statusContentStatus}>{service && service.isInitialized && <HeatMapViewer service={service} />}</StatusContent>
    </div>
  );
};

const EmbedLayout = styled(EmbedLayoutComponent)`
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.surface.raised};

  &__error {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

type TokenVerifyResult = components['schemas']['VerifyEmbedTokenResponseDto'];

const EmbedHeatmapPage: FC<EmbedHeatmapPageProps> = ({ className, token }) => {
  const [verifyResult, setVerifyResult] = useState<TokenVerifyResult | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isVerifying, setIsVerifying] = useState(true);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v0/embed/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          if (response.status === 400) {
            setError('Invalid or expired token');
          } else {
            setError('Failed to verify token');
          }
          setIsVerifying(false);
          return;
        }

        const data = (await response.json()) as TokenVerifyResult;

        // Check expiration (expiresAt is ISO 8601 string)
        if (data.expiresAt && Date.now() > Date.parse(data.expiresAt)) {
          setError('Token has expired');
          setIsVerifying(false);
          return;
        }

        setVerifyResult(data);
        setIsVerifying(false);
      } catch {
        setError('Network error');
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  const service = useEmbedHeatmapDataService(verifyResult?.projectId, verifyResult?.sessionId, token);

  const emptyService: HeatmapDataService = {
    isInitialized: false,
    getMapList: async () => [],
    getMapContent: async () => null,
    getGeneralLogKeys: async () => null,
    task: undefined,
    getEventLog: async () => null,
    getEventLogSnapshot: () => null,
    projectId: undefined,
    sessionId: null,
    setSessionId: () => {},
    getProject: async () => null,
    getSession: async () => null,
    getSessions: async () => [],
    getPlayers: async () => [],
    getFieldObjectLogs: async () => [],
  };

  if (isVerifying) {
    return <EmbedLayout className={className} service={emptyService} />;
  }

  if (error) {
    return <EmbedLayout className={className} service={emptyService} error={error} />;
  }

  return <EmbedLayout className={className} service={service} />;
};

export default memo(EmbedHeatmapPage);
