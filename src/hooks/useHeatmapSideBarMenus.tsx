import { BsGrid, BsPerson } from 'react-icons/bs';
import { CiMap, CiMapPin, CiStreamOn } from 'react-icons/ci';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { SiSvgtrace } from 'react-icons/si';

import type { HeatmapStates } from '@src/modeles/heatmapView';
import type { HeatmapMenuProps } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';
import type { FC, JSX } from 'react';

import { Text } from '@src/component/atoms/Text';
import { useHeatmapState } from '@src/hooks/useHeatmapState';
import { EventLogDetail } from '@src/pages/heatmap/tasks/[task_id]/menu/EventLogDetail';
import { EventLogContent } from '@src/pages/heatmap/tasks/[task_id]/menu/EventLogs';
import { GeneralMenuContent } from '@src/pages/heatmap/tasks/[task_id]/menu/GeneralMenuContent';
import { HotspotMenuContent } from '@src/pages/heatmap/tasks/[task_id]/menu/HotspotMenuContent';
import { InfoMenuContent } from '@src/pages/heatmap/tasks/[task_id]/menu/InfoMenuContent';
import { MapMenuContent } from '@src/pages/heatmap/tasks/[task_id]/menu/MapMenuContent';
import { PlayerTimeline } from '@src/pages/heatmap/tasks/[task_id]/menu/PlayerTimeline';
import { fontSizes, fontWeights } from '@src/styles/style';

export type SideBarMenuType = {
  name: string;
  icon: JSX.Element;
  Component: FC<HeatmapMenuProps>;
};

export type MenuType = Omit<SideBarMenuType, 'icon'> & {
  icon?: JSX.Element;
  visible?: (state: HeatmapStates) => boolean;
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
    name: 'playerTimeline',
    icon: <SiSvgtrace />,
    visible: (state) => state.playerTimeline.visible,
    Component: PlayerTimeline,
  },
  {
    name: 'more',
    icon: <BsGrid />,
    Component: () => <Text text={'More'} fontSize={fontSizes.large1} fontWeight={fontWeights.bold} />,
  },
  {
    name: 'eventLogDetail',
    Component: EventLogDetail,
  },
] as const;

export type Menus = (typeof MenuContents)[number]['name'];

export function useHeatmapSideBarMenus(): SideBarMenuType[] {
  const state = useHeatmapState();
  return MenuContents.map((content) => {
    if (content.icon == null || (content.visible ? !content.visible(state) : false)) {
      return null;
    }
    return {
      name: content.name,
      icon: content.icon,
      Component: content.Component,
    };
  }).filter((menu) => menu != null);
}
