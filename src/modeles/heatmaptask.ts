import type { components } from '@generated/api';

// v0 API types (legacy - raw density)
export type HeatmapTaskLegacy = components['schemas']['HeatmapTaskDto'];

// v0.1 API types (normalized density 0-1)
export type HeatmapTask = components['schemas']['HeatmapTaskV01Dto'];
export type NormalizedHeatmapPoint = components['schemas']['NormalizedHeatmapPointDto'];
export type NormalizedHeatmapStats = components['schemas']['NormalizedHeatmapStatsDto'];

export function createMockHeatmapTask(): HeatmapTask {
  return {
    taskId: 1,
    project: {
      id: 1,
      name: 'Sample Project',
      description: 'This is a sample project for heatmap visualization.',
      createdAt: new Date().toDateString(),
      is2D: false,
    },
    stepSize: 50,
    zVisible: true,
    status: 'completed',
    result: [],
    stats: {
      min: 0,
      max: 100,
      percentile1: 1,
      percentile99: 90,
      scaleMode: 'sqrt',
      totalPoints: 0,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export type GeneralEventLogKeys = components['schemas']['GetGeneralLogKeysDto'];

export type PositionEventLog = components['schemas']['PositionGeneralLogDto'];

export type SessionSummary = components['schemas']['SessionSummaryDto'];
