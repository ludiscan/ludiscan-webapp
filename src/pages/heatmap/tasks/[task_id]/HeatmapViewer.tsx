import styled from '@emotion/styled';
import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { PerformanceMonitorApi } from '@react-three/drei';
import type { Menus } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';
import type { HeatmapDataService, OfflineHeatmapData } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { FlexRow } from '@src/component/atoms/Flex';
import { useHeatmapState } from '@src/hooks/useHeatmapState';
import { HeatMapCanvas } from '@src/pages/heatmap/tasks/[task_id]/HeatmapCanvas';
import { HeatmapMenuContent } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';
import { HeatmapMenuSideBar } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuSideBar';
import { useOBJFromArrayBuffer } from '@src/pages/heatmap/tasks/[task_id]/ModelLoader';
import { zIndexes } from '@src/styles/style';
import { heatMapEventBus } from '@src/utils/canvasEventBus';
import { getOfflineHeatmapTemplate } from '@src/utils/heatmap/getOfflineHeatmapTemplate';

export type HeatmapViewerProps = {
  className?: string | undefined;
  dataService: HeatmapDataService;
};

const Component: FC<HeatmapViewerProps> = ({ className, dataService }) => {
  const [map, setMap] = useState<string | ArrayBuffer | null>(null);
  const [modelType, setModelType] = useState<'gltf' | 'glb' | 'obj' | 'server' | null>(null);
  const [dpr, setDpr] = useState(2);
  // const [performance, setPerformance] = useState<PerformanceMonitorApi>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [openMenu, setOpenMenu] = useState<Menus | undefined>(undefined);

  const state = useHeatmapState();

  const task = useMemo(() => dataService.getTask(), [dataService]);

  const taskId = useMemo(() => {
    const currentTask = dataService.getTask();
    return currentTask?.taskId ?? 0;
  }, [dataService]);

  const { data: mapList } = useQuery({
    queryKey: ['mapList', taskId, dataService],
    queryFn: async () => {
      return dataService.getMapList();
    },
    enabled: !!taskId,
  });

  const { data: mapContent } = useQuery({
    queryKey: ['mapData', state.general.mapName, dataService, taskId],
    queryFn: async () => {
      if (!state.general.mapName) return null;
      return dataService.getMapContent(state.general.mapName);
    },
  });

  const { data: generalLogKeys } = useQuery({
    queryKey: ['general', taskId],
    queryFn: async () => {
      return dataService.getGeneralLogKeys();
    },
  });

  useEffect(() => {
    if (!mapContent) return;
    setMap(mapContent);
    setModelType('server');
  }, [mapContent]);

  const pointList = useMemo(() => {
    if (!task) return [];

    return (
      task.result?.map((point) => ({
        x: point.x - task.stepSize / 2,
        y: point.y - task.stepSize / 2,
        z: (point.z ?? 0) - task.stepSize / 2,
        density: point.density,
      })) ?? []
    );
  }, [task]);

  const handleMenuClose = useCallback(() => {
    setOpenMenu(undefined);
  }, []);

  const handleOnPerformance = useCallback((api: PerformanceMonitorApi) => {
    setDpr(Math.floor(0.5 + 1.5 * api.factor));
    // setPerformance(api);
  }, []);

  const buffer = useMemo(() => {
    if (typeof map === 'string') {
      return null;
    }
    return map;
  }, [map]);
  const model = useOBJFromArrayBuffer(buffer);

  const handleExportView = useCallback(async () => {
    try {
      if (!task) {
        alert('タスクが取得できませんでした。');
        return;
      }

      // ZIPファイルを作成
      const zip = new JSZip();

      // 1. HTMLファイルの作成
      const htmlContent = getOfflineHeatmapTemplate(task);

      zip.file('index.html', htmlContent);

      // 2. モデルデータのBase64エンコード処理
      let mapContentBase64 = null;
      if (mapContent) {
        // ArrayBufferをBase64に変換
        const uint8Array = new Uint8Array(mapContent);
        const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        mapContentBase64 = btoa(binaryString);
        // eslint-disable-next-line no-console
        console.log('モデルデータをBase64エンコードしました');
      }

      // 3. データJSONの作成（mapContentをBase64で埋め込み）
      const heatmapData: OfflineHeatmapData = {
        task: task,
        canvasState: state,
        mapList: mapList ?? [],
        mapContentBase64: mapContentBase64, // Base64エンコードしたモデルデータ
        generalLogKeys: generalLogKeys ?? null,
        eventLogs: dataService.eventLogs,
      };

      zip.file('data.json', JSON.stringify(heatmapData, null, 2));

      // 4. バンドルJSの取得
      try {
        // 現在のホストからAPIエンドポイントのURLを作成
        const currentUrl = window.location.origin;
        const bundleUrl = `${currentUrl}/api/export-heatmap-bundle`;
        // eslint-disable-next-line
        console.log('バンドルJSを取得します:', bundleUrl);

        const bundleResponse = await fetch(bundleUrl);
        if (!bundleResponse.ok) {
          throw new Error(`バンドルJSの取得に失敗しました: ${bundleResponse.status}`);
        }

        const bundleJs = await bundleResponse.text();
        zip.file('bundle.js', bundleJs);

        // eslint-disable-next-line
        console.log('バンドルJSを正常に取得しました');
      } catch (bundleError) {
        // eslint-disable-next-line
        console.error('バンドルJSの取得中にエラーが発生しました:', bundleError);
        return;
      }

      // 5. オフラインでのモデル読み込みについての説明ファイル
      const readmeContent = `
# Ludiscanオフラインヒートマップビューワー

このZIPファイルには以下のファイルが含まれています：

- index.html: ヒートマップビューワーのHTMLファイル
- data.json: ヒートマップデータ（3Dモデルデータを含む）
- bundle.js: ビューワー用のJavaScriptファイル

## 使用方法

1. すべてのファイルを同じディレクトリに展開してください
2. index.htmlをブラウザで開いてください

## 注意事項

- すべてのファイルを同じディレクトリに保つ必要があります
- 3Dモデルデータはdata.json内にBase64エンコードで埋め込まれています
`;

      zip.file('README.txt', readmeContent);

      // 6. ZIPファイルを保存
      const content = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
          level: 9,
        },
      });
      saveAs(content, `ludiscan-heatmap-${task.taskId}.zip`);

      // 成功メッセージ
      alert('エクスポートが完了しました！');
    } catch (error) {
      // eslint-disable-next-line
      console.error('エクスポート中にエラーが発生しました:', error);
      alert('エクスポートに失敗しました。');
    }
  }, [dataService.eventLogs, generalLogKeys, mapContent, mapList, state, task]);

  useEffect(() => {
    const clickMenuIconHandler = (event: CustomEvent<{ name: string }>) => {
      setOpenMenu(event.detail.name);
    };
    heatMapEventBus.on('click-menu-icon', clickMenuIconHandler);
    return () => {
      heatMapEventBus.off('click-menu-icon', clickMenuIconHandler);
    };
  }, []);

  return (
    <FlexRow className={className} align={'center'} wrap={'nowrap'}>
      <HeatmapMenuSideBar className={`${className}__sideMenu`} service={dataService} currentMenu={openMenu} />
      {task && (
        <div className={`${className}__canvasMenuBox`}>
          <HeatmapMenuContent
            task={task}
            name={openMenu}
            toggleMenu={handleMenuClose}
            mapOptions={mapList ?? []}
            model={model}
            handleExportView={handleExportView}
            eventLogKeys={generalLogKeys ?? undefined}
          />
        </div>
      )}
      <div className={`${className}__canvasBox`}>
        <Canvas camera={{ position: [2500, 2500, 2500], fov: 50, near: 10, far: 10000 }} ref={canvasRef} dpr={dpr}>
          <PerformanceMonitor factor={1} onChange={handleOnPerformance} />
          <HeatMapCanvas service={dataService} pointList={pointList} map={map} modelType={modelType} model={model} />
        </Canvas>
        {/*{performance && <PerformanceList api={performance} className={`${className}__performance`} />}*/}
      </div>
    </FlexRow>
  );
};

export const HeatMapViewer = styled(Component)`
  width: calc(100% - 2px);
  height: 100%;
  overflow: hidden;
  border-top: ${({ theme }) => `1px solid ${theme.colors.border.main}`};

  &__sideMenu {
    z-index: ${zIndexes.content + 2};
    display: flex;
    flex-shrink: 0;
    height: 100%;
    overflow-y: auto;
    background: ${({ theme }) => theme.colors.surface.dark};
  }

  &__canvasMenuBox {
    position: relative;
    z-index: ${zIndexes.content + 2};
    display: flex;
    height: 100%;
  }

  &__inputfile {
    width: 100%;
    height: 40px;
  }

  &__canvasBox {
    position: relative;
    flex: 1;
    width: 100%;
    max-width: 1700px;
    height: 100%;
    margin: 0 auto;
    border: ${({ theme }) => `1px solid ${theme.colors.border.main}`};
  }

  &__performance {
    position: absolute;
    top: 0;
    right: 10px;
  }
`;
