import { useCallback } from 'react';

import type { PositionEventLog } from '@src/modeles/heatmaptask';
import type { HeatmapDataService, OfflineHeatmapData } from '@src/utils/heatmap/HeatmapDataService';

/**
 * React向けのオフラインデータサービスフック
 */
export function useOfflineHeatmapDataService(offlineData: OfflineHeatmapData | null): HeatmapDataService {
  // APIの実装
  const getMapList = useCallback(async (): Promise<string[]> => {
    if (!offlineData) return [];
    return offlineData.mapList;
  }, [offlineData]);

  const getMapContent = useCallback(
    async (_mapName: string): Promise<ArrayBuffer | null> => {
      const data = offlineData;
      if (!data || !data.mapContentBase64) return null;

      try {
        // Base64エンコードされたデータをデコード
        // eslint-disable-next-line no-console
        console.log('Base64エンコードされたモデルデータを処理中...');

        // Base64文字列をバイナリデータに変換
        const binaryString = atob(data.mapContentBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        return bytes.buffer;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('モデルデータのデコードに失敗しました:', error);

        // エラーの詳細を表示
        if (error instanceof Error) {
          // eslint-disable-next-line no-console
          console.error(error);
        }

        // ブラウザがサポートしているかどうかを確認
        if (typeof atob === 'undefined') {
          // eslint-disable-next-line no-console
          console.error('このブラウザはatob関数をサポートしていません');
          alert('このブラウザは必要な機能をサポートしていないため、モデルデータを表示できません。最新のブラウザをご利用ください。');
        }

        return null;
      }
    },
    [offlineData],
  );

  const getGeneralLogKeys = useCallback(async (): Promise<string[] | null> => {
    const data = offlineData;
    if (!data) return null;
    return data.generalLogKeys;
  }, [offlineData]);

  const getEventLog = useCallback(
    async (logName: string): Promise<PositionEventLog[] | null> => {
      const data = offlineData;
      if (!data) return null;
      return data.eventLogs[logName] || null;
    },
    [offlineData],
  );

  return {
    isInitialized: offlineData != null,
    getMapList,
    getMapContent,
    getGeneralLogKeys,
    task: offlineData?.task,
    getEventLog,
    eventLogs: offlineData?.eventLogs || {},
    projectId: offlineData?.task?.project.id,
  };
}
