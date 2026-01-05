import styled from '@emotion/styled';

import type { MenuKey } from '@src/hooks/useHeatmapSideBarMenus';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexRow } from '@src/component/atoms/Flex';
import { Tooltip } from '@src/component/atoms/Tooltip';
import { useHeatmapSideBarMenus } from '@src/hooks/useHeatmapSideBarMenus';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { hexToRGBA } from '@src/styles/style';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

export type HeatmapMenuListRowProps = {
  className?: string;
  currentMenu?: MenuKey;
};

const HeatmapMenuListRowComponent: FC<HeatmapMenuListRowProps> = ({ className, currentMenu }) => {
  const menus = useHeatmapSideBarMenus();
  const { theme } = useSharedTheme();

  return (
    <FlexRow className={`${className}`} gap={12} wrap={'nowrap'} align={'center'}>
      {menus.map(({ id, displayName, icon }) => (
        <Button
          className={`${className}__menuButton ${id === currentMenu ? 'active' : ''}`}
          key={id}
          scheme={'none'}
          onClick={() => {
            heatMapEventBus.emit('click-menu-icon', { name: id });
          }}
          fontSize={'lg'}
          radius={'small'}
        >
          <Tooltip tooltip={displayName} placement={'bottom'} fontSize={theme.typography.fontSize.sm}>
            {icon}
          </Tooltip>
        </Button>
      ))}
    </FlexRow>
  );
};

export const HeatmapMenuListRow = styled(HeatmapMenuListRowComponent)`
  flex-shrink: 0;
  min-height: 36px;
  padding: 0 var(--spacing-md);
  background: ${({ theme }) => hexToRGBA(theme.colors.surface.base, 0.9)};
  border-radius: var(--border-radius-full);

  &__menuButton {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    transition: background 0.2s;

    &:hover {
      background: ${({ theme }) => theme.colors.surface.hover};
    }

    &.active {
      color: ${({ theme }) => theme.colors.primary.contrast} !important;
      background: ${({ theme }) => theme.colors.primary.light} !important;
    }
  }
`;
