import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { InputRow } from './InputRow';

import type { Theme } from '@emotion/react';
import type { HeatmapMenuProps } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';
import type { FC, CSSProperties } from 'react';

import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Toggle } from '@src/component/atoms/Toggle';
import { StatusContent } from '@src/component/molecules/StatusContent';
import { usePlayerTimelineState } from '@src/hooks/useHeatmapState';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { usePlayerPositionLogs } from '@src/modeles/heatmapView';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { fontSizes } from '@src/styles/style';
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

const Component: FC<HeatmapMenuProps> = ({ extra = {}, service, className }) => {
  const { theme } = useSharedTheme();
  const { setData } = usePlayerTimelineState();
  const playerParam = 'player' in extra ? extra.player : undefined;
  const projectIdParam = 'project_id' in extra ? extra.project_id : undefined;
  const sessionIdParam = 'session_id' in extra ? extra.session_id : undefined;

  const player = useMemo(() => {
    if (typeof playerParam === 'number') {
      return playerParam;
    }
    return undefined;
  }, [playerParam]);
  const project_id = useMemo(() => {
    if (typeof projectIdParam === 'number') {
      return projectIdParam;
    }
    return undefined;
  }, [projectIdParam]);
  const session_id = useMemo(() => {
    if (typeof sessionIdParam === 'number') {
      return sessionIdParam;
    }
    return undefined;
  }, [sessionIdParam]);

  const { data, isLoading, isError, isSuccess } = usePlayerPositionLogs(player, project_id, session_id, service.createClient());

  const { data: session } = useQuery({
    queryKey: ['session', session_id, project_id],
    queryFn: async () => {
      if (!session_id || !project_id) return null;
      return service.createClient()?.GET('/api/v0/projects/{project_id}/play_session/{session_id}', {
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
      return service.createClient()?.GET('/api/v0/projects/{id}', {
        params: { path: { id: project_id } },
      });
    },
    staleTime: DefaultStaleTime,
    enabled: !!project_id && isSuccess,
  });

  const status = useMemo(() => {
    if (isLoading) return 'loading';
    if (isError) return 'error';
    if (isSuccess) return 'success';
    return 'loading';
  }, [isLoading, isError, isSuccess]);

  useEffect(() => {
    if (!isSuccess || !data || !project_id || !session_id || player === undefined) return;
    setData({
      visible: false,
      detail: {
        player: player,
        project_id: project_id,
        session_id: session_id,
      },
    });
  }, [data, isSuccess, player, project_id, session_id, setData]);

  return (
    <StatusContent status={status}>
      <InlineFlexColumn gap={4} style={{ width: '100%' }}>
        {isSuccess && (
          <>
            <Text text={'successed'} />
          </>
        )}
        {session && session.data && (
          <Toggle buttonStyle={toggleButtonStyle(theme)} label={<Text text={'Sesssion'} />}>
            <InputRow label={'SessionId'}>
              <Text text={session.data.name} fontSize={fontSizes.small} />
            </InputRow>
            <InlineFlexRow wrap={'nowrap'} align={'center'} className={`${className}__row`} gap={4}>
              <Text text={'Start Time'} fontSize={fontSizes.small} color={theme.colors.secondary.main} />
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
    </StatusContent>
  );
};

export const PlayerTimeline = styled(Component)`
  &__weight1 {
    flex: 1;
  }

  &__row {
    position: relative;
    width: 100%;
    padding: 4px 8px;
  }
`;
