import styled from '@emotion/styled';

import type { Menus } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Divider } from '@src/component/atoms/Divider';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Tooltip } from '@src/component/atoms/Tooltip';
import { SideBarMenus } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';
import { fontSizes } from '@src/styles/style';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

export type MenuSideBarProps = {
  className?: string;
  currentMenu?: Menus;
  service: HeatmapDataService;
};

const Component: FC<MenuSideBarProps> = ({ className, currentMenu }) => {
  return (
    <FlexColumn className={className} gap={12}>
      <Divider orientation={'horizontal'} />
      {SideBarMenus.map(({ name, icon }) => (
        <Button
          className={`${className}__button ${name === currentMenu ? 'active' : ''}`}
          key={name}
          scheme={'none'}
          onClick={() => {
            heatMapEventBus.emit('click-menu-icon', { name });
          }}
          fontSize={'large2'}
          radius={'small'}
        >
          <Tooltip tooltip={name} placement={'bottom'} fontSize={fontSizes.small}>
            {icon}
          </Tooltip>
        </Button>
      ))}
    </FlexColumn>
  );
};

export const HeatmapMenuSideBar = styled(Component)`
  width: 38px;
  height: 100%;
  padding: 8px;
  background: ${({ theme }) => theme.colors.surface.main};
  border-right: ${({ theme }) => `1px solid ${theme.colors.border.main}`};

  &__button {
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 38px;
    transition: background 0.2s;

    &:hover {
      background: ${({ theme }) => theme.colors.surface.dark};
    }

    &.active {
      color: ${({ theme }) => theme.colors.surface.light};
      background: ${({ theme }) => theme.colors.primary.main};
    }
  }
`;
