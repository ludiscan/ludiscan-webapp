import { useEffect, useState } from 'react';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { FC, JSX } from 'react';

import { MenuContents, Menus } from '@src/hooks/menuConfig';
import { heatMapEventBus } from '@src/utils/canvasEventBus';
import { getRecentMenus } from '@src/utils/localstrage';

export type SideBarMenuType = {
  name: string;
  icon: JSX.Element;
  Component: FC<HeatmapMenuProps>;
};

export { MenuContents, type Menus } from '@src/hooks/menuConfig';

export function useHeatmapSideBarMenus(): SideBarMenuType[] {
  const [recentMenus, setRecentMenus] = useState<string[]>(getRecentMenus());

  // Listen to menu clicks to update recent menus
  useEffect(() => {
    const handleMenuClick = () => {
      setRecentMenus(getRecentMenus());
    };
    heatMapEventBus.on('click-menu-icon', handleMenuClick);
    return () => {
      heatMapEventBus.off('click-menu-icon', handleMenuClick);
    };
  }, []);

  // Always show general and more
  const alwaysShowMenus = ['general', 'more'];

  // Get recent menus (max 5, excluding general and more)
  const recentMenuItems = recentMenus
    .filter((menuName) => !alwaysShowMenus.includes(menuName))
    .slice(0, 5)
    .map((menuName) => MenuContents.find((content) => content.name === menuName))
    .filter((content) => content != null && content.icon != null);

  // Build the sidebar menu list: general, recent items, more
  const sidebarMenus: SideBarMenuType[] = [];

  // Add general menu
  const generalMenu = MenuContents.find((content) => content.name === 'general');
  if (generalMenu && generalMenu.icon) {
    sidebarMenus.push({
      name: generalMenu.name,
      icon: generalMenu.icon,
      Component: generalMenu.Component,
    });
  }

  // Add recent menus
  recentMenuItems.forEach((content) => {
    if (content && content.icon) {
      sidebarMenus.push({
        name: content.name,
        icon: content.icon,
        Component: content.Component,
      });
    }
  });

  // Add more menu
  const moreMenu = MenuContents.find((content) => content.name === 'more');
  if (moreMenu && moreMenu.icon) {
    sidebarMenus.push({
      name: moreMenu.name,
      icon: moreMenu.icon,
      Component: moreMenu.Component,
    });
  }

  return sidebarMenus;
}
