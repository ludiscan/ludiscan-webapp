import packageJson from '../../package.json';

export type EventLogData = {
  key: string;
  visible: boolean;
  color: string;
};

export type GeneralSettings = {
  upZ: boolean;
  scale: number;
  showHeatmap: boolean;
  blockSize: number;
  mapName: string;
  minThreshold: number;
  maxThreshold: number;
};
export type HotspotModeSettings = {
  visible: boolean;
  cellRadius: number;
  thresholdCount: number;
  skipNearDuplication: boolean;
};

export type HeatmapStates = {
  general: GeneralSettings;
  hotspotMode: HotspotModeSettings;
  eventLogs: EventLogData[];
};

// Canvas の状態の型定義
export type HeatmapDataState = HeatmapStates & {
  version?: string;
};

export const initializeValues: HeatmapDataState = {
  version: packageJson.version,
  general: {
    upZ: true,
    scale: 1,
    showHeatmap: false,
    blockSize: 1,
    mapName: '',
    minThreshold: 0.0,
    maxThreshold: 1,
  },
  hotspotMode: {
    visible: false,
    cellRadius: 400,
    thresholdCount: 6,
    skipNearDuplication: true,
  },
  eventLogs: [],
};
