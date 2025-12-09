import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoGameController, IoChevronDown, IoCheckmark } from 'react-icons/io5';

import type { FC, MouseEvent } from 'react';

import { zIndexes } from '@src/styles/style';

// =============================================================================
// Animation Keyframes
// =============================================================================

const fadeInSlide = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeOutSlide = keyframes`
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-4px);
  }
`;

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
  sessionIds: string[];
  currentSessionId: number | null;
  onSelectSession: (sessionId: number) => void;
  isLoading?: boolean;
};

// =============================================================================
// Styled Components
// =============================================================================

const Backdrop = styled.div<{ isVisible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: ${zIndexes.dropdown - 1};
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
`;

const PickerContainer = styled.div`
  position: relative;
  display: inline-flex;
`;

const TriggerPill = styled.button<{ isOpen: boolean; hasSession: boolean }>`
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

  ${({ isOpen }) =>
    isOpen &&
    css`
      box-shadow: 0 0 0 2px var(--theme-colors-primary-main, #0070f3) 40;
    `}
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

const ChevronIcon = styled.span<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  font-size: 10px;
  transition: transform 0.2s ease;

  ${({ isOpen }) =>
    isOpen &&
    css`
      transform: rotate(180deg);
    `}
`;

const LoadingIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  background: currentcolor;
  border-radius: 50%;
  animation: ${pulse} 1s ease-in-out infinite;
`;

const DropdownContainer = styled.div<{ isOpen: boolean; isClosing: boolean }>`
  position: fixed;
  z-index: ${zIndexes.dropdown};
  min-width: 160px;
  max-width: 200px;
  padding: 4px;
  background: ${({ theme }) => theme.colors.surface.base};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 12px;
  box-shadow:
    0 8px 32px rgb(0 0 0 / 12%),
    0 2px 8px rgb(0 0 0 / 8%);

  ${({ isOpen, isClosing }) =>
    isOpen &&
    !isClosing &&
    css`
      animation: ${fadeInSlide} 0.15s cubic-bezier(0.32, 0.72, 0, 1) forwards;
    `}

  ${({ isClosing }) =>
    isClosing &&
    css`
      animation: ${fadeOutSlide} 0.12s cubic-bezier(0.32, 0.72, 0, 1) forwards;
    `}
`;

const DropdownHeader = styled.div`
  padding: 6px 10px 4px;
  font-family: 'SF Mono', 'JetBrains Mono', monospace;
  font-size: 9px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.1em;
`;

const DropdownList = styled.div`
  max-height: 200px;
  overflow-y: auto;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.default};
    border-radius: 2px;

    &:hover {
      background: ${({ theme }) => theme.colors.border.strong};
    }
  }
`;

const SessionItem = styled.button<{ isActive: boolean; index: number }>`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 8px 10px;
  font-family: 'JetBrains Mono', 'SF Mono', monospace;
  font-size: 12px;
  font-weight: ${({ isActive }) => (isActive ? 600 : 450)};
  color: ${({ theme, isActive }) => (isActive ? theme.colors.primary.contrast : theme.colors.text.primary)};
  text-align: left;
  cursor: pointer;
  outline: none;
  background: ${({ theme, isActive }) => (isActive ? theme.colors.primary.main : 'transparent')};
  border: none;
  border-radius: 8px;
  opacity: 0;
  transition: all 0.15s ease;
  animation: ${fadeInSlide} 0.2s cubic-bezier(0.32, 0.72, 0, 1) forwards;
  animation-delay: ${({ index }) => 20 + index * 15}ms;

  &:focus-visible {
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.colors.primary.main};
  }

  &:hover:not(:disabled) {
    background: ${({ theme, isActive }) => (isActive ? theme.colors.primary.dark : theme.colors.surface.raised)};
  }
`;

const SessionItemIcon = styled.span<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: ${({ theme, isActive }) => (isActive ? theme.colors.primary.contrast : theme.colors.text.secondary)};
  opacity: ${({ isActive }) => (isActive ? 1 : 0.6)};
`;

const SessionItemLabel = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ActiveCheck = styled.span`
  display: flex;
  align-items: center;
  font-size: 12px;
`;

const EmptyState = styled.div`
  padding: 16px 10px;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  text-align: center;
`;

// =============================================================================
// Component
// =============================================================================

const Component: FC<SessionPickerProps> = ({ className, sessionIds, currentSessionId, onSelectSession, isLoading = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !dropdownRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();

    let top = triggerRect.bottom + 6;
    let left = triggerRect.left;

    const padding = 12;
    if (top + dropdownRect.height > window.innerHeight - padding) {
      top = triggerRect.top - dropdownRect.height - 6;
    }
    if (left + dropdownRect.width > window.innerWidth - padding) {
      left = window.innerWidth - dropdownRect.width - padding;
    }
    if (left < padding) {
      left = padding;
    }

    setDropdownPosition({ top, left });
  }, []);

  const openDropdown = useCallback(() => {
    setIsOpen(true);
    setIsClosing(false);
  }, []);

  const closeDropdown = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 120);
  }, []);

  const toggleDropdown = useCallback(() => {
    if (isOpen && !isClosing) {
      closeDropdown();
    } else if (!isOpen) {
      openDropdown();
    }
  }, [isOpen, isClosing, openDropdown, closeDropdown]);

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      onSelectSession(Number(sessionId));
      closeDropdown();
    },
    [onSelectSession, closeDropdown],
  );

  useEffect(() => {
    if (isOpen && !isClosing) {
      requestAnimationFrame(() => {
        updatePosition();
      });
    }
  }, [isOpen, isClosing, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleUpdate = () => updatePosition();
    window.addEventListener('scroll', handleUpdate, { passive: true });
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeDropdown]);

  const hasSession = currentSessionId !== null;

  return (
    <PickerContainer className={className}>
      <TriggerPill
        ref={triggerRef}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          toggleDropdown();
        }}
        isOpen={isOpen}
        hasSession={hasSession}
        aria-expanded={isOpen}
        aria-haspopup='listbox'
        aria-label='Select session'
      >
        <SessionIcon hasSession={hasSession}>
          <IoGameController />
        </SessionIcon>
        <SessionLabel>
          {isLoading ? (
            <LoadingIndicator />
          ) : hasSession ? (
            <>
              <span>Session</span>
              <SessionId>#{currentSessionId}</SessionId>
            </>
          ) : (
            <span>No Session</span>
          )}
        </SessionLabel>
        <ChevronIcon isOpen={isOpen}>
          <IoChevronDown />
        </ChevronIcon>
      </TriggerPill>

      {isMounted &&
        isOpen &&
        createPortal(
          <>
            <Backdrop isVisible={!isClosing} onClick={closeDropdown} />
            <DropdownContainer
              ref={dropdownRef}
              isOpen={isOpen}
              isClosing={isClosing}
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
              }}
              onClick={(e: MouseEvent) => e.stopPropagation()}
            >
              <DropdownHeader>Sessions ({sessionIds.length})</DropdownHeader>
              <DropdownList role='listbox'>
                {sessionIds.length === 0 ? (
                  <EmptyState>No sessions available</EmptyState>
                ) : (
                  sessionIds.map((id, index) => {
                    const isActive = String(currentSessionId) === id;
                    return (
                      <SessionItem key={id} index={index} isActive={isActive} onClick={() => handleSelectSession(id)} role='option' aria-selected={isActive}>
                        <SessionItemIcon isActive={isActive}>
                          <IoGameController />
                        </SessionItemIcon>
                        <SessionItemLabel>Session #{id}</SessionItemLabel>
                        {isActive && (
                          <ActiveCheck>
                            <IoCheckmark />
                          </ActiveCheck>
                        )}
                      </SessionItem>
                    );
                  })
                )}
              </DropdownList>
            </DropdownContainer>
          </>,
          document.body,
        )}
    </PickerContainer>
  );
};

export const SessionPicker = memo(Component);

SessionPicker.displayName = 'SessionPicker';
