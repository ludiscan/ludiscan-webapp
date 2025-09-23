import styled from '@emotion/styled';
import { PerformanceMonitor, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { PerformanceMonitorApi } from '@react-three/drei';
import type { PlaySpeedType } from '@src/component/templates/TimelineControllerBlock';
import type { PlayerTimelinePointsTimeRange } from '@src/features/heatmap/PlayerTimelinePoints';
import type { Menus } from '@src/hooks/useHeatmapSideBarMenus';
import type { HeatmapDataService, OfflineHeatmapData } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { FlexRow } from '@src/component/atoms/Flex';
import { TimelineControllerBlock } from '@src/component/templates/TimelineControllerBlock';
import { HeatMapCanvas } from '@src/features/heatmap/HeatmapCanvas';
import { HeatmapMenuContent } from '@src/features/heatmap/HeatmapMenuContent';
import { useOBJFromArrayBuffer } from '@src/features/heatmap/ModelLoader';
import { MiniHeaderToolbar } from '@src/features/heatmap/QuickToolbar';
import { HeatmapMenuSideBar } from '@src/features/heatmap/menu/HeatmapMenuSideBar';
import { useHeatmapState, usePlayerTimelineState } from '@src/hooks/useHeatmapState';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { dimensions, zIndexes } from '@src/styles/style';
import { heatMapEventBus } from '@src/utils/canvasEventBus';
import { getOfflineHeatmapTemplate } from '@src/utils/heatmap/getOfflineHeatmapTemplate';

export type HeatmapViewerProps = {
  className?: string | undefined;
  service: HeatmapDataService;
};

const Component: FC<HeatmapViewerProps> = ({ className, service }) => {
  const [map, setMap] = useState<string | ArrayBuffer | null>(null);
  const [modelType, setModelType] = useState<'gltf' | 'glb' | 'obj' | 'server' | null>(null);
  const [dpr, setDpr] = useState(2);
  // const [performance, setPerformance] = useState<PerformanceMonitorApi>();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const divRef = useRef(document.createElement('div'));
  const [openMenu, setOpenMenu] = useState<Menus | undefined>(undefined);
  const [menuExtra, setMenuExtra] = useState<object | undefined>(undefined);

  const state = useHeatmapState();
  const { data: timelineState, setData: setTimelineState } = usePlayerTimelineState();

  const [currentTimelineSeek, setCurrentTimelineSeek] = useState<number>(0);
  const [timelinePlaySpeed, setTimelinePlaySpeed] = useState<PlaySpeedType>(1);
  const [visibleTimelineRange, setVisibleTimelineRange] = useState<PlayerTimelinePointsTimeRange>({ start: 0, end: timelineState.maxTime });

  const task = service.task;

  const { data: mapList } = useQuery({
    queryKey: ['mapList', service],
    queryFn: async () => {
      return service.getMapList();
    },
    staleTime: DefaultStaleTime, // 5 minutes
    enabled: service.isInitialized,
  });

  const { data: mapContent } = useQuery({
    queryKey: ['mapData', state.general.mapName, service],
    queryFn: async () => {
      if (!state.general.mapName) return null;
      return service.getMapContent(state.general.mapName);
    },
    staleTime: 1000 * 60 * 20,
  });

  const { data: generalLogKeys } = useQuery({
    queryKey: ['general'],
    queryFn: async () => {
      return service.getGeneralLogKeys();
    },
    staleTime: DefaultStaleTime,
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
        eventLogs: service.eventLogs,
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

      // 成功メッセージ
      alert('エクスポートが完了しました！');
    } catch (error) {
      // eslint-disable-next-line
      console.error('エクスポート中にエラーが発生しました:', error);
      alert('エクスポートに失敗しました。');
    }
  }, [service.eventLogs, generalLogKeys, mapContent, mapList, state, task]);

  useEffect(() => {
    const clickMenuIconHandler = (event: CustomEvent<{ name: Menus }>) => {
      setOpenMenu(event.detail.name);
    };
    const clickEventLogHandler = (event: CustomEvent<{ logName: string; id: number }>) => {
      setMenuExtra(event.detail);
      setOpenMenu('eventLogDetail');
    };
    heatMapEventBus.on('click-menu-icon', clickMenuIconHandler);
    heatMapEventBus.on('click-event-log', clickEventLogHandler);
    return () => {
      heatMapEventBus.off('click-menu-icon', clickMenuIconHandler);
      heatMapEventBus.off('click-event-log', clickEventLogHandler);
    };
  }, []);

  useEffect(() => {
    setVisibleTimelineRange({ start: 0, end: timelineState.maxTime });
  }, [timelineState.maxTime]);

  useEffect(() => {
    if (timelineState.isPlaying) {
      const interval = setInterval(() => {
        setCurrentTimelineSeek((prev) => {
          if (prev < visibleTimelineRange.start || prev >= visibleTimelineRange.end) {
            return visibleTimelineRange.start;
          }
          const nextSeek = prev + timelinePlaySpeed * 100; // 1秒ごとに進める
          if (nextSeek > visibleTimelineRange.end) {
            clearInterval(interval);
            setTimelineState((prev) => ({
              ...prev,
              isPlaying: false,
            }));
            return visibleTimelineRange.start;
          }
          return nextSeek;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [setTimelineState, timelinePlaySpeed, timelineState.isPlaying, visibleTimelineRange]);

  useEffect(() => {
    const div = divRef.current;
    if (div) {
      document.body.appendChild(div);
      div.id = 'stats';
      div.style.position = 'relative';
      div.style.top = '0';
      div.style.left = '0';
    }

    return () => {
      document.body.removeChild(div);
    };
  }, []);

  return (
    <div className={`${className}__view`}>
      <FlexRow style={{ width: '100%', height: '100%' }} align={'center'} wrap={'nowrap'}>
        <HeatmapMenuSideBar className={`${className}__sideMenu`} service={service} currentMenu={openMenu} />
        <div className={`${className}__canvasBox`}>
          <MiniHeaderToolbar />
          <Canvas camera={{ position: [2500, 5000, -2500], fov: 50, near: 10, far: 10000 }} ref={canvasRef} dpr={dpr}>
            <PerformanceMonitor factor={1} onChange={handleOnPerformance} />
            <HeatMapCanvas
              service={service}
              pointList={pointList}
              map={map}
              modelType={modelType}
              model={model}
              currentTimelineSeek={currentTimelineSeek}
              visibleTimelineRange={visibleTimelineRange}
            />
            <Stats parent={divRef} className={`${className}__stats`} />
          </Canvas>
          {/*{performance && <PerformanceList api={performance} className={`${className}__performance`} />}*/}
        </div>
        {timelineState.visible && (
          <div className={`${className}__player`}>
            <TimelineControllerBlock
              isPlaying={timelineState.isPlaying}
              currentTime={currentTimelineSeek}
              maxTime={timelineState.maxTime}
              currentMinTime={visibleTimelineRange.start}
              currentMaxTime={visibleTimelineRange.end}
              playSpeed={timelinePlaySpeed}
              onChangePlaySpeed={setTimelinePlaySpeed}
              onChangeMinTime={(minTime) => {
                setVisibleTimelineRange((prev) => ({
                  ...prev,
                  start: minTime,
                }));
              }}
              onChangeMaxTime={(maxTime) => {
                setVisibleTimelineRange((prev) => ({
                  ...prev,
                  end: maxTime,
                }));
              }}
              onClickMenu={() => {
                setOpenMenu('playerTimeline');
              }}
              onClickPlay={() => {
                setTimelineState((prev) => ({
                  ...prev,
                  isPlaying: !timelineState.isPlaying,
                }));
              }}
              onSeek={setCurrentTimelineSeek}
              onClickBackFrame={() => {
                setCurrentTimelineSeek((prev) => Math.max(prev - 200 * timelinePlaySpeed, visibleTimelineRange.start));
              }}
              onClickForwardFrame={() => {
                setCurrentTimelineSeek((prev) => Math.min(prev + 200 * timelinePlaySpeed, visibleTimelineRange.end));
              }}
            />
          </div>
        )}
      </FlexRow>
      <div className={`${className}__canvasMenuBox`}>
        <HeatmapMenuContent
          name={openMenu}
          toggleMenu={handleMenuClose}
          mapOptions={mapList ?? []}
          model={model}
          handleExportView={handleExportView}
          eventLogKeys={generalLogKeys ?? undefined}
          extra={menuExtra}
          service={service}
        />
      </div>
    </div>
  );
};

export const HeatMapViewer = styled(Component)`
  &__view {
    position: relative;
    width: calc(100% - 2px);
    height: 100%;
    overflow: hidden;
    border-top: ${({ theme }) => `1px solid ${theme.colors.border.main}`};
  }

  &__sideMenu {
    z-index: ${zIndexes.content + 2};
    display: flex;
    flex-shrink: 0;
    height: 100%;
    overflow-y: auto;
    background: ${({ theme }) => theme.colors.surface.dark};
  }

  &__canvasMenuBox {
    position: absolute;
    top: 0;
    left: 55px;
    z-index: ${zIndexes.content + 2};
    display: flex;
    width: max-content;
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
    max-width: 1900px;
    height: 100%;
    margin: 0 auto;
    border: ${({ theme }) => `1px solid ${theme.colors.border.main}`};
  }

  &__performance {
    position: absolute;
    top: 0;
    right: 10px;
  }

  &__player {
    position: absolute;
    bottom: 40px;
    left: 50%;
    margin-left: 30px;
    transform: translateX(-50%);
  }

  &__stats {
    position: absolute;
    top: calc(${dimensions.headerHeight}px + 2px) !important;
    right: 0 !important;
    left: unset !important;
    z-index: ${zIndexes.content + 1};
    pointer-events: none;
  }
`;
