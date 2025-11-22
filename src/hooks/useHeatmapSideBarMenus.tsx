import Image from 'next/image';
import { useEffect, useState } from 'react';
import { BsGrid, BsPerson } from 'react-icons/bs';
import { CiMap, CiMapPin, CiStreamOn } from 'react-icons/ci';
import { FaCube } from 'react-icons/fa';
import { FiFilter } from 'react-icons/fi';
import { GiPathDistance } from 'react-icons/gi';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { SiSvgtrace } from 'react-icons/si';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { HeatmapDataState } from '@src/modeles/heatmapView';
import type { FC, JSX } from 'react';

import { EventLogDetail } from '@src/features/heatmap/menu/EventLogDetail';
import { EventLogContent } from '@src/features/heatmap/menu/EventLogs';
import { FieldObjectsMenuContent } from '@src/features/heatmap/menu/FieldObjectsMenu';
import { GeneralMenuContent } from '@src/features/heatmap/menu/GeneralMenuContent';
import { HotspotMenuContent } from '@src/features/heatmap/menu/HotspotMenuContent';
import { InfoMenuContent } from '@src/features/heatmap/menu/InfoMenuContent';
import { MapMenuContent } from '@src/features/heatmap/menu/MapMenuContent';
import { MoreMenuContent } from '@src/features/heatmap/menu/MoreMenuContent';
import { PlayerTimeline } from '@src/features/heatmap/menu/PlayerTimeline';
import { SessionFilterMenuContent } from '@src/features/heatmap/menu/SessionFilterMenuContent';
import { RouteCoachMenuContent } from '@src/features/heatmap/routecoach/RouteCoachMenuContent';
import { AISummaryMenuContent } from '@src/features/heatmap/summary/AISummaryMenuContent';
import { heatMapEventBus } from '@src/utils/canvasEventBus';
import { getRecentMenus } from '@src/utils/localstrage';

export type SideBarMenuType = {
  name: string;
  icon: JSX.Element;
  Component: FC<HeatmapMenuProps>;
};

export type MenuType = Omit<SideBarMenuType, 'icon'> & {
  icon?: JSX.Element;
  visible?: (state: HeatmapDataState) => boolean;
};

export const MenuContents: MenuType[] = [
  {
    name: 'info',
    icon: <IoIosInformationCircleOutline />,
    Component: InfoMenuContent,
  },
  {
    name: 'general',
    icon: <BsPerson />,
    Component: GeneralMenuContent,
  },
  {
    name: 'sessionFilter',
    icon: <FiFilter />,
    Component: SessionFilterMenuContent,
  },
  {
    name: 'map',
    icon: <CiMap />,
    Component: MapMenuContent,
  },
  {
    name: 'hotspot',
    icon: <CiMapPin />,
    Component: HotspotMenuContent,
  },
  {
    name: 'eventlog',
    icon: <CiStreamOn />,
    Component: EventLogContent,
  },
  {
    name: 'fieldObject',
    icon: <FaCube />,
    Component: FieldObjectsMenuContent,
  },
  {
    name: 'timeline',
    icon: <SiSvgtrace />,
    Component: PlayerTimeline,
  },
  {
    name: 'routecoach',
    icon: <GiPathDistance />,
    Component: RouteCoachMenuContent,
  },
  {
    name: 'more',
    icon: <BsGrid />,
    Component: MoreMenuContent,
  },
  {
    name: 'eventLogDetail',
    Component: EventLogDetail,
  },
  {
    name: 'summary',
    icon: <Image src={'/heatmap/summarize-ai.svg'} alt={'summary'} width={22} height={22} />,
    Component: AISummaryMenuContent,
  },
] as const;

export type Menus = (typeof MenuContents)[number]['name'];

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
