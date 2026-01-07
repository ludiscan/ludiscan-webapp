import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { memo } from 'react';
import { IoCheckmark, IoGameController } from 'react-icons/io5';

import type { Session } from '@src/modeles/session';
import type { FC, KeyboardEventHandler } from 'react';

export type SessionListItemProps = {
  className?: string;
  id?: string;
  session: Session;
  isSelected: boolean;
  onClick: () => void;
  // Roving tabindex props
  tabIndex?: number;
  onKeyDown?: KeyboardEventHandler<HTMLButtonElement>;
  onFocus?: () => void;
  'data-roving-item'?: boolean;
};

const ItemContainer = styled.button<{ isSelected: boolean }>`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  text-align: left;
  cursor: pointer;
  outline: none;
  background: ${({ theme, isSelected }) => (isSelected ? theme.colors.primary.main : 'transparent')};
  border: none;
  border-radius: 8px;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme, isSelected }) => (isSelected ? theme.colors.primary.dark : theme.colors.surface.raised)};
  }

  &:focus-visible {
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.colors.primary.main};
  }
`;

const IconContainer = styled.span<{ isSelected: boolean }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: ${({ theme, isSelected }) => (isSelected ? theme.colors.primary.contrast : theme.colors.text.secondary)};
  opacity: ${({ isSelected }) => (isSelected ? 1 : 0.7)};
`;

const ContentContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
`;

const SessionName = styled.span<{ isSelected: boolean }>`
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 13px;
  font-weight: ${({ isSelected }) => (isSelected ? 600 : 500)};
  color: ${({ theme, isSelected }) => (isSelected ? theme.colors.primary.contrast : theme.colors.text.primary)};
  white-space: nowrap;
`;

const MetaRow = styled.div<{ isSelected: boolean }>`
  display: flex;
  gap: 8px;
  align-items: center;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 11px;
  color: ${({ theme, isSelected }) => (isSelected ? theme.colors.primary.contrast : theme.colors.text.tertiary)};

  ${({ isSelected }) =>
    isSelected &&
    css`
      opacity: 0.85;
    `}
`;

const SessionIdBadge = styled.span`
  font-weight: 500;
  letter-spacing: 0.02em;
`;

const PlatformBadge = styled.span`
  padding: 1px 6px;
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: ${({ theme }) => theme.colors.surface.base};
  border-radius: 4px;
`;

const CheckIcon = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  font-size: 14px;
`;

const Component: FC<SessionListItemProps> = ({
  className,
  id,
  session,
  isSelected,
  onClick,
  tabIndex,
  onKeyDown,
  onFocus,
  'data-roving-item': dataRovingItem,
}) => {
  const displayName = session.name || `Session #${session.sessionId}`;
  const platform = session.platform || 'Unknown';

  return (
    <ItemContainer
      id={id}
      className={className}
      isSelected={isSelected}
      onClick={onClick}
      role='option'
      aria-selected={isSelected}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      data-roving-item={dataRovingItem}
    >
      <IconContainer isSelected={isSelected}>
        <IoGameController />
      </IconContainer>
      <ContentContainer>
        <SessionName isSelected={isSelected}>{displayName}</SessionName>
        <MetaRow isSelected={isSelected}>
          <SessionIdBadge>#{session.sessionId}</SessionIdBadge>
          <PlatformBadge>{platform}</PlatformBadge>
        </MetaRow>
      </ContentContainer>
      {isSelected && (
        <CheckIcon>
          <IoCheckmark />
        </CheckIcon>
      )}
    </ItemContainer>
  );
};

export const SessionListItem = memo(Component);

SessionListItem.displayName = 'SessionListItem';
