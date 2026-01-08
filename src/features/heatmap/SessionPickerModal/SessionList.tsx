import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { memo, useCallback } from 'react';

import type { Session } from '@src/modeles/session';
import type { FC } from 'react';

import { Observer } from '@src/component/atoms/Observer';
import { SessionListItem } from '@src/features/heatmap/SessionPickerModal/SessionListItem';
import { useRovingTabIndex } from '@src/hooks/useRovingTabIndex';

export type SessionListProps = {
  className?: string;
  sessions: Session[];
  selectedSessionId: number | null;
  onSelectSession: (session: Session) => void;
  onLoadMore?: () => void;
  isFetchingMore?: boolean;
  hasMore?: boolean;
};

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  height: 100%;
  padding: 8px;
  overflow-y: auto;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.default};
    border-radius: 3px;

    &:hover {
      background: ${({ theme }) => theme.colors.border.strong};
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: center;
`;

const LoadingIndicator = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  padding: 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const LoadingDot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  background: currentcolor;
  border-radius: 50%;
  animation: ${pulse} 1s ease-in-out infinite;

  &:nth-of-type(2) {
    animation-delay: 0.2s;
  }

  &:nth-of-type(3) {
    animation-delay: 0.4s;
  }
`;

const Component: FC<SessionListProps> = ({ className, sessions, selectedSessionId, onSelectSession, onLoadMore, isFetchingMore = false, hasMore = false }) => {
  const handleSelect = useCallback(
    (index: number) => {
      const session = sessions[index];
      if (session) {
        onSelectSession(session);
      }
    },
    [sessions, onSelectSession],
  );

  const { containerRef, getItemProps, focusedIndex } = useRovingTabIndex<HTMLDivElement>({
    enabled: sessions.length > 0,
    orientation: 'vertical',
    loop: true,
    onSelect: handleSelect,
  });

  if (sessions.length === 0) {
    return (
      <ListContainer className={className}>
        <EmptyState>
          <span>No sessions available</span>
        </EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer
      ref={containerRef}
      className={className}
      role='listbox'
      aria-activedescendant={focusedIndex >= 0 ? `session-item-${sessions[focusedIndex]?.sessionId}` : undefined}
    >
      {sessions.map((session, index) => {
        const rovingProps = getItemProps(index);
        return (
          <SessionListItem
            key={session.sessionId}
            id={`session-item-${session.sessionId}`}
            session={session}
            isSelected={session.sessionId === selectedSessionId}
            onClick={() => onSelectSession(session)}
            tabIndex={rovingProps.tabIndex}
            onKeyDown={rovingProps.onKeyDown}
            onFocus={rovingProps.onFocus}
            data-roving-item
          />
        );
      })}
      {hasMore && onLoadMore && !isFetchingMore && <Observer callback={onLoadMore} />}
      {isFetchingMore && (
        <LoadingIndicator>
          <LoadingDot />
          <LoadingDot />
          <LoadingDot />
        </LoadingIndicator>
      )}
    </ListContainer>
  );
};

export const SessionList = memo(Component);

SessionList.displayName = 'SessionList';
