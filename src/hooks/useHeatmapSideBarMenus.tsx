import Image from 'next/image';
import { BsGrid, BsPerson } from 'react-icons/bs';
import { CiMap, CiMapPin, CiStreamOn } from 'react-icons/ci';
import { IoIosInformationCircleOutline } from 'react-icons/io';
import { SiSvgtrace } from 'react-icons/si';

import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { HeatmapStates } from '@src/modeles/heatmapView';
import type { FC, JSX } from 'react';

import { Text } from '@src/component/atoms/Text';
import { EventLogDetail } from '@src/features/heatmap/menu/EventLogDetail';
import { EventLogContent } from '@src/features/heatmap/menu/EventLogs';
import { GeneralMenuContent } from '@src/features/heatmap/menu/GeneralMenuContent';
import { HotspotMenuContent } from '@src/features/heatmap/menu/HotspotMenuContent';
import { InfoMenuContent } from '@src/features/heatmap/menu/InfoMenuContent';
import { MapMenuContent } from '@src/features/heatmap/menu/MapMenuContent';
import { PlayerTimeline } from '@src/features/heatmap/menu/PlayerTimeline';
import { AISummaryMenuContent } from '@src/features/heatmap/summary/AISummaryMenuContent';
import { useHeatmapState } from '@src/hooks/useHeatmapState';
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
  {
    name: 'summary',
    icon: <Image src={'/heatmap/summarize-ai.svg'} alt={'summary'} width={22} height={22} />,
    Component: AISummaryMenuContent,
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
