import type { components } from '@generated/api';

export type HeatmapTask = components['schemas']['HeatmapTaskDto'];

export function createMockHeatmapTask(): HeatmapTask {
  return {
    taskId: 1,
    project: {
      id: 1,
      name: 'Sample Project',
      description: 'This is a sample project for heatmap visualization.',
      createdAt: new Date().toDateString(),
    },
    stepSize: 50,
    zVisible: true,
    status: 'completed',
    result: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export type GeneralEventLogKeys = components['schemas']['GetGeneralLogKeysDto'];

export type PositionEventLog = components['schemas']['PositionGeneralLogDto'];

export type SessionSummary = components['schemas']['SessionSummaryDto'];
