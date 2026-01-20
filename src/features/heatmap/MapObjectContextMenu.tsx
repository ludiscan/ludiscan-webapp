import styled from '@emotion/styled';
import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoMdEye, IoMdEyeOff } from 'react-icons/io';
import { MdOpacity } from 'react-icons/md';

import type { FC } from 'react';

import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { useSharedTheme } from '@src/hooks/useSharedTheme';

export type OpacityLevel = 0 | 0.5 | 1.0;

export type MapObjectContextMenuData = {
  uuid: string;
  name: string;
  visible: boolean;
  opacity: OpacityLevel;
  position: { x: number; y: number };
};

export type MapObjectContextMenuProps = {
  data: MapObjectContextMenuData | null;
  onClose: () => void;
  onToggleVisible: (uuid: string) => void;
  onSetOpacity: (uuid: string, opacity: OpacityLevel) => void;
};

const MenuContainer = styled.div`
  position: fixed;
  z-index: 10000;
  min-width: 180px;
  padding: 8px 0;
  background: ${({ theme }) => theme.colors.surface.raised};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const MenuHeader = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const MenuItemButton = styled.button<{ $active?: boolean }>`
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.text.primary};
  text-align: left;
  cursor: pointer;
  background: ${({ theme, $active }) => ($active ? theme.colors.surface.interactive : 'transparent')};
  border: none;
  transition: background-color 0.1s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
  }

  &:active {
    background: ${({ theme }) => theme.colors.surface.pressed};
  }
`;

const OpacityGroup = styled.div`
  display: flex;
  flex-direction: column;
  padding: 4px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
`;

const OpacityLabel = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 12px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.text.tertiary};
`;

const OpacityOptions = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px 12px;
`;

const OpacityButton = styled.button<{ $active?: boolean }>`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme, $active }) => ($active ? theme.colors.text.inverse : theme.colors.text.primary)};
  cursor: pointer;
  background: ${({ theme, $active }) => ($active ? theme.colors.primary.main : theme.colors.surface.sunken)};
  border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary.main : theme.colors.border.default)};
  border-radius: ${({ theme }) => theme.borders.radius.sm};
  transition: all 0.1s ease;

  &:hover {
    background: ${({ theme, $active }) => ($active ? theme.colors.primary.dark : theme.colors.surface.hover)};
    border-color: ${({ theme, $active }) => ($active ? theme.colors.primary.dark : theme.colors.border.strong)};
  }
`;

const Component: FC<MapObjectContextMenuProps> = ({ data, onClose, onToggleVisible, onSetOpacity }) => {
  const { theme } = useSharedTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!data) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Delay adding the listener to avoid immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [data, onClose]);

  // Adjust position to stay within viewport
  const getMenuStyle = useCallback(() => {
    if (!data) return {};

    const menuWidth = 180;
    const menuHeight = 200;
    const padding = 8;

    let x = data.position.x;
    let y = data.position.y;

    // Adjust for right edge
    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }

    // Adjust for bottom edge
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }

    // Adjust for left edge
    if (x < padding) {
      x = padding;
    }

    // Adjust for top edge
    if (y < padding) {
      y = padding;
    }

    return {
      left: x,
      top: y,
    };
  }, [data]);

  const handleToggleVisible = useCallback(() => {
    if (data) {
      onToggleVisible(data.uuid);
    }
  }, [data, onToggleVisible]);

  const handleSetOpacity = useCallback(
    (opacity: OpacityLevel) => {
      if (data) {
        onSetOpacity(data.uuid, opacity);
        onClose();
      }
    },
    [data, onSetOpacity, onClose],
  );

  if (!data) return null;

  return createPortal(
    <MenuContainer ref={menuRef} style={getMenuStyle()}>
      <MenuHeader>
        <Text text={data.name || 'Object'} fontSize={theme.typography.fontSize.sm} color={theme.colors.text.primary} fontWeight='bold' />
      </MenuHeader>

      <FlexColumn>
        <MenuItemButton onClick={handleToggleVisible} $active={data.visible}>
          {data.visible ? <IoMdEye size={16} /> : <IoMdEyeOff size={16} />}
          <span>{data.visible ? 'Hide' : 'Show'}</span>
        </MenuItemButton>
      </FlexColumn>

      <OpacityGroup>
        <OpacityLabel>
          <MdOpacity size={14} />
          <span>Opacity</span>
        </OpacityLabel>
        <OpacityOptions>
          <OpacityButton $active={data.opacity === 0} onClick={() => handleSetOpacity(0)} disabled={!data.visible}>
            0%
          </OpacityButton>
          <OpacityButton $active={data.opacity === 0.5} onClick={() => handleSetOpacity(0.5)} disabled={!data.visible}>
            50%
          </OpacityButton>
          <OpacityButton $active={data.opacity === 1} onClick={() => handleSetOpacity(1)} disabled={!data.visible}>
            100%
          </OpacityButton>
        </OpacityOptions>
      </OpacityGroup>
    </MenuContainer>,
    document.body,
  );
};

export const MapObjectContextMenu = Component;
