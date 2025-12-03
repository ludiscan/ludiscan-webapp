import styled from '@emotion/styled';
import { memo } from 'react';
import { BiTime, BiDevices } from 'react-icons/bi';

import type { Session } from '@src/modeles/session';
import type { FC } from 'react';

import { FlexRow, FlexColumn } from '@src/component/atoms/Flex';
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
  if (!endTime) return 'In Progress';
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);

  if (diffMinutes < 1) return '< 1m';
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return `${hours}h ${minutes}m`;
};

const Component: FC<SessionItemRowProps> = memo(({ className, session }) => {
  const { theme } = useSharedTheme();
  const isPlaying = session.isPlaying;

  return (
    <div className={`${className} ${isPlaying ? 'playing' : ''}`}>
      <div className={`${className}__accent`} />
      <FlexRow gap={16} align={'center'} className={`${className}__row`}>
        {/* Status indicator */}
        <div className={`${className}__statusIndicator`}>{isPlaying && <span className={`${className}__pulsingDot`} />}</div>

        {/* Main Info */}
        <FlexColumn gap={6} className={`${className}__mainInfo`}>
          <FlexRow gap={8} align={'center'}>
            <Tooltip tooltip={session.name}>
              <ClampText
                text={session.name}
                fontSize={theme.typography.fontSize.base}
                fontWeight={theme.typography.fontWeight.semibold}
                lines={1}
                color={theme.colors.text.primary}
              />
            </Tooltip>
            {isPlaying && <span className={`${className}__liveBadge`}>LIVE</span>}
          </FlexRow>

          <FlexRow gap={12} align={'center'} className={`${className}__metaRow`}>
            {session.deviceId && (
              <Tooltip tooltip={`Device: ${session.deviceId}`}>
                <span className={`${className}__metaItem`}>
                  <BiDevices size={14} />
                  <span className={`${className}__metaValue`}>{session.deviceId}</span>
                </span>
              </Tooltip>
            )}

            {session.platform && (
              <Tooltip tooltip={`Platform: ${session.platform}`}>
                <span className={`${className}__platformBadge`}>{session.platform}</span>
              </Tooltip>
            )}

            {session.appVersion && (
              <Tooltip tooltip={`App Version: ${session.appVersion}`}>
                <span className={`${className}__versionBadge`}>v{session.appVersion}</span>
              </Tooltip>
            )}
          </FlexRow>
        </FlexColumn>

        {/* Time Info */}
        <FlexColumn gap={4} align={'flex-end'} className={`${className}__timeInfo`}>
          <span className={`${className}__timestamp`}>
            <BiTime size={14} />
            {formatDate(session.startTime)}
          </span>
          <span className={`${className}__duration ${isPlaying ? 'active' : ''}`}>{calculateDuration(session.startTime, session.endTime)}</span>
        </FlexColumn>
      </FlexRow>
    </div>
  );
});
Component.displayName = 'SessionItemRow';

export const SessionItemRow = styled(Component)`
  position: relative;
  width: 100%;
  height: fit-content;
  padding: 14px 16px;
  overflow: hidden;
  transition: all 0.2s ease;

  &__accent {
    position: absolute;
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
    background: ${({ theme }) => theme.colors.border.default};
    opacity: 0;
    transition: all 0.2s ease;
  }

  &:hover &__accent {
    background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary.main} 0%, ${({ theme }) => theme.colors.tertiary.main} 100%);
    opacity: 1;
  }

  &.playing &__accent {
    background: ${({ theme }) => theme.colors.semantic.success.main};
    opacity: 1;
  }

  &__row {
    position: relative;
    z-index: 1;
    width: 100%;
  }

  &__statusIndicator {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 8px;
    height: 8px;
  }

  &__pulsingDot {
    width: 8px;
    height: 8px;
    background: ${({ theme }) => theme.colors.semantic.success.main};
    border-radius: 50%;
    box-shadow: 0 0 8px ${({ theme }) => theme.colors.semantic.success.main};
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }

    50% {
      opacity: 0.6;
      transform: scale(1.2);
    }
  }

  &__mainInfo {
    flex: 1;
    min-width: 0;
  }

  &__liveBadge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
    color: ${({ theme }) => theme.colors.semantic.success.main};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    background: ${({ theme }) => theme.colors.semantic.success.main}15;
    border: 1px solid ${({ theme }) => theme.colors.semantic.success.main}40;
    border-radius: ${({ theme }) => theme.borders.radius.sm};
    animation: glow 2s ease-in-out infinite;
  }

  @keyframes glow {
    0%,
    100% {
      box-shadow: 0 0 4px ${({ theme }) => theme.colors.semantic.success.main}40;
    }

    50% {
      box-shadow: 0 0 8px ${({ theme }) => theme.colors.semantic.success.main}60;
    }
  }

  &__metaRow {
    flex-wrap: wrap;
  }

  &__metaItem {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.tertiary};

    svg {
      flex-shrink: 0;
    }
  }

  &__metaValue {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  &__platformBadge {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.tertiary.main};
    text-transform: uppercase;
    letter-spacing: ${({ theme }) => theme.typography.letterSpacing.wide};
    background: ${({ theme }) => theme.colors.tertiary.main}1a;
    border: 1px solid ${({ theme }) => theme.colors.tertiary.main}33;
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &__versionBadge {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
    color: ${({ theme }) => theme.colors.text.tertiary};
    background: ${({ theme }) => theme.colors.surface.sunken};
    border-radius: ${({ theme }) => theme.borders.radius.sm};
  }

  &__timeInfo {
    flex-shrink: 0;
  }

  &__timestamp {
    display: inline-flex;
    gap: 4px;
    align-items: center;
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.xs};
    color: ${({ theme }) => theme.colors.text.tertiary};

    svg {
      flex-shrink: 0;
    }
  }

  &__duration {
    font-family: ${({ theme }) => theme.typography.fontFamily.monospace};
    font-size: ${({ theme }) => theme.typography.fontSize.sm};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
    color: ${({ theme }) => theme.colors.text.secondary};

    &.active {
      color: ${({ theme }) => theme.colors.semantic.success.main};
    }
  }

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
  }

  &.playing {
    background: ${({ theme }) => theme.colors.semantic.success.main}05;
  }
`;
