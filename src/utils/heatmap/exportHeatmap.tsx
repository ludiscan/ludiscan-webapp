import React from 'react';
import ReactDOM from 'react-dom/client';

import { StandaloneOfflineHeatmapViewer } from '@src/utils/heatmap/OfflineHeatmapProvider';

// スタイルの設定
const styles = `
body, html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  font-family: sans-serif;
}
#root {
  width: 100%;
  height: 100%;
}
`;

// 静的HTMLとして表示する関数
export function renderExportedHeatmap() {
  // スタイル要素を追加
  const styleEl = document.createElement('style');
  styleEl.innerHTML = styles;
  document.head.appendChild(styleEl);

  // rootエレメントを取得し、Reactコンポーネントをレンダリング
  const rootElement = document.getElementById('root');
  if (rootElement) {
    try {
      const root = ReactDOM.createRoot(rootElement);
      root.render(<StandaloneOfflineHeatmapViewer />);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('レンダリングに失敗しました:', error);
      rootElement.innerHTML = `
        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; padding: 20px; text-align: center;">
          <h1>エラーが発生しました</h1>
          <p>レンダリングに失敗しました。</p>
          <p>エラー詳細: ${error instanceof Error ? error.message : '不明なエラー'}</p>
        </div>
      `;
    }
  }
}

// メインの実行コード
if (typeof window !== 'undefined' && document.getElementById('root')) {
  // window.onloadでレンダリングを開始
  window.onload = renderExportedHeatmap;
}
