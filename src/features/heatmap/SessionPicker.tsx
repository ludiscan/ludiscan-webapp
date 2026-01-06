import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { memo } from 'react';
import { IoGameController } from 'react-icons/io5';

import type { Session } from '@src/modeles/session';
import type { FC, MouseEvent } from 'react';

// =============================================================================
// Animation Keyframes
// =============================================================================

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

// =============================================================================
// Types
// =============================================================================

export type SessionPickerProps = {
  className?: string;
  currentSession: Session | null;
  onOpenModal: () => void;
  isLoading?: boolean;
};

// =============================================================================
// Styled Components
// =============================================================================

const PickerContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

const TriggerPill = styled.button<{ hasSession: boolean }>`
  display: inline-flex;
  gap: 6px;
  align-items: center;
  height: 32px;
  padding: 0 12px 0 10px;
  font-family: 'JetBrains Mono', 'SF Mono', 'Fira Code', ui-monospace, monospace;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme, hasSession }) => (hasSession ? theme.colors.primary.contrast : theme.colors.text.secondary)};
  cursor: pointer;
  outline: none;
  background: ${({ theme, hasSession }) => (hasSession ? theme.colors.primary.main : theme.colors.surface.base)};
  border: 1px solid ${({ theme, hasSession }) => (hasSession ? theme.colors.primary.dark : theme.colors.border.default)};
  border-radius: 16px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${({ theme, hasSession }) => (hasSession ? theme.colors.primary.dark : theme.colors.surface.raised)};
    border-color: ${({ theme, hasSession }) => (hasSession ? theme.colors.primary.main : theme.colors.border.strong)};
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main}40;
  }
`;

const SessionIcon = styled.span<{ hasSession: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: ${({ theme, hasSession }) => (hasSession ? theme.colors.primary.contrast : theme.colors.text.secondary)};
  opacity: 0.9;
`;

const SessionLabel = styled.span`
  display: flex;
  gap: 2px;
  align-items: center;
  letter-spacing: 0.02em;
`;

const SessionId = styled.span`
  font-weight: 600;
  letter-spacing: 0.04em;
`;

const LoadingIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background: currentcolor;
  border-radius: 50%;
  animation: ${pulse} 1s ease-in-out infinite;
`;

const PlatformBadge = styled.span<{ hasSession: boolean }>`
  padding: 2px 6px;
  font-size: 9px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: ${({ theme, hasSession }) => (hasSession ? 'rgb(255 255 255 / 20%)' : theme.colors.surface.raised)};
  border-radius: 4px;

  ${({ hasSession }) =>
    !hasSession &&
    css`
      color: inherit;
    `}
`;

// =============================================================================
// Component
// =============================================================================

const Component: FC<SessionPickerProps> = ({ className, currentSession, onOpenModal, isLoading = false }) => {
  const hasSession = currentSession !== null;

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onOpenModal();
  };

  return (
    <PickerContainer className={className}>
      <TriggerPill onClick={handleClick} hasSession={hasSession} aria-label='Select session'>
        <SessionIcon hasSession={hasSession}>
          <IoGameController />
        </SessionIcon>
        <SessionLabel>
          {isLoading ? (
            <LoadingIndicator />
          ) : hasSession ? (
            <>
              <SessionId>#{currentSession.sessionId}</SessionId>
              {currentSession.platform && <PlatformBadge hasSession={hasSession}>{currentSession.platform}</PlatformBadge>}
            </>
          ) : (
            <span>No Session</span>
          )}
        </SessionLabel>
      </TriggerPill>
    </PickerContainer>
  );
};

export const SessionPicker = memo(Component);

SessionPicker.displayName = 'SessionPicker';
