import styled from '@emotion/styled';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Provider } from 'react-redux';

import type { OfflineHeatmapData } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { Button } from '@src/component/atoms/Button';
import { Text } from '@src/component/atoms/Text';
import { Modal } from '@src/component/molecules/Modal';
import { Header } from '@src/component/templates/Header';
import { ToastProvider } from '@src/component/templates/ToastContext';
import { HeatMapViewer } from '@src/features/heatmap/HeatmapViewer';
import { SharedThemeProvider, useSharedTheme } from '@src/hooks/useSharedTheme';
import theme from '@src/modeles/theme';
import { type AppStore, store } from '@src/store';
import { useOfflineHeatmapDataService } from '@src/utils/heatmap/useOfflineHeatmapDataService';

// Providerプロパティ
interface OfflineHeatmapProviderProps {
  className?: string;
}

// オフラインヒートマップProvider
export const Component: FC<OfflineHeatmapProviderProps> = ({ className }) => {
  const { theme: currentTheme } = useSharedTheme();
  const queryClient = useMemo(() => new QueryClient(), []);
  const dataInput = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<OfflineHeatmapData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // オフライン用のデータサービスを作成
  const service = useOfflineHeatmapDataService(data);

  const loadData = useCallback(async (file: File | undefined) => {
    if (!file) return;
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result;
      if (!content) return;
      try {
        const json = JSON.parse(content as string);
        setData(json);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing JSON:', error);
      } finally {
        setIsLoading(false);
      }
    };
    reader.onerror = (error) => {
      // eslint-disable-next-line no-console
      console.error('Error reading file:', error);
      setIsLoading(false);
    };
    reader.readAsText(file);
  }, []);

  useEffect(() => {
    const dragOverHandler = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener('dragover', dragOverHandler);

    const dropHandler = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer?.files[0];

      await loadData(file);
    };

    document.addEventListener('drop', dropHandler);

    return () => {
      document.removeEventListener('dragover', dragOverHandler);
      document.removeEventListener('drop', dropHandler);
    };
  }, [loadData]);
  const storeRef = useRef<AppStore>(undefined);
  if (!storeRef.current) {
    storeRef.current = store();
  }
  return (
    <Provider store={storeRef.current}>
      <ToastProvider position={'top-right'}>
        <QueryClientProvider client={queryClient}>
          <SharedThemeProvider initialTheme={theme.crimsonDusk.dark}>
            <Modal isOpen={data == null} title={'ヒートマップデータの読み込み'} onClose={() => {}}>
              <div className={`${className}__fileInputWrapper`}>
                <Button onClick={() => dataInput.current?.click()} scheme={'primary'} fontSize={'base'} disabled={isLoading}>
                  ファイルを選択
                  <input
                    ref={dataInput}
                    className={`${className}__inputFile`}
                    type='file'
                    id='data-file'
                    accept='.json'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        loadData(file).then(() => {});
                      }
                    }}
                  />
                </Button>
              </div>
            </Modal>
            <Header
              title={'Heatmap'}
              onClick={() => {}}
              isOffline={true}
              iconTitleEnd={<Text className={`${className}__headerV`} text={'offline'} fontSize={currentTheme.typography.fontSize.sm} fontWeight={'bold'} />}
              iconEnd={
                <>
                  <Button fontSize={'sm'} onClick={() => {}} scheme={'surface'}>
                    <Text text={'Discord'} fontWeight={'bold'} />
                  </Button>
                  <Button fontSize={'sm'} onClick={() => {}} scheme={'surface'}>
                    <Text text={'Save'} fontWeight={'bold'} />
                  </Button>
                  <Button fontSize={'sm'} onClick={() => {}} scheme={'primary'}>
                    <Text text={'Export'} fontWeight={'bold'} />
                  </Button>
                </>
              }
            />
            {data && !isLoading && service && service.isInitialized && <HeatMapViewer service={service} />}
          </SharedThemeProvider>
        </QueryClientProvider>
      </ToastProvider>
    </Provider>
  );
};

const OfflineHeatmapProvider = styled(Component)`
  &__fileInputWrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 20px;
    text-align: center;
  }

  &__inputFile {
    display: none;
  }
`;

// スタンドアロンビューワーコンポーネント
export const StandaloneOfflineHeatmapViewer: FC = () => {
  // childrenは不要なので省略
  return <OfflineHeatmapProvider />;
};
