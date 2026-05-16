/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach, jest, mock } from 'bun:test';

import { useOfflineHeatmapDataService } from './useOfflineHeatmapDataService';

import type { OfflineHeatmapData } from './HeatmapDataService';

// Mock react BEFORE importing the file that uses it
mock.module('react', () => ({
  useCallback: (fn: any) => fn,
}));

describe('useOfflineHeatmapDataService', () => {
  const originalAtob = global.atob;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  const originalAlert = global.alert;

  beforeEach(() => {
    console.error = jest.fn();
    console.log = jest.fn();
    global.alert = jest.fn();
  });

  afterEach(() => {
    global.atob = originalAtob;
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
    global.alert = originalAlert;
  });

  describe('getMapContent error paths', () => {
    it('returns null and logs error when atob throws an exception', async () => {
      const mockData = {
        mapContentBase64: 'invalid_base64_!@#',
      } as OfflineHeatmapData;

      const expectedError = new Error('Invalid base64');
      global.atob = jest.fn().mockImplementation(() => {
        throw expectedError;
      });

      const service = useOfflineHeatmapDataService(mockData);
      const result = await service.getMapContent('mapName');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('モデルデータのデコードに失敗しました:', expectedError);
      expect(console.error).toHaveBeenCalledWith(expectedError);
    });

    it('returns null, logs error and alerts when atob is undefined', async () => {
      const mockData = {
        mapContentBase64: 'valid_base64_data',
      } as OfflineHeatmapData;

      (global as any).atob = undefined;

      const service = useOfflineHeatmapDataService(mockData);
      const result = await service.getMapContent('mapName');

      expect(result).toBeNull();

      expect(console.error).toHaveBeenCalledWith('モデルデータのデコードに失敗しました:', expect.any(TypeError));

      expect(console.error).toHaveBeenCalledWith('このブラウザはatob関数をサポートしていません');

      expect(global.alert).toHaveBeenCalledWith(
        'このブラウザは必要な機能をサポートしていないため、モデルデータを表示できません。最新のブラウザをご利用ください。',
      );
    });
  });
});
