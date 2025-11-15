import styled from '@emotion/styled';

import type { Session } from '@src/modeles/session';
import type { FC } from 'react';

import { FlexRow, FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { Tooltip } from '@src/component/atoms/Tooltip';
import { ClampText } from '@src/component/molecules/ClampText';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type SessionItemRowProps = {
  className?: string | undefined;
  session: Session;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const calculateDuration = (startTime: string, endTime: string | null) => {
  if (!endTime) return '進行中';
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);

  if (diffMinutes < 1) return '< 1分';
  if (diffMinutes < 60) return `${diffMinutes}分`;

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}時${minutes}分`;
};

const Component: FC<SessionItemRowProps> = ({ className, session }) => {
  const { theme } = useSharedTheme();

  return (
    <div className={className}>
      <FlexRow gap={16} align={'center'} style={{ width: '100%' }}>
        {/* Main Info */}
        <FlexColumn gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Tooltip tooltip={session.name}>
            <ClampText text={session.name} fontSize={theme.typography.fontSize.base} fontWeight={theme.typography.fontWeight.bold} lines={1} />
          </Tooltip>

          <FlexRow gap={12} align={'center'}>
            {session.deviceId && (
              <Tooltip tooltip={`Device: ${session.deviceId}`}>
                <Text text={`ID: ${session.deviceId}`} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.primary} fontWeight={theme.typography.fontWeight.light} />
              </Tooltip>
            )}

            {session.platform && (
              <Tooltip tooltip={`Platform: ${session.platform}`}>
                <Text text={session.platform} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} fontWeight={theme.typography.fontWeight.light} />
              </Tooltip>
            )}

            {session.appVersion && (
              <Tooltip tooltip={`App Version: ${session.appVersion}`}>
                <Text text={`v${session.appVersion}`} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} fontWeight={theme.typography.fontWeight.light} />
              </Tooltip>
            )}
          </FlexRow>
        </FlexColumn>

        {/* Meta Info - Right aligned */}
        <FlexColumn gap={4} align={'flex-end'} style={{ flexShrink: 0 }}>
          <Text text={formatDate(session.startTime)} fontSize={theme.typography.fontSize.xs} color={theme.colors.text.secondary} fontWeight={theme.typography.fontWeight.light} />
          <Text
            text={calculateDuration(session.startTime, session.endTime)}
            fontSize={theme.typography.fontSize.xs}
            color={session.isPlaying ? '#4caf50' : theme.colors.text.secondary}
            fontWeight={theme.typography.fontWeight.light}
          />
        </FlexColumn>
      </FlexRow>
    </div>
  );
};

export const SessionItemRow = styled(Component)`
  width: 100%;
  height: fit-content;
  padding: 12px 0;
  transition: all 0.2s ease;

  &:hover {
    padding-right: 8px;
    padding-left: 8px;
    margin-right: -8px;
    margin-left: -8px;
    background-color: ${({ theme }) => theme.colors.surface.sunken ?? 'rgba(255, 255, 255, 0.02)'};
    border-radius: 4px;
  }
`;
