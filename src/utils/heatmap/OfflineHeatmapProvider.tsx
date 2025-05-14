import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Provider } from 'react-redux';

import type { Env } from '@src/modeles/env';
import type { FC } from 'react';

import { ToastProvider } from '@src/component/templates/ToastContext';
import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import { HeatMapViewer } from '@src/pages/heatmap/tasks/[task_id]/HeatmapViewer';
import { store } from '@src/store';
import lightTheme from '@src/styles/light';
import { useOfflineHeatmapDataService } from '@src/utils/heatmap/useOfflineHeatmapDataService';

// オフラインモード用のEnv設定
const offlineEnv: Env = {
  HOSTNAME: 'https://offline.local',
  API_BASE_URL: 'https://offline.local',
};

// Providerプロパティ
interface OfflineHeatmapProviderProps {
  dataPath?: string; // data.jsonのパス
}

// オフラインヒートマップProvider
export const OfflineHeatmapProvider: FC<OfflineHeatmapProviderProps> = ({ dataPath = './data.json' }) => {
  const queryClient = useMemo(() => new QueryClient(), []);

  // オフライン用のデータサービスを作成
  const dataService = useOfflineHeatmapDataService(dataPath);

  // オフラインモードでデータがロードされた場合（_app.page.tsxと同じ階層構造に合わせる）
  return (
    <Provider store={store}>
      <ToastProvider position={'top-right'}>
        <QueryClientProvider client={queryClient}>
          <SharedThemeProvider initialTheme={lightTheme}>
            <HeatMapViewer env={offlineEnv} dataService={dataService} />
          </SharedThemeProvider>
        </QueryClientProvider>
      </ToastProvider>
    </Provider>
  );
};

// スタンドアロンビューワーコンポーネント
export const StandaloneOfflineHeatmapViewer: FC = () => {
  // childrenは不要なので省略
  return <OfflineHeatmapProvider dataPath='./data.json' />;
};
