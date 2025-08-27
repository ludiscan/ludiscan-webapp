import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BsInfoCircle } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { InputRow } from './InputRow';

import type { Theme } from '@emotion/react';
import type { PlayerTimelineDetail } from '@src/modeles/heatmapView';
import type { HeatmapMenuProps } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC, CSSProperties } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { FlexRow, InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { Toggle } from '@src/component/atoms/Toggle';
import { Modal } from '@src/component/molecules/Modal';
import { Selector } from '@src/component/molecules/Selector';
import { TextArea } from '@src/component/molecules/TextArea';
import { useGetApi } from '@src/hooks/useGetApi';
import { usePlayerTimelineState } from '@src/hooks/useHeatmapState';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { fontSizes } from '@src/styles/style';
import { toISOAboutStringWithTimezone } from '@src/utils/locale';
import { compileHVQL, parseHVQL } from '@src/utils/vql';

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

const DetailBlockInternal: FC<{ className?: string; details: PlayerTimelineDetail[]; service: HeatmapDataService }> = ({ className, details, service }) => {
  const { setData } = usePlayerTimelineState();
  const { theme } = useSharedTheme();
  // const player = detail.player;
  const project_id = details[0].project_id;
  const session_id = details[0].session_id;
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

  // const { data: project } = useQuery({
  //   queryKey: ['project', project_id],
  //   queryFn: async () => {
  //     if (!project_id) return null;
  //     return service.createClient()?.GET('/api/v0/projects/{id}', {
  //       params: { path: { id: project_id } },
  //     });
  //   },
  //   staleTime: DefaultStaleTime,
  //   enabled: !!project_id,
  // });

  if (details.length === 0) return null;
  return (
    <InlineFlexColumn gap={4} className={className}>
      <FlexRow className={`${className}__row`} wrap={'nowrap'} align={'center'}>
        <Text text={`Session: ${session_id}`} fontSize={fontSizes.small} color={theme.colors.secondary.main} />
        <div style={{ flex: 1 }} />
        <Button
          fontSize={'medium'}
          onClick={() => {
            setData((prev) => {
              const newDetails: PlayerTimelineDetail[] = prev.details?.filter((d) => !details.some((detail) => d.session_id === detail.session_id)) || [];
              return { ...prev, details: newDetails };
            });
          }}
          scheme={'none'}
        >
          <IoClose />
        </Button>
      </FlexRow>
      {details.map((detail, index) => (
        <InlineFlexRow key={index} wrap={'nowrap'} align={'center'} className={`${className}__row`} gap={4}>
          <Text text={`Player: ${detail.player}`} fontSize={fontSizes.small} color={theme.colors.secondary.main} />
          <Switch
            checked={detail.visible}
            onChange={() => {
              setData((prev) => {
                const newDetails: PlayerTimelineDetail[] =
                  prev.details?.map((d) => {
                    if (d.player === detail.player && d.session_id === detail.session_id) {
                      return {
                        ...d,
                        visible: !d.visible,
                      };
                    }
                    return d;
                  }) || [];
                return { ...prev, details: newDetails };
              });
            }}
            size={'small'}
            label={''}
          />
        </InlineFlexRow>
      ))}
      {session && session.data && (
        <InlineFlexColumn gap={2}>
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
  width: calc(100% - 16px);

  &__weight1 {
    flex: 1;
  }

  &__row {
    position: relative;
    width: 100%;
    padding: 4px 8px;
  }
`;

const queryPlaceholder =
  'map status.hand {\n' +
  '  rock    -> player-current-point-icon: hand-rock;\n' +
  '  paper   -> player-current-point-icon: hand-paper;\n' +
  '  scissor -> player-current-point-icon: hand-scissor;\n' +
  '}';

const Component: FC<HeatmapMenuProps> = ({ className, service, task }) => {
  const { data, setData } = usePlayerTimelineState();
  const [selectSessionId, setSelectSessionId] = useState<string | undefined>(undefined);
  const [queryText, setQueryText] = useState<string>('');
  const [isOpenQueryInfo, setIsOpenQueryInfo] = useState<boolean>(false);
  const [queryReadme, setQueryReadme] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/heatmap/vqueryREADME.md', { cache: 'no-store' });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const text = await res.text();
        if (!cancelled) setQueryReadme(text);
      } catch (e) {
        if (!cancelled) {
          console.log('Failed to fetch query README:', e);
          setQueryReadme('Failed to load query README. Please check the console for details.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sessionByDetail = useMemo(() => {
    const map = new Map<number, PlayerTimelineDetail[]>();
    data.details?.forEach((detail) => {
      if (!map.has(detail.session_id)) {
        map.set(detail.session_id, []);
      }
      map.get(detail.session_id)?.push(detail);
    });
    return map;
  }, [data.details]);

  const { data: sessions } = useQuery({
    queryKey: ['player-timeline', task.project.id],
    queryFn: async () => {
      return service.createClient()?.GET('/api/v0/projects/{project_id}/play_session', {
        params: {
          path: {
            project_id: task.project.id,
          },
        },
      });
    },
    staleTime: DefaultStaleTime,
    enabled: task.project.id !== undefined && service.createClient() !== null,
  });

  const getPlayers = useGetApi('/api/v0/projects/{project_id}/play_session/{session_id}/player_position_log/{session_id}/players', service.getEnv(), {
    staleTime: DefaultStaleTime,
  });
  const sessionIds = useMemo(() => {
    return sessions?.data?.map((session) => String(session.sessionId)) || [];
  }, [sessions]);

  const handleAddTimeline = useCallback(async () => {
    if (!selectSessionId || service.createClient() === undefined) return;
    const project_id = task.project.id;
    const session_id = selectSessionId ? Number(selectSessionId) : 0;
    const data = await getPlayers.fetch([
      {
        params: {
          path: {
            project_id,
            session_id,
          },
        },
      },
    ]);
    const players = data?.data;
    if (!players) return;
    setData((prev) => {
      const newDetails: PlayerTimelineDetail[] = players
        .map((player) => {
          if (prev.details?.some((d) => d.player === player && d.session_id === session_id)) {
            return null;
          }
          return {
            player: player,
            project_id,
            session_id,
            visible: true,
          };
        })
        .filter((s) => s !== null);
      return {
        ...prev,
        visible: true,
        details: [...(prev.details || []), ...newDetails],
      };
    });
  }, [getPlayers, selectSessionId, service, setData, task.project.id]);

  const queryDisable = useMemo(() => {
    try {
      if (queryText === '') {
        return true;
      }
      parseHVQL(queryText);
      return false;
    } catch {
      return true;
    }
  }, [queryText]);

  useEffect(() => {
    if (queryText === '') {
      return;
    }
    try {
      const applyStyle = compileHVQL(queryText, {
        palette: { yellow: '#FFD400', blue: '#0057FF' },
        vars: {}, // 必要なら
      });
      console.log('HVQL query:', applyStyle);
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.log('HVQL parse error:', error);
    }
  }, [queryText]);

  const onApplyQuery = useCallback(() => {
    if (queryDisable) return;
    setData((prev) => {
      return {
        ...prev,
        queryText: queryText,
      };
    });
  }, [queryDisable, queryText, setData]);

  return (
    <InlineFlexColumn gap={8} style={{ width: '100%' }}>
      <Text text={'create'} />
      <InputRow label={'select session'}>
        <InlineFlexRow>
          <Selector options={sessionIds} value={selectSessionId} onChange={setSelectSessionId} />
          <Button fontSize={'small'} onClick={handleAddTimeline} scheme={'primary'} disabled={selectSessionId === undefined}>
            <Text text={'add'} />
          </Button>
        </InlineFlexRow>
      </InputRow>
      {sessionByDetail.size > 0 && (
        <>
          <Toggle
            className={`${className}__queryTextFieldContainer`}
            label={'filter query'}
            maxHeight={600}
            trailingIcon={<BsInfoCircle size={12} />}
            onTrailingIconClick={() => setIsOpenQueryInfo(true)}
          >
            <TextArea placeholder={queryPlaceholder} className={`${className}__queryTextField`} value={queryText} onChange={setQueryText} />
            <Button fontSize={'small'} scheme={'primary'} onClick={onApplyQuery} disabled={queryDisable}>
              <Text text={'search'} />
            </Button>
          </Toggle>
          {Array.from(sessionByDetail.values()).map((details, index) => (
            <>
              <Divider key={`${index}-divider`} />
              <DetailBlock key={`${index}-detail-block`} details={details} service={service} />
            </>
          ))}
        </>
      )}
      {isOpenQueryInfo && (
        <Modal isOpen={isOpenQueryInfo} title={'VQL ガイド (Heatmap View Query Language)'} onClose={() => setIsOpenQueryInfo(false)} closeOutside={true}>
          <Markdown remarkPlugins={[remarkGfm]}>{queryReadme}</Markdown>
        </Modal>
      )}
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

  &__queryTextFieldContainer {
    display: flex;
    width: 100%;
  }

  &__queryTextField {
    flex: 1;
    max-width: 90%;
    min-height: 92px;
    padding: 0;
    margin: 0;
    font-size: ${fontSizes.small};
  }
`;
