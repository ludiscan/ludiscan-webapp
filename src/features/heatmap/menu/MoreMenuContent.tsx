import styled from '@emotion/styled';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { MenuKey } from '@src/hooks/useHeatmapSideBarMenus';
import type { FC, ReactElement } from 'react';

import { Button } from '@src/component/atoms/Button';
import { FlexColumn } from '@src/component/atoms/Flex';
import { Text } from '@src/component/atoms/Text';
import { getMenuDisplayName, MenuContents } from '@src/hooks/useHeatmapSideBarMenus';
import { useLocale } from '@src/hooks/useLocale';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
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
        <Text text={name} fontSize={theme.typography.fontSize.xs} fontWeight={theme.typography.fontWeight.medium} />
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
    width: 24px;
    height: 24px;
    color: ${({ theme }) => theme.colors.text.primary};

    svg {
      width: 100%;
      height: 100%;
      fill: currentcolor;
    }

    img {
      width: 100%;
      height: 100%;
      color: ${({ theme }) => theme.colors.text.primary} !important;
      object-fit: contain;
    }
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  width: 100%;
  padding: 8px 0;
`;

export const MoreMenuContent: FC<HeatmapMenuProps> = () => {
  const { theme } = useSharedTheme();
  const { t } = useLocale();

  // Filter out menus that shouldn't appear in the grid (more itself, eventLogDetail)
  const availableMenus = MenuContents.filter((menu) => {
    if (!menu.icon) return false;
    if (menu.id === 'more' || menu.id === 'eventDetail') return false;
    return true;
  });

  const handleMenuClick = (menuId: MenuKey) => {
    heatMapEventBus.emit('click-menu-icon', { name: menuId });
  };

  return (
    <FlexColumn gap={16} align={'flex-start'} style={{ width: '100%', alignItems: 'stretch' }}>
      <Text text={t('heatmap.more.allFeatures')} fontSize={theme.typography.fontSize.lg} fontWeight={theme.typography.fontWeight.bold} />
      <GridContainer>
        {availableMenus.map((menu) => (
          <MenuItem key={menu.id} name={getMenuDisplayName(menu.id, t)} icon={menu.icon!} onClick={() => handleMenuClick(menu.id)} />
        ))}
      </GridContainer>
    </FlexColumn>
  );
};
