import Image from 'next/image';
import { BsGrid, BsPerson } from 'react-icons/bs';
import { CiMap, CiMapPin, CiStreamOn } from 'react-icons/ci';
import { FaCube } from 'react-icons/fa';
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
import { RouteCoachMenuContent } from '@src/features/heatmap/routecoach/RouteCoachMenuContent';
import { AISummaryMenuContent } from '@src/features/heatmap/summary/AISummaryMenuContent';

export type MenuType = {
  name: string;
  icon?: JSX.Element;
  Component: FC<HeatmapMenuProps>;
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
