import styled from '@emotion/styled';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { Menus } from '@src/hooks/useHeatmapSideBarMenus';
import type { FC, ReactElement } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { MenuContents } from '@src/hooks/useHeatmapSideBarMenus';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { fontSizes, fontWeights } from '@src/styles/style';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

type MenuItemProps = {
  name: string;
  icon: ReactElement;
  onClick: () => void;
};

const MenuItemComponent: FC<MenuItemProps & { className?: string }> = ({ className, name, icon, onClick }) => {
  const { theme } = useSharedTheme();
  return (
    <Button className={className} onClick={onClick} scheme={'none'} fontSize={'base'}>
      <FlexColumn align={'center'} gap={4}>
        <div className={`${className}__icon`}>{icon}</div>
        <Text text={name} fontSize={theme.typography.fontSize.sm} fontWeight={theme.typography.fontWeight.light} />
      </FlexColumn>
    </Button>
  );
};

const MenuItem = styled(MenuItemComponent)`
  min-width: 80px;
  padding: 16px;
  border-radius: 8px;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.colors.surface.hover};
    transform: translateY(-2px);
  }

  &__icon {
    font-size: 24px;
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  width: 100%;
  padding: 8px 0;
`;

export const MoreMenuContent: FC<HeatmapMenuProps> = ({ dimensionality }) => {
  // Filter out menus that shouldn't appear in the grid (more itself, eventLogDetail)
  // In 2D mode, also filter out 'map' menu as it's only for 3D
  const availableMenus = MenuContents.filter((menu) => {
    if (!menu.icon) return false;
    if (menu.name === 'more' || menu.name === 'eventLogDetail') return false;
    // 2Dモードではmapメニューを非表示
    if (dimensionality === '2d' && menu.name === 'map') return false;
    return true;
  });

  const handleMenuClick = (menuName: Menus) => {
    heatMapEventBus.emit('click-menu-icon', { name: menuName });
  };

  return (
    <FlexColumn gap={16} align={'flex-start'} style={{ width: '100%' }}>
      <Text text={'All Features'} fontSize={fontSizes.large1} fontWeight={fontWeights.bold} />
      <GridContainer>
        {availableMenus.map((menu) => (
          <MenuItem key={menu.name} name={menu.name} icon={menu.icon!} onClick={() => handleMenuClick(menu.name)} />
        ))}
      </GridContainer>
    </FlexColumn>
  );
};
