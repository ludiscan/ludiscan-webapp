import { css, keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IoContract, IoExpand, IoCube, IoSquareOutline, IoRocket, IoEllipsisHorizontal, IoGameController, IoCheckmark } from 'react-icons/io5';

import type { FC, ReactNode, MouseEvent } from 'react';

import { zIndexes } from '@src/styles/style';

// =============================================================================
// Animation Keyframes
// =============================================================================

const fadeInScale = keyframes`
  from {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const fadeOutScale = keyframes`
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(8px) scale(0.96);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// =============================================================================
// Types
// =============================================================================

export type MenuItemConfig = {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
};

export type MenuSectionConfig = {
  id: string;
  title?: string;
  items: MenuItemConfig[];
  scrollable?: boolean;
  maxHeight?: number;
};

type QuickToolbarMenuProps = {
  sections: MenuSectionConfig[];
  className?: string;
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

const MenuContainer = styled.div<{ isOpen: boolean; isClosing: boolean }>`
  position: fixed;
  z-index: ${zIndexes.dropdown};
  min-width: 220px;
  max-width: 280px;
  padding: 6px;
  background: ${({ theme }) => theme.colors.surface.base};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 12px;
  box-shadow:
    0 4px 24px rgb(0 0 0 / 12%),
    0 1px 4px rgb(0 0 0 / 8%),
    inset 0 1px 0 rgb(255 255 255 / 4%);

  ${({ isOpen, isClosing }) =>
    isOpen &&
    !isClosing &&
    css`
      animation: ${fadeInScale} 0.2s cubic-bezier(0.32, 0.72, 0, 1) forwards;
    `}

  ${({ isClosing }) =>
    isClosing &&
    css`
      animation: ${fadeOutScale} 0.15s cubic-bezier(0.32, 0.72, 0, 1) forwards;
    `}

  /* Subtle inner glow */
  &::before {
    position: absolute;
    inset: 0;
    pointer-events: none;
    content: '';
    background: linear-gradient(180deg, rgb(255 255 255 / 3%) 0%, transparent 50%);
    border-radius: inherit;
  }
`;

const Section = styled.div<{ scrollable?: boolean; maxHeight?: number }>`
  &:not(:last-child) {
    padding-bottom: 4px;
    margin-bottom: 4px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  }

  ${({ scrollable, maxHeight }) =>
    scrollable &&
    css`
      max-height: ${maxHeight || 180}px;
      overflow-y: auto;
      overscroll-behavior: contain;

      /* Custom scrollbar */
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: transparent;
      }

      &::-webkit-scrollbar-thumb {
        background: rgb(128 128 128 / 30%);
        border-radius: 3px;

        &:hover {
          background: rgb(128 128 128 / 50%);
        }
      }
    `}
`;

const SectionTitle = styled.div`
  padding: 6px 10px 4px;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 10px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const MenuItem = styled.button<{
  index: number;
  isActive?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
}>`
  position: relative;
  display: flex;
  gap: 10px;
  align-items: center;
  width: 100%;
  padding: 8px 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 450;
  color: ${({ theme, isDisabled }) => (isDisabled ? theme.colors.text.disabled : theme.colors.text.primary)};
  text-align: left;
  cursor: ${({ isDisabled }) => (isDisabled ? 'not-allowed' : 'pointer')};
  outline: none;
  background: ${({ theme, isActive }) => (isActive ? theme.colors.primary.main : 'transparent')};
  border: none;
  border-radius: 8px;
  opacity: 0;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    transform 0.1s ease;
  animation: ${fadeInScale} 0.25s cubic-bezier(0.32, 0.72, 0, 1) forwards;
  animation-delay: ${({ index }) => 30 + index * 25}ms;

  ${({ isActive, theme }) =>
    isActive &&
    css`
      color: ${theme.colors.primary.contrast};

      .menu-icon {
        color: ${theme.colors.primary.contrast};
      }
    `}

  ${({ isLoading }) =>
    isLoading &&
    css`
      &::after {
        position: absolute;
        inset: 0;
        content: '';
        background: linear-gradient(90deg, transparent 0%, rgb(255 255 255 / 8%) 50%, transparent 100%);
        background-size: 200% 100%;
        border-radius: inherit;
        animation: ${shimmer} 1.5s infinite;
      }
    `}

  &:focus-visible {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main};
  }

  &:hover:not(:disabled) {
    background: ${({ theme, isActive }) => (isActive ? theme.colors.primary.dark : theme.colors.surface.raised)};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }
`;

const MenuIcon = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: color 0.15s ease;
`;

