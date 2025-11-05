import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { InputRow } from './InputRow';

import type { Theme } from '@emotion/react';
import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC, CSSProperties } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Toggle } from '@src/component/atoms/Toggle';
import { StatusContent } from '@src/component/molecules/StatusContent';
import { usePlayerTimelinePatch, usePlayerTimelinePick } from '@src/hooks/usePlayerTimeline';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { fontSizes } from '@src/styles/style';
import { heatMapEventBus } from '@src/utils/canvasEventBus';
import { toISOAboutStringWithTimezone } from '@src/utils/locale';

function toggleButtonStyle(theme: Theme): CSSProperties {
  return {
    background: 'unset',
    color: theme.colors.secondary.dark,
    borderRadius: '8px',
    padding: '8px 4px',
    width: '100%',
    height: 'fit-content',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
  };
}

const Component: FC<HeatmapMenuProps> = ({ extra = {}, className }) => {
  const { theme } = useSharedTheme();
  const logName = 'logName' in extra ? extra.logName : undefined;
  const id = 'id' in extra ? extra.id : undefined;

  const apiClient = useApiClient();

  const {
    data: logDetail,
    isLoading,
    isError,
    isSuccess,
  } = useQuery({
    queryKey: ['eventLogDetail', logName, id],
    queryFn: async () => {
      if (typeof logName !== 'string' || !id) return null;
      // Replace with actual data fetching logic
      return apiClient.GET('/api/v0/general_log/position/{event_type}/{id}', {
        params: {
          path: {
            event_type: logName,
            id: Number(id),
          },
        },
      });
    },
    staleTime: DefaultStaleTime,
    enabled: !!logName && !!id,
  });

  const session_id = useMemo(() => logDetail?.data?.session_id, [logDetail]);
  const project_id = useMemo(() => logDetail?.data?.project_id, [logDetail]);

  const { data: session } = useQuery({
    queryKey: ['session', session_id, project_id],
    queryFn: async () => {
      if (!session_id || !project_id) return null;
      return apiClient.GET('/api/v0/projects/{project_id}/play_session/{session_id}', {
        params: {
          path: {
            project_id,
            session_id,
          },
        },
      });
    },
    staleTime: DefaultStaleTime,
    enabled: !!session_id && !!project_id && isSuccess,
  });

  const { data: project } = useQuery({
    queryKey: ['project', project_id],
    queryFn: async () => {
      if (!project_id) return null;
      return apiClient.GET('/api/v0/projects/{id}', {
        params: { path: { id: project_id } },
      });
    },
    staleTime: DefaultStaleTime,
    enabled: !!project_id && isSuccess,
  });
  const handleReload = useCallback(() => {}, []);
  const status = useMemo(() => {
    if (isLoading) return 'loading';
    if (isError) return 'error';
    if (isSuccess && logDetail) return 'success';
    return 'loading';
  }, [isLoading, isError, isSuccess, logDetail]);

  const { details } = usePlayerTimelinePick('details');
  const setTimelineState = usePlayerTimelinePatch();

  const timelineDisable = useMemo(() => {
    return (
      !logDetail?.data ||
      !project_id ||
      !session_id ||
      !(details?.every((detail) => detail.player !== logDetail.data.player || detail.project_id !== project_id || detail.session_id !== session_id) ?? true)
    );
  }, [logDetail, project_id, session_id, details]);

  const handleTimelineClick = useCallback(() => {
    if (timelineDisable || !logDetail || !logDetail.data || !project_id || !session_id) return;
    const newer = {
      player: logDetail.data.player,
      project_id: project_id,
      session_id: session_id,
      visible: true,
    };
    setTimelineState((prev) => ({
      ...prev,
      visible: true,
      details: prev.details ? [...prev.details, newer] : [newer],
    }));
  }, [logDetail, project_id, session_id, setTimelineState, timelineDisable]);

  useEffect(() => {
    if (status === 'success' && logDetail && logDetail.data && typeof logName === 'string' && id) {
      heatMapEventBus.emit('event-log-detail-loaded', { logName: String(logName), id: Number(id) });
    }
  }, [id, logDetail, logName, status]);

  return (
    <StatusContent status={status}>
      <InlineFlexColumn gap={4} style={{ width: '100%' }}>
        {logDetail && logDetail.data && (
          <>
            <Text text={'Event Log'} fontSize={fontSizes.large1} style={{ marginBottom: '8px' }} />
            <InlineFlexColumn wrap={'nowrap'} gap={0} style={{ width: '100%', position: 'relative' }}>
              <InputRow label={'log type'}>
                <Text text={logDetail.data.event_type} fontSize={fontSizes.small} />
              </InputRow>
              <InputRow label={'player id'}>
                <Text text={String(logDetail.data.player)} fontSize={fontSizes.medium} />
              </InputRow>
              <InlineFlexColumn className={`${className}__row`} wrap={'nowrap'} gap={2} align={'flex-start'}>
                <Text text={'Position'} fontSize={fontSizes.medium} />
                <InlineFlexColumn wrap={'nowrap'} gap={4} align={'flex-end'} style={{ width: '100%' }}>
                  <Text text={`X: ${logDetail.data.event_data.x.toFixed(3)},`} fontSize={fontSizes.small} style={{ width: '100px' }} />
                  <Text text={`Y: ${logDetail.data.event_data.y.toFixed(3)},`} fontSize={fontSizes.small} style={{ width: '100px' }} />
                  <Text text={`Z: ${logDetail.data.event_data.z.toFixed(3)}`} fontSize={fontSizes.small} style={{ width: '100px' }} />
                </InlineFlexColumn>
              </InlineFlexColumn>
              <Divider orientation={'horizontal'} />
              <InputRow label={'timestamp'}>
                <Text text={String(logDetail.data.offset_timestamp) + ' ms'} fontSize={fontSizes.small} />
              </InputRow>
              {session && session.data && (
                <Toggle buttonStyle={toggleButtonStyle(theme)} label={<Text text={'Sesssion'} />}>
                  <InputRow label={'id'}>
                    <Text text={String(session.data.sessionId)} fontSize={fontSizes.small} />
                  </InputRow>
                  <InputRow label={'name'}>
                    <Text text={session.data.name} fontSize={fontSizes.small} />
                  </InputRow>
                  <InlineFlexRow wrap={'nowrap'} align={'center'} className={`${className}__row`} gap={4}>
                    <Text text={'Start Time'} fontSize={fontSizes.small} color={theme.colors.text.secondary} />
                    <div className={`${className}__weight1`}>
                      <Text text={toISOAboutStringWithTimezone(new Date(session.data.startTime))} fontSize={fontSizes.small} />
                    </div>
                    {session.data.endTime && (
                      <div className={`${className}__weight1`}>
                        <Text text={toISOAboutStringWithTimezone(new Date(session.data.endTime))} fontSize={fontSizes.small} />
                      </div>
                    )}
                  </InlineFlexRow>
                </Toggle>
              )}
              {project && project.data && (
                <Toggle buttonStyle={toggleButtonStyle(theme)} label={<Text text={'Project'} />}>
                  <InputRow label={'id'}>
                    <Text text={String(project.data.id)} fontSize={fontSizes.small} />
                  </InputRow>
                  <InputRow label={'name'}>
                    <Text text={project.data.name} fontSize={fontSizes.small} />
                  </InputRow>
                  <InputRow label={'description'} align={'flex-start'}>
                    <Text text={project.data.description} fontSize={fontSizes.small} />
                  </InputRow>
                </Toggle>
              )}
            </InlineFlexColumn>
          </>
        )}
        <InlineFlexRow align={'flex-end'} className={`${className}__row`}>
          <div style={{ flex: 1 }} />
          <Button fontSize={'base'} onClick={handleTimelineClick} scheme={'surface'} disabled={timelineDisable}>
            <Text text={'timeline'} fontSize={fontSizes.medium} />
          </Button>
        </InlineFlexRow>
        <InputRow label={''}>
          <div style={{ flex: 1 }} />
          <Button onClick={handleReload} scheme={'surface'} fontSize={'sm'}>
            <Text text={'Reload'} fontSize={fontSizes.small} />
          </Button>
        </InputRow>
      </InlineFlexColumn>
    </StatusContent>
  );
};

export const EventLogDetail = styled(Component)`
  &__weight1 {
    flex: 1;
  }

  &__row {
    position: relative;
    width: 100%;
    padding: 4px 8px;
  }
`;
