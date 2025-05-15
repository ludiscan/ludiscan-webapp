import { useCallback, useEffect, useState } from 'react';

import type { HeatmapTask, PositionEventLog } from '@src/modeles/heatmaptask';
import type { HeatmapDataService, OfflineHeatmapData } from '@src/utils/heatmap/HeatmapDataService';

/**
 * React向けのオフラインデータサービスフック
 */
export function useOfflineHeatmapDataService(dataPath: string = './data.json'): HeatmapDataService {
  const [offlineData, setOfflineData] = useState<OfflineHeatmapData | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // データロード処理
  const loadOfflineData = useCallback(async (): Promise<OfflineHeatmapData | null> => {
    if (offlineData) return offlineData;

    try {
      const response = await fetch(dataPath);
      const data = await response.json();
      setOfflineData(data);
      setIsInitialized(true);
      return data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('オフラインデータの読み込みに失敗しました:', error);
      return null;
    }
  }, [dataPath, offlineData]);

  // 初期ロード
  useEffect(() => {
    loadOfflineData().catch((err) => {
      // eslint-disable-next-line no-console
      console.error('データロードエラー:', err);
    });
  }, [loadOfflineData]);

  // APIの実装
  const getMapList = useCallback(async (): Promise<string[]> => {
    const data = await loadOfflineData();
    if (!data) return [];
    return data.mapList;
  }, [loadOfflineData]);

  const getMapContent = useCallback(
    async (_mapName: string): Promise<ArrayBuffer | null> => {
      const data = await loadOfflineData();
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
    [loadOfflineData],
  );

  const getGeneralLogKeys = useCallback(async (): Promise<string[] | null> => {
    const data = await loadOfflineData();
    if (!data) return null;
    return data.generalLogKeys;
  }, [loadOfflineData]);

  const getTask = useCallback((): HeatmapTask | null => {
    if (!offlineData) return null;
    return offlineData.task;
  }, [offlineData]);

  const getEventLog = useCallback(
    async (logName: string): Promise<PositionEventLog[] | null> => {
      const data = await loadOfflineData();
      if (!data) return null;
      return data.eventLogs[logName] || null;
    },
    [loadOfflineData],
  );

  return {
    isInitialized,
    getMapList,
    getMapContent,
    getGeneralLogKeys,
    getTask,
    getEventLog,
    eventLogs: offlineData?.eventLogs || {},
  };
}
