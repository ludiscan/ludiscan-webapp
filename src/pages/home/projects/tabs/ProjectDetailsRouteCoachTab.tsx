import styled from '@emotion/styled';
import { useEffect, useState } from 'react';

import type { components } from '@generated/api';
import type { Project } from '@src/modeles/project';
import type { FC } from 'react';

import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { EventClusterViewer } from '@src/component/organisms/EventClusterViewer';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { createClient } from '@src/modeles/qeury';
import { fontSizes, fontWeights } from '@src/styles/style';

type Session = components['schemas']['PlaySessionResponseDto'];

interface SelectProps {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
}

const SelectComponent: FC<SelectProps> = ({ value, onChange, children }) => {
  return (
    <select value={value} onChange={onChange}>
      {children}
    </select>
  );
};

const StyledSelect = styled(SelectComponent)`
  padding: 8px 12px;
  font-size: ${fontSizes.medium};
  color: ${({ theme }) => (theme as { colors: { text: string } }).colors.text};
  cursor: pointer;
  background-color: ${({ theme }) => (theme as { colors: { background: string } }).colors.background};
  border: 1px solid ${({ theme }) => (theme as { colors: { border: { main: string } } }).colors.border.main};
  border-radius: 4px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => (theme as { colors: { primary: { main: string } } }).colors.primary.main};
  }
`;

export type ProjectDetailsRouteCoachTabProps = {
  project: Project;
  className?: string;
};

const Component: FC<ProjectDetailsRouteCoachTabProps> = ({ project, className }) => {
  const { theme } = useSharedTheme();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [players, setPlayers] = useState<number[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);

  // セッション一覧を取得
  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoadingSessions(true);
      try {
        const { data, error } = await createClient().GET('/api/v0/projects/{project_id}/play_session', {
          params: {
            path: { project_id: project.id },
            query: { limit: 100, offset: 0 },
          },
        });

        if (!error && data) {
          setSessions(data);
          if (data.length > 0) {
            setSelectedSessionId(data[0].sessionId);
          }
        }
      } catch {
        // Silent error handling
      } finally {
        setIsLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [project.id]);

  // 選択されたセッションのプレイヤー一覧を取得
  useEffect(() => {
    if (!selectedSessionId) return;

    const fetchPlayers = async () => {
      setIsLoadingPlayers(true);
      try {
        const { data, error } = await createClient().GET('/api/v0/projects/{project_id}/play_session/{session_id}/player_position_log/{session_id}/players', {
          params: {
            path: {
              project_id: project.id,
              session_id: selectedSessionId,
            },
          },
        });

        if (!error && data) {
          setPlayers(data);
          if (data.length > 0) {
            setSelectedPlayerId(data[0]);
          }
        }
      } catch {
        // Silent error handling
      } finally {
        setIsLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, [project.id, selectedSessionId]);

  if (isLoadingSessions) {
    return (
      <div className={className}>
        <Text text='Loading sessions...' fontSize={fontSizes.medium} color={theme.colors.text} />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className={className}>
        <Text text='No sessions found for this project.' fontSize={fontSizes.medium} color={theme.colors.secondary.main} />
      </div>
    );
  }

  return (
    <FlexColumn gap={16} className={className}>
      {/* セッション選択 */}
      <FlexColumn gap={8}>
        <Text text='Select Session' fontSize={fontSizes.medium} fontWeight={fontWeights.bold} color={theme.colors.text} />
        <StyledSelect value={selectedSessionId || ''} onChange={(e) => setSelectedSessionId(Number(e.target.value))}>
          {sessions.map((session) => (
            <option key={session.sessionId} value={session.sessionId}>
              Session #{session.sessionId} - {session.name || 'Unnamed'}
            </option>
          ))}
        </StyledSelect>
      </FlexColumn>

      {/* プレイヤー選択 */}
      {isLoadingPlayers ? (
        <Text text='Loading players...' fontSize={fontSizes.small} color={theme.colors.text} />
      ) : players.length === 0 ? (
        <Text text='No players found in this session.' fontSize={fontSizes.small} color={theme.colors.secondary.main} />
      ) : (
        <FlexColumn gap={8}>
          <Text text='Select Player' fontSize={fontSizes.medium} fontWeight={fontWeights.bold} color={theme.colors.text} />
          <StyledSelect value={selectedPlayerId || ''} onChange={(e) => setSelectedPlayerId(Number(e.target.value))}>
            {players.map((playerId) => (
              <option key={playerId} value={playerId}>
                Player #{playerId}
              </option>
            ))}
          </StyledSelect>
        </FlexColumn>
      )}

      {/* イベントクラスター表示 */}
      {selectedPlayerId !== null && (
        <FlexColumn gap={16}>
          <Text text='Improvement Routes' fontSize={fontSizes.large1} fontWeight={fontWeights.bold} color={theme.colors.text} />
          <EventClusterViewer projectId={project.id} playerId={String(selectedPlayerId)} />
        </FlexColumn>
      )}
    </FlexColumn>
  );
};

export const ProjectDetailsRouteCoachTab = styled(Component)`
  padding: 16px;
`;
