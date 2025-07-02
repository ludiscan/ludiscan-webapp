import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';

import { InputRow } from './InputRow';

import type { Theme } from '@emotion/react';
import type { PlayerTimelineDetail } from '@src/modeles/heatmapView';
import type { HeatmapMenuProps } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC, CSSProperties } from 'react';

import { Divider } from '@src/component/atoms/Divider';
import { InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { Toggle } from '@src/component/atoms/Toggle';
import { usePlayerTimelineState } from '@src/hooks/useHeatmapState';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
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

const DetailBlockInternal: FC<{ className?: string; detail: PlayerTimelineDetail; service: HeatmapDataService }> = ({ className, detail, service }) => {
  const { setData } = usePlayerTimelineState();
  const { theme } = useSharedTheme();
  // const player = detail.player;
  const project_id = detail.project_id;
  const session_id = detail.session_id;
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
    enabled: !!session_id && !!project_id,
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
    enabled: !!project_id,
  });

  return (
    <InlineFlexColumn gap={4}>
      <InputRow label={'visible'}>
        <Switch
          label={''}
          size={'medium'}
          checked={detail.visible}
          onChange={() => {
            setData((prev) => {
              const newDetails =
                prev.details?.map((d) => {
                  if (d === detail) {
                    return { ...d, visible: !d.visible };
                  }
                  return d;
                }) || [];
              return { ...prev, details: newDetails };
            });
          }}
        />
      </InputRow>
      {project && project.data && (
        <InlineFlexColumn>
          <InputRow label={'projectId'}>
            <Text text={String(project.data.id)} fontSize={fontSizes.small} />
          </InputRow>
          <Toggle buttonStyle={toggleButtonStyle(theme)} label={<Text text={'Project'} />}>
            <InputRow label={'name'}>
              <Text text={project.data.name} fontSize={fontSizes.small} />
            </InputRow>
            <InputRow label={'description'} align={'flex-start'}>
              <Text text={project.data.description} fontSize={fontSizes.small} />
            </InputRow>
          </Toggle>
        </InlineFlexColumn>
      )}
      {session && session.data && (
        <InlineFlexColumn gap={2}>
          <InputRow label={'SessionId'}>
            <Text text={`${session.data.sessionId}`} fontSize={fontSizes.small} />
          </InputRow>
          <Toggle buttonStyle={toggleButtonStyle(theme)} label={<Text text={'Sesssion'} />}>
            <InputRow label={'name'}>
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
        </InlineFlexColumn>
      )}
    </InlineFlexColumn>
  );
};

const DetailBlock = styled(DetailBlockInternal)`
  &__weight1 {
    flex: 1;
  }

  &__row {
    position: relative;
    width: 100%;
    padding: 4px 8px;
  }
`;

const Component: FC<HeatmapMenuProps> = ({ service }) => {
  const { data } = usePlayerTimelineState();
  //
  //
  // const { isLoading, isError, isSuccess } = usePlayerPositionLogs(player, project_id, session_id, service.createClient());
  //
  //
  //
  //
  //
  // const status = useMemo(() => {
  //   if (isLoading) return 'loading';
  //   if (isError) return 'error';
  //   if (isSuccess) return 'success';
  //   return 'loading';
  // }, [isLoading, isError, isSuccess]);

  return (
    <InlineFlexColumn gap={8} style={{ width: '100%' }}>
      {data.details?.map((detail, index) => (
        <>
          <DetailBlock key={index} detail={detail} service={service} />
          <Divider orientation={'horizontal'} />
        </>
      ))}
    </InlineFlexColumn>
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
