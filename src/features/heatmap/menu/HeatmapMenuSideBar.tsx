import styled from '@emotion/styled';
import { memo } from 'react';

import type { MenuKey } from '@src/hooks/useHeatmapSideBarMenus';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Tooltip } from '@src/component/atoms/Tooltip';
import { useHeatmapSideBarMenus } from '@src/hooks/useHeatmapSideBarMenus';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

export type MenuSideBarProps = {
  className?: string;
  currentMenu?: MenuKey;
  service: HeatmapDataService;
};

const Component: FC<MenuSideBarProps> = ({ className, currentMenu }) => {
  const { theme } = useSharedTheme();
  const menus = useHeatmapSideBarMenus();
  return (
    <FlexColumn className={className} gap={12} wrap={'nowrap'}>
      {menus.map(({ id, displayName, icon }) => (
        <Button
          className={`${className}__button ${id === currentMenu ? 'active' : ''}`}
          key={id}
          scheme={'none'}
          onClick={() => {
            heatMapEventBus.emit('click-menu-icon', { name: id });
          }}
          fontSize={'xl'}
          radius={'small'}
        >
          <Tooltip tooltip={displayName} placement={'bottom'} fontSize={theme.typography.fontSize.sm}>
            {icon}
          </Tooltip>
        </Button>
      ))}
    </FlexColumn>
  );
};

export const HeatmapMenuSideBar = memo(
  styled(Component)`
    /* Use logical properties (Design Implementation Guide Rule 4) */
    inline-size: 60px; /* Increased from 38px to accommodate 44px touch target + padding */
    block-size: 100%;
    padding-block: var(--spacing-sm);
    padding-inline: var(--spacing-sm);
    background: ${({ theme }) => theme.colors.surface.base};
    border-inline-end: ${({ theme }) => `1px solid ${theme.colors.border.default}`};

    &__button {
      align-items: center;
      justify-content: center;
      inline-size: 100%;
      block-size: 44px; /* Match touch target height */
      transition: background 0.2s;

      &:hover {
        background: ${({ theme }) => theme.colors.surface.hover};
      }

      &.active {
        color: ${({ theme }) => theme.colors.primary.contrast};
        background: ${({ theme }) => theme.colors.primary.light};
      }
    }
  `,
  (prev, next) => {
    return prev.className == next.className && prev.currentMenu === next.currentMenu;
  },
);
