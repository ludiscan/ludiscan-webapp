import { saveAs } from 'file-saver';
import JSZip from 'jszip';

import type { HeatmapStates } from '@src/modeles/heatmapView';
import type { HeatmapTask, PositionEventLog } from '@src/modeles/heatmaptask';
import type { OfflineHeatmapData } from '@src/utils/heatmap/HeatmapDataService';

import { getOfflineHeatmapTemplate } from '@src/utils/heatmap/getOfflineHeatmapTemplate';

export const exportHeatmap = async (
  task: HeatmapTask | undefined,
  eventLogs: Record<string, PositionEventLog[]>,
  generalLogKeys: string[] | null | undefined,
  mapContent: ArrayBuffer | null | undefined,
  mapList: string[] | undefined,
  state: HeatmapStates,
) => {
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
    eventLogs: eventLogs,
  };

  zip.file('data.json', JSON.stringify(heatmapData, null, 2));

  // 4. バンドルJSの取得
  try {
    // eslint-disable-next-line
    console.log('バンドルJSを取得します');

    const bundleResponse = await fetch('/api/export-heatmap-bundle');
    if (!bundleResponse.ok) {
      // eslint-disable-next-line
      console.error(`バンドルJSの取得に失敗しました: ${bundleResponse.status}`);
      return;
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
};
