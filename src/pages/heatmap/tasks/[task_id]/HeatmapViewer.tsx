import styled from '@emotion/styled';
import { PerformanceMonitor } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { PerformanceMonitorApi } from '@react-three/drei';
import type { HeatmapDataService, OfflineHeatmapData } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { useCanvasState } from '@src/hooks/useCanvasState';
import { HeatMapCanvas } from '@src/pages/heatmap/tasks/[task_id]/HeatmapCanvas';
import { HeatmapMenu } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenu';
import { useOBJFromArrayBuffer } from '@src/pages/heatmap/tasks/[task_id]/ModelLoader';
import { PerformanceList } from '@src/pages/heatmap/tasks/[task_id]/PerformanceList';
import { dimensions, zIndexes } from '@src/styles/style';
import { getOfflineHeatmapTemplate } from '@src/utils/heatmap/getOfflineHeatmapTemplate';

export type HeatmapViewerProps = {
  className?: string | undefined;
  dataService: HeatmapDataService;
};

const Component: FC<HeatmapViewerProps> = ({ className, dataService }) => {
  const [map, setMap] = useState<string | ArrayBuffer | null>(null);
  const [modelType, setModelType] = useState<'gltf' | 'glb' | 'obj' | 'server' | null>(null);
  const [dpr, setDpr] = useState(2);
  const [performance, setPerformance] = useState<PerformanceMonitorApi>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  const state = useCanvasState();

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

  const handleMenuClose = useCallback((value: boolean) => {
    setIsMenuOpen(value);
  }, []);

  const handleOnPerformance = useCallback((api: PerformanceMonitorApi) => {
    setDpr(Math.floor(0.5 + 1.5 * api.factor));
    setPerformance(api);
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
        canvasState: {
          ...state,
          initialized: true,
        },
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
        const bundleUrl = `${currentUrl}/ludiscan/view/api/export-heatmap-bundle`;
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
        console.error('バンドルJSの取得に失敗しました:', bundleError);

        // フォールバックとして簡易版のレンダリングコードを使用
        // eslint-disable-next-line
        console.log('フォールバック用の簡易バンドルを使用します');

        const fallbackBundleJs = `
// フォールバック用の簡易バンドル
// バンドルJSの取得に失敗したため、簡易表示モードを使用します
(function() {
  // データを読み込み
  fetch('./data.json')
    .then(response => response.json())
    .then(data => {
      window.HEATMAP_DATA = data;

      // シンプルなキャンバスで表示
      const root = document.getElementById('root');
      if (!root) return;

      // エラーメッセージを表示
      const errorDiv = document.createElement('div');
      errorDiv.style.padding = '20px';
      errorDiv.style.color = 'orange';
      errorDiv.style.background = '#f8f8f8';
      errorDiv.style.position = 'absolute';
      errorDiv.style.top = '10px';
      errorDiv.style.left = '10px';
      errorDiv.style.zIndex = '10';
      errorDiv.style.borderRadius = '5px';
      errorDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      errorDiv.innerHTML = '<h3>注意</h3><p>エクスポートモード: 簡易表示版</p><p>バンドルJSの取得に失敗したため、簡易表示モードで表示しています。</p>';
      root.appendChild(errorDiv);

      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      root.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 背景をクリア
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ヒートマップデータの描画
      if (data && data.task && data.task.result) {
        data.task.result.forEach(point => {
          const density = point.density || 0;
          const radius = Math.max(5, 20 * density);

          ctx.beginPath();
          ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);

          // 密度に応じた色を設定
          const hue = 240 - density * 240; // 青から赤へのグラデーション
          ctx.fillStyle = \`hsla(\${hue}, 100%, 50%, 0.5)\`;
          ctx.fill();
        });
      } else {
        // データがない場合のメッセージ
        ctx.fillStyle = '#333';
        ctx.font = '24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('No heatmap data available', canvas.width / 2, canvas.height / 2);
      }

      // 情報表示
      if (data && data.task) {
        ctx.fillStyle = '#333';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(\`Project: \${data.task.project.name}\`, 20, 30);
        ctx.fillText(\`Task ID: \${data.task.taskId}\`, 20, 50);
      }
    })
    .catch(error => {
      console.error('データの読み込みに失敗しました:', error);
      const root = document.getElementById('root');
      if (root) {
        root.innerHTML = \`
          <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; padding: 20px; text-align: center;">
            <h1>エラーが発生しました</h1>
            <p>データの読み込みに失敗しました。</p>
            <p>エラー詳細: \${error.message}</p>
          </div>
        \`;
      }
    });
})();`;

        zip.file('bundle.js', fallbackBundleJs);
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

  return (
    <FlexColumn className={className} align={'center'}>
      <FlexRow className={`${className}__canvasBox`} wrap={'nowrap'}>
        {task && (
          <div className={`${className}__canvasMenu`}>
            <HeatmapMenu
              task={task}
              isMenuOpen={isMenuOpen}
              toggleMenu={handleMenuClose}
              mapOptions={mapList ?? []}
              model={model}
              handleExportView={handleExportView}
              eventLogKeys={generalLogKeys ?? undefined}
            />
          </div>
        )}
        <div className={`${className}__canvas`}>
          <Canvas camera={{ position: [2500, 2500, 2500], fov: 50, near: 10, far: 10000 }} ref={canvasRef} dpr={dpr}>
            <PerformanceMonitor factor={1} onChange={handleOnPerformance} />
            <HeatMapCanvas service={dataService} pointList={pointList} map={map} modelType={modelType} model={model} />
          </Canvas>
          {performance && <PerformanceList api={performance} className={`${className}__performance`} />}
        </div>
      </FlexRow>
    </FlexColumn>
  );
};

export const HeatMapViewer = styled(Component)`
  width: 100%;

  &__inputfile {
    width: 100%;
    height: 40px;
  }

  &__canvasBox {
    position: relative;
    width: 100%;
    border: ${({ theme }) => `1px solid ${theme.colors.border.main}`};
  }

  &__canvasMenu {
    position: absolute;
    top: 0;
    right: 0;
    z-index: ${zIndexes.content + 2};
    max-width: 300px;
    max-height: 100%;
  }

  &__canvas {
    position: relative;
    width: 100%;
    height: calc(90vh - ${dimensions.headerHeight}px);
  }

  &__performance {
    position: absolute;
    top: 0;
    right: 10px;
  }
`;
