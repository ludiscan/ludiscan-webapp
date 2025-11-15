import styled from '@emotion/styled';
import { memo } from 'react';

import type { Menus } from '@src/hooks/useHeatmapSideBarMenus';
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
  currentMenu?: Menus;
  service: HeatmapDataService;
};

const Component: FC<MenuSideBarProps> = ({ className, currentMenu }) => {
  const { theme } = useSharedTheme();
  const menus = useHeatmapSideBarMenus();
  return (
    <FlexColumn className={className} gap={12} wrap={'nowrap'}>
      {menus.map(({ name, icon }) => (
        <Button
          className={`${className}__button ${name === currentMenu ? 'active' : ''}`}
          key={name}
          scheme={'none'}
          onClick={() => {
            heatMapEventBus.emit('click-menu-icon', { name });
          }}
          fontSize={'xl'}
          radius={'small'}
        >
          <Tooltip tooltip={name} placement={'bottom'} fontSize={theme.typography.fontSize.sm}>
            {icon}
          </Tooltip>
        </Button>
      ))}
    </FlexColumn>
  );
};

export const HeatmapMenuSideBar = memo(
  styled(Component)`
    width: 38px;
    height: 100%;
    padding: 8px;
    background: ${({ theme }) => theme.colors.surface.base};
    border-right: ${({ theme }) => `1px solid ${theme.colors.border.default}`};

    &__button {
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 38px;
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
