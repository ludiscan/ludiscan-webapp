import type { HeatmapMenuProps } from '@src/features/heatmap/HeatmapMenuContent';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

import { mockHeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';

/**
 * Create a mock HeatmapDataService with optional overrides
 */
export function createMockService(overrides?: Partial<HeatmapDataService>): HeatmapDataService {
  return {
    ...mockHeatmapDataService,
    ...overrides,
  };
}

/**
 * Create default HeatmapMenuProps for Storybook stories
 */
export function createMockMenuProps(overrides?: Partial<HeatmapMenuProps>): HeatmapMenuProps {
  return {
    model: null,
    name: undefined,
    toggleMenu: () => {},
    eventLogKeys: [],
    handleExportView: async () => {},
    mapOptions: [],
    service: mockHeatmapDataService,
    dimensionality: '3d',
    ...overrides,
  };
}

/**
 * Mock model for ObjectToggleList and Map menu
 */
export const mockModel = {
  children: [
    { uuid: '1', name: 'Building1', type: 'obj', visible: true },
    { uuid: '2', name: 'Building2', type: 'gltf', visible: false },
    { uuid: '3', name: 'Tree1', type: 'glb', visible: true },
  ],
};