const MenuLabel = styled.span`
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MenuShortcut = styled.kbd`
  flex-shrink: 0;
  padding: 2px 5px;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 10px;
  color: ${({ theme }) => theme.colors.text.tertiary};
  background: ${({ theme }) => theme.colors.surface.raised};
  border-radius: 4px;
`;

const ActiveIndicator = styled.span`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.primary.contrast};
`;

const TriggerButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  outline: none;
  background: ${({ theme }) => theme.colors.surface.base};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 8px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    transform 0.1s ease,
    box-shadow 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.raised};
    border-color: ${({ theme }) => theme.colors.border.strong};
  }

  &:active {
    transform: scale(0.96);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.main};
  }
`;

// =============================================================================
// Component
// =============================================================================

const MenuContent: FC<QuickToolbarMenuProps & { onClose: () => void }> = ({ sections, onClose }) => {
  let globalIndex = 0;

  return (
    <>
      {sections.map((section) => (
        <Section key={section.id} scrollable={section.scrollable} maxHeight={section.maxHeight}>
          {section.title && <SectionTitle>{section.title}</SectionTitle>}
          {section.items.map((item) => {
            const currentIndex = globalIndex++;
            return (
              <MenuItem
                key={item.id}
                index={currentIndex}
                isActive={item.active}
                isDisabled={item.disabled}
                isLoading={item.loading}
                disabled={item.disabled || item.loading}
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  if (!item.disabled && !item.loading) {
                    item.onClick();
                    onClose();
                  }
                }}
              >
                {item.icon && <MenuIcon className='menu-icon'>{item.icon}</MenuIcon>}
                <MenuLabel>{item.label}</MenuLabel>
                {item.shortcut && <MenuShortcut>{item.shortcut}</MenuShortcut>}
                {item.active && (
                  <ActiveIndicator>
                    <IoCheckmark />
                  </ActiveIndicator>
                )}
              </MenuItem>
            );
          })}
        </Section>
      ))}
    </>
  );
};

export const QuickToolbarMenu = memo(function QuickToolbarMenu({ sections, className }: QuickToolbarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();

    // Position above the trigger, aligned to right edge
    let top = triggerRect.top - menuRect.height - 8;
    let left = triggerRect.right - menuRect.width;

    // Ensure menu stays within viewport
    const padding = 12;
    if (top < padding) {
      // If not enough space above, position below
      top = triggerRect.bottom + 8;
    }
    if (left < padding) {
      left = padding;
    }
    if (left + menuRect.width > window.innerWidth - padding) {
      left = window.innerWidth - menuRect.width - padding;
    }

    setMenuPosition({ top, left });
  }, []);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    setIsClosing(false);
  }, []);

  const closeMenu = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 150);
  }, []);

  const toggleMenu = useCallback(() => {
    if (isOpen && !isClosing) {
      closeMenu();
    } else if (!isOpen) {
      openMenu();
    }
  }, [isOpen, isClosing, openMenu, closeMenu]);

  // Update position when menu opens
  useEffect(() => {
    if (isOpen && !isClosing) {
      // Use requestAnimationFrame to ensure menu is rendered before measuring
      requestAnimationFrame(() => {
        updatePosition();
      });
    }
  }, [isOpen, isClosing, updatePosition]);

  // Handle scroll and resize
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

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeMenu]);

  return (
    <div className={className}>
      <TriggerButton
        ref={triggerRef}
        onClick={(e: MouseEvent) => {
          e.stopPropagation();
          toggleMenu();
        }}
        aria-expanded={isOpen}
        aria-haspopup='menu'
        aria-label='More options'
      >
        <IoEllipsisHorizontal />
      </TriggerButton>

      {isMounted &&
        isOpen &&
        createPortal(
          <>
            <Backdrop isVisible={!isClosing} onClick={closeMenu} />
            <MenuContainer
              ref={menuRef}
              isOpen={isOpen}
              isClosing={isClosing}
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
              }}
              onClick={(e: MouseEvent) => e.stopPropagation()}
            >
              <MenuContent sections={sections} onClose={closeMenu} />
            </MenuContainer>
          </>,
          document.body,
        )}
    </div>
  );
});

// =============================================================================
// Icon Exports for convenience
// =============================================================================

export const MenuIcons = {
  FitView: IoContract,
  OneToOne: IoExpand,
  View3D: IoCube,
  View2D: IoSquareOutline,
  RouteCoach: IoRocket,
  Session: IoGameController,
  Check: IoCheckmark,
};

QuickToolbarMenu.displayName = 'QuickToolbarMenu';
