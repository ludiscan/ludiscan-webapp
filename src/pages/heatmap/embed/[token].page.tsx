import styled from '@emotion/styled';
import dynamic from 'next/dynamic';
import { memo, useEffect, useMemo } from 'react';

import type { components } from '@generated/api';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { GetServerSideProps } from 'next';
import type { FC } from 'react';

import { Text } from '@src/component/atoms/Text';
import { StatusContent } from '@src/component/molecules/StatusContent';
import { env } from '@src/config/env';
import { useGeneralPatch } from '@src/hooks/useGeneral';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { ApiClientProvider } from '@src/modeles/ApiClientContext';
import { createEmbedClient } from '@src/modeles/qeury';
import { heatMapEventBus } from '@src/utils/canvasEventBus';
import { useEmbedHeatmapDataService } from '@src/utils/heatmap/EmbedHeatmapDataService';

// SSR disabled to avoid hydration mismatch with Three.js and react-icons
const HeatMapViewer = dynamic(() => import('@src/features/heatmap/HeatmapViewer').then((mod) => mod.HeatMapViewer), {
  ssr: false,
});

type TokenVerifyResult = components['schemas']['VerifyEmbedTokenResponseDto'];

export type EmbedHeatmapPageProps = {
  className?: string;
  token: string;
  verifyResult: TokenVerifyResult;
  initialMapName: string | null;
  error?: string;
};

export const getServerSideProps: GetServerSideProps<EmbedHeatmapPageProps> = async (context) => {
  const { params } = context;
  if (!params || !params.token || typeof params.token !== 'string') {
    return {
      notFound: true,
    };
  }

  const token = params.token;

  try {
    // Verify token on server side
    const verifyResponse = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v0/embed/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!verifyResponse.ok) {
      const errorMessage = verifyResponse.status === 400 ? 'Invalid or expired token' : 'Failed to verify token';
      return {
        props: {
          token,
          verifyResult: { projectId: 0, sessionId: 0, expiresAt: '' },
          initialMapName: null,
          error: errorMessage,
        },
      };
    }

    const verifyResult = (await verifyResponse.json()) as TokenVerifyResult;

    // Check expiration
    if (verifyResult.expiresAt && Date.now() > Date.parse(verifyResult.expiresAt)) {
      return {
        props: {
          token,
          verifyResult,
          initialMapName: null,
          error: 'Token has expired',
        },
      };
    }

    // Fetch session to get mapName from metadata
    let initialMapName: string | null = null;
    try {
      const sessionResponse = await fetch(`${env.NEXT_PUBLIC_API_BASE_URL}/api/v0/projects/${verifyResult.projectId}/play_session/${verifyResult.sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-embed-token': token,
        },
      });

      if (sessionResponse.ok) {
        const session = (await sessionResponse.json()) as components['schemas']['PlaySessionResponseDto'];
        // Extract mapName from metaData if available
        if (session.metaData && typeof session.metaData === 'object') {
          const metaData = session.metaData as Record<string, unknown>;
          if (typeof metaData.mapName === 'string') {
            initialMapName = metaData.mapName;
          }
        }
      }
    } catch {
      // Session fetch failed, continue without mapName
    }

    return {
      props: {
        token,
        verifyResult,
        initialMapName,
      },
    };
  } catch {
    return {
      props: {
        token,
        verifyResult: { projectId: 0, sessionId: 0, expiresAt: '' },
        initialMapName: null,
        error: 'Network error',
      },
    };
  }
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
      <StatusContent status={statusContentStatus}>{service && service.isInitialized && <HeatMapViewer service={service} isEmbed />}</StatusContent>
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

const EmbedHeatmapPageContent: FC<EmbedHeatmapPageProps> = ({ className, token, verifyResult, initialMapName, error }) => {
  const setGeneral = useGeneralPatch();

  // Set initial mapName from session metadata if available
  useEffect(() => {
    if (initialMapName) {
      setGeneral({ mapName: initialMapName });
    }
  }, [initialMapName, setGeneral]);

  // Embed mode: open timeline menu by default
  // Note: visibility is automatically enabled in PlayerTimeline component when isEmbed=true
  useEffect(() => {
    // Open timeline menu after a short delay to ensure HeatMapViewer is mounted
    const timer = setTimeout(() => {
      heatMapEventBus.emit('click-menu-icon', { name: 'timeline' });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const service = useEmbedHeatmapDataService(verifyResult.projectId || undefined, verifyResult.sessionId || undefined, token);

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
    sessionHeatmapIds: undefined,
    setSessionHeatmapIds: () => {},
    loadTask: () => {},
    getProject: async () => null,
    getSession: async () => null,
    getSessions: async () => [],
    searchSessions: async () => [],
    getPlayers: async () => [],
    getFieldObjectLogs: async () => [],
  };

  if (error) {
    return <EmbedLayout className={className} service={emptyService} error={error} />;
  }

  return <EmbedLayout className={className} service={service} />;
};

const EmbedHeatmapPage: FC<EmbedHeatmapPageProps> = (props) => {
  const { token } = props;

  // Embed用のAPIクライアントファクトリを作成（tokenが変わったら再作成）
  const embedClientFactory = useMemo(() => {
    if (!token) return undefined;
    return () => createEmbedClient(token);
  }, [token]);

  return (
    <ApiClientProvider createClient={embedClientFactory}>
      <EmbedHeatmapPageContent {...props} />
    </ApiClientProvider>
  );
};

export default memo(EmbedHeatmapPage);
