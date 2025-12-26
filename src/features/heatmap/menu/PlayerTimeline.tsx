import styled from '@emotion/styled';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BsInfoCircle } from 'react-icons/bs';
import { IoClose } from 'react-icons/io5';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { InputRow } from './InputRow';

import type { Theme } from '@emotion/react';
import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { PlayerTimelineDetail } from '@src/modeles/heatmapView';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC, CSSProperties } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { FlexRow, InlineFlexColumn, InlineFlexRow } from '@src/component/atoms/Flex';
import { Switch } from '@src/component/atoms/Switch';
import { Text } from '@src/component/atoms/Text';
import { Toggle } from '@src/component/atoms/Toggle';
import { Modal } from '@src/component/molecules/Modal';
import { TextArea } from '@src/component/molecules/TextArea';
import { useFieldObjectPatch } from '@src/hooks/useFieldObject';
import { useGetApi } from '@src/hooks/useGetApi';
import { usePlayerTimelinePatch, usePlayerTimelinePick } from '@src/hooks/usePlayerTimeline';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { useApiClient } from '@src/modeles/ApiClientContext';
import { DefaultStaleTime } from '@src/modeles/qeury';
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

const DetailBlockInternal: FC<{ className?: string; details: PlayerTimelineDetail[]; service: HeatmapDataService }> = ({ className, details }) => {
  const setData = usePlayerTimelinePatch();
  const { theme } = useSharedTheme();
  const apiClient = useApiClient();
  // const player = detail.player;
  const project_id = details[0].project_id;
  const session_id = details[0].session_id;
  const { data: session } = useQuery({
    queryKey: ['session', session_id, project_id, apiClient],
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
    enabled: !!session_id && !!project_id,
  });

  if (details.length === 0) return null;
  return (
    <InlineFlexColumn gap={4} className={className}>
      <Divider />
      <FlexRow className={`${className}__row`} wrap={'nowrap'} align={'center'}>
        <Text text={`Session: ${session_id}`} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
        <div style={{ flex: 1 }} />
        <Button
          fontSize={'base'}
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
          <Text text={`Player: ${detail.player}`} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
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
              <Text text={session.data.name} fontSize={theme.typography.fontSize.sm} />
            </InputRow>
            <InlineFlexRow wrap={'nowrap'} align={'center'} className={`${className}__row`} gap={4}>
              <Text text={'Start Time'} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.secondary} />
              <div className={`${className}__weight1`}>
                <Text text={toISOAboutStringWithTimezone(new Date(session.data.startTime))} fontSize={theme.typography.fontSize.sm} />
              </div>
              {session.data.endTime && (
                <div className={`${className}__weight1`}>
                  <Text text={toISOAboutStringWithTimezone(new Date(session.data.endTime))} fontSize={theme.typography.fontSize.sm} />
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

const PlayerTimelineComponent: FC<HeatmapMenuProps> = ({ className, service }) => {
  const { theme } = useSharedTheme();
  const setData = usePlayerTimelinePatch();
  const setFieldObjectData = useFieldObjectPatch();
  const { details, queryText: queryTextState, visible } = usePlayerTimelinePick('details', 'queryText', 'visible');
  const [queryText, setQueryText] = useState<string>('');
  const [isOpenQueryInfo, setIsOpenQueryInfo] = useState<boolean>(false);
  const [queryReadme, setQueryReadme] = useState<string>('');
  const selectSessionId = service.sessionId;

  const visibilityDisabled = useMemo(() => {
    return !service.projectId || !service.sessionId;
  }, [service.projectId, service.sessionId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // For static files, we use fetch directly with proper error handling
        const res = await fetch('/heatmap/vqueryREADME.md', { cache: 'no-store' });

        if (!res.ok) {
          // noinspection ExceptionCaughtLocallyJS
          throw new Error(`${res.status} ${res.statusText}`);
        }
        const text = await res.text();
        if (!cancelled) setQueryReadme(text);
      } catch (e) {
        if (!cancelled) {
          /* eslint-disable-next-line no-console */
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
    details?.forEach((detail) => {
      if (!map.has(detail.session_id)) {
        map.set(detail.session_id, []);
      }
      map.get(detail.session_id)?.push(detail);
    });
    return map;
  }, [details]);

  const getPlayers = useGetApi('/api/v0/projects/{project_id}/play_session/{session_id}/player_position_log/{session_id}/players', {
    staleTime: DefaultStaleTime,
  });

  const { data: players } = useQuery({
    queryKey: [selectSessionId, service.projectId],
    queryFn: async () => {
      if (!selectSessionId) return null;
      const project_id = service.projectId;
      if (!project_id) return null;
      const session_id = selectSessionId ? Number(selectSessionId) : 0;
      const { data } = await getPlayers.fetch([
        {
          params: {
            path: {
              project_id,
              session_id,
            },
          },
        },
      ]);
      return data;
    },
    staleTime: DefaultStaleTime,
    enabled: selectSessionId !== null && service.projectId !== undefined,
  });

  // Add players to details and enable visibility
  const enableWithPlayers = useCallback(() => {
    if (!players) return;
    const session_id = service.sessionId;
    const project_id = service.projectId;
    if (!session_id || !project_id) return;

    setData((prev) => {
      const newDetails: PlayerTimelineDetail[] = players
        .map((player) => {
          if (prev.details?.some((d) => d.player === player && d.session_id === session_id)) {
            return null;
          }
          return { player, project_id, session_id, visible: true };
        })
        .filter((s) => s !== null);
      return {
        ...prev,
        visible: true,
        details: [...(prev.details || []), ...newDetails],
      };
    });
    // playerTimelineがONの時、fieldObjectもデフォルトで表示
    setFieldObjectData({ visible: true });
  }, [players, service.projectId, service.sessionId, setData, setFieldObjectData]);

  const onVisibilityChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        enableWithPlayers();
      } else {
        setData({ visible: false });
      }
    },
    [enableWithPlayers, setData],
  );

  // Auto-enable visibility when players are loaded (only once per session)
  const initializedSessionRef = useRef<number | null>(null);
  useEffect(() => {
    if (players && players.length > 0 && service.sessionId && initializedSessionRef.current !== service.sessionId) {
      initializedSessionRef.current = service.sessionId;
      enableWithPlayers();
    }
  }, [service.sessionId, players, enableWithPlayers]);

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

  // load-queryText
  useEffect(() => {
    const t = queryTextState;
    if (t && t !== '') {
      setQueryText(t);
    }
  }, [queryTextState]);

  useEffect(() => {
    if (queryText === '') {
      return;
    }
    try {
      compileHVQL(queryText, {
        palette: { yellow: '#FFD400', blue: '#0057FF' },
        vars: {}, // 必要なら
      });
    } catch {
      /* */
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
      <InputRow label={'visibility'} align={'center'}>
        <Switch disabled={visibilityDisabled} checked={visible} onChange={onVisibilityChange} size={'small'} label={'visibility'} />
      </InputRow>
      {visibilityDisabled && <Text text={'please select project and session'} fontSize={theme.typography.fontSize.sm} />}
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
            <Button fontSize={'sm'} scheme={'primary'} onClick={onApplyQuery} disabled={queryDisable}>
              <Text text={'search'} />
            </Button>
          </Toggle>
          {Array.from(sessionByDetail.values()).map((details, index) => (
            <DetailBlock key={`${index}-detail-block`} details={details} service={service} />
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

export const PlayerTimeline = memo(
  styled(PlayerTimelineComponent)`
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
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
    }
  `,
  (prev, next) => {
    return prev.className == next.className && prev.service.projectId == next.service.projectId && prev.service.sessionId == next.service.sessionId;
  },
);
