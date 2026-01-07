import { useEffect, useMemo, useState } from 'react';
import { BiBarChartAlt2 } from 'react-icons/bi';
import { BsGrid, BsPerson, BsStars } from 'react-icons/bs';
import { CiMap, CiMapPin, CiStreamOn } from 'react-icons/ci';
import { FaCube } from 'react-icons/fa';
import { GiPathDistance } from 'react-icons/gi';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { MdReplay } from 'react-icons/md';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { HeatmapDataState } from '@src/modeles/heatmapView';
import type { FC, JSX } from 'react';

import { AggregationMenuContent } from '@src/features/heatmap/menu/AggregationMenuContent';
import { EventLogDetail } from '@src/features/heatmap/menu/EventLogDetail';
import { EventLogContent } from '@src/features/heatmap/menu/EventLogs';
import { FieldObjectsMenuContent } from '@src/features/heatmap/menu/FieldObjectsMenu';
import { GeneralMenuContent } from '@src/features/heatmap/menu/GeneralMenuContent';
import { HotspotMenuContent } from '@src/features/heatmap/menu/HotspotMenuContent';
import { InfoMenuContent } from '@src/features/heatmap/menu/InfoMenuContent';
import { MapMenuContent } from '@src/features/heatmap/menu/MapMenuContent';
import { MoreMenuContent } from '@src/features/heatmap/menu/MoreMenuContent';
import { PlayerTimeline } from '@src/features/heatmap/menu/PlayerTimeline';
import { RouteCoachMenuContent } from '@src/features/heatmap/routecoach/RouteCoachMenuContent';
import { AISummaryMenuContent } from '@src/features/heatmap/summary/AISummaryMenuContent';
import { useLocale } from '@src/hooks/useLocale';
import { heatMapEventBus } from '@src/utils/canvasEventBus';
import { getRecentMenus } from '@src/utils/localstrage';

/**
 * Menu key type - used as identifier for menus
 * Must match keys in locales menus object
 */
export type MenuKey =
  | 'info'
  | 'general'
  | 'map'
  | 'hotspot'
  | 'eventlog'
  | 'fieldObject'
  | 'timeline'
  | 'routecoach'
  | 'aggregation'
  | 'more'
  | 'eventDetail'
  | 'aiSummary';

export type SideBarMenuType = {
  id: MenuKey;
  displayName: string;
  icon: JSX.Element;
  Component: FC<HeatmapMenuProps>;
};

export type MenuType = {
  id: MenuKey;
  icon?: JSX.Element;
  Component: FC<HeatmapMenuProps>;
  visible?: (state: HeatmapDataState) => boolean;
};

export const MenuContents: MenuType[] = [
  {
    id: 'info',
    icon: <IoIosInformationCircleOutline />,
    Component: InfoMenuContent,
  },
  {
    id: 'general',
    icon: <BsPerson />,
    Component: GeneralMenuContent,
  },
  {
    id: 'map',
    icon: <CiMap />,
    Component: MapMenuContent,
  },
  {
    id: 'hotspot',
    icon: <CiMapPin />,
    Component: HotspotMenuContent,
  },
  {
    id: 'eventlog',
    icon: <CiStreamOn />,
    Component: EventLogContent,
  },
  {
    id: 'fieldObject',
    icon: <FaCube />,
    Component: FieldObjectsMenuContent,
  },
  {
    id: 'timeline',
    icon: <MdReplay />,
    Component: PlayerTimeline,
  },
  {
    id: 'routecoach',
    icon: <GiPathDistance />,
    Component: RouteCoachMenuContent,
  },
  {
    id: 'aggregation',
    icon: <BiBarChartAlt2 />,
    Component: AggregationMenuContent,
  },
  {
    id: 'more',
    icon: <BsGrid />,
    Component: MoreMenuContent,
  },
  {
    id: 'eventDetail',
    Component: EventLogDetail,
  },
  {
    id: 'aiSummary',
    icon: <BsStars />,
    Component: AISummaryMenuContent,
  },
] as const;

/**
 * Helper to get display name for a menu key
 */
export function getMenuDisplayName(id: MenuKey, t: ReturnType<typeof useLocale>['t']): string {
  return t(`menus.${id}`);
}

/** @deprecated Use MenuKey instead */
export type Menus = MenuKey;

// Always show general and more - defined outside hook to avoid dependency issues
const ALWAYS_SHOW_MENUS: MenuKey[] = ['general', 'more'];

export function useHeatmapSideBarMenus(): SideBarMenuType[] {
  const { t } = useLocale();
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

  // Get recent menus (max 5, excluding general and more)
  const recentMenuItems = useMemo(
    () =>
      recentMenus
        .filter((menuId) => !ALWAYS_SHOW_MENUS.includes(menuId as MenuKey))
        .slice(0, 5)
        .map((menuId) => MenuContents.find((content) => content.id === menuId))
        .filter((content) => content != null && content.icon != null),
    [recentMenus],
  );

  // Build the sidebar menu list: general, recent items, more
  return useMemo(() => {
    const sidebarMenus: SideBarMenuType[] = [];

    // Add general menu
    const generalMenu = MenuContents.find((content) => content.id === 'general');
    if (generalMenu && generalMenu.icon) {
      sidebarMenus.push({
        id: generalMenu.id,
        displayName: getMenuDisplayName(generalMenu.id, t),
        icon: generalMenu.icon,
        Component: generalMenu.Component,
      });
    }

    // Add recent menus
    recentMenuItems.forEach((content) => {
      if (content && content.icon) {
        sidebarMenus.push({
          id: content.id,
          displayName: getMenuDisplayName(content.id, t),
          icon: content.icon,
          Component: content.Component,
        });
      }
    });

    // Add more menu
    const moreMenu = MenuContents.find((content) => content.id === 'more');
    if (moreMenu && moreMenu.icon) {
      sidebarMenus.push({
        id: moreMenu.id,
        displayName: getMenuDisplayName(moreMenu.id, t),
        icon: moreMenu.icon,
        Component: moreMenu.Component,
      });
    }

    return sidebarMenus;
  }, [t, recentMenuItems]);
}
