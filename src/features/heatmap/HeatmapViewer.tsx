import styled from '@emotion/styled';
import { PerformanceMonitor, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useStore } from 'react-redux';

import type { PerformanceMonitorApi } from '@react-three/drei';
import type { LocalModelData } from '@src/features/heatmap/HeatmapMenuContent';
import type { ModelFileType } from '@src/features/heatmap/ModelLoader';
import type { PlayerTimelinePointsTimeRange } from '@src/features/heatmap/PlayerTimelinePoints';
import type { PositionEventLog } from '@src/modeles/heatmaptask';
import type { RootState } from '@src/store';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { useToast } from '@src/component/templates/ToastContext';
import { HeatMapCanvas } from '@src/features/heatmap/HeatmapCanvas';
import { HeatmapMenuContent } from '@src/features/heatmap/HeatmapMenuContent';
import { useModelFromArrayBuffer } from '@src/features/heatmap/ModelLoader';
import { TimelineControlWrapper } from '@src/features/heatmap/TimelineControlWrapper';
import { ZoomControls } from '@src/features/heatmap/ZoomControls';
import { exportHeatmap } from '@src/features/heatmap/export-heatmap';
import { FocusLinkBridge } from '@src/features/heatmap/selection/FocusLinkBridge';
import { InspectorModal } from '@src/features/heatmap/selection/InspectorModal';
import { useGeneralPick } from '@src/hooks/useGeneral';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { dimensions, zIndexes } from '@src/styles/style';
import { detectDimensionality } from '@src/utils/heatmap/detectDimensionality';

export type HeatmapViewerProps = {
  className?: string | undefined;
  service: HeatmapDataService;
};

const Component: FC<HeatmapViewerProps> = ({ className, service }) => {
  const toast = useToast();
  const [map, setMap] = useState<string | ArrayBuffer | null>(null);
  const [modelType, setModelType] = useState<'gltf' | 'glb' | 'obj' | 'server' | null>(null);
  const [serverModelFileType, setServerModelFileType] = useState<ModelFileType | null>(null);
  const [dpr, setDpr] = useState(2);
  // const [performance, setPerformance] = useState<PerformanceMonitorApi>();

  // ローカルファイルの一時表示用状態
  const [localModel, setLocalModel] = useState<LocalModelData | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const divRef = useRef<HTMLDivElement>(null!);
  const [statsReady, setStatsReady] = useState(false);

  const { mapName, dimensionalityOverride, backgroundImage, backgroundScale, backgroundOffsetX, backgroundOffsetY } = useGeneralPick(
    'mapName',
    'dimensionalityOverride',
    'backgroundImage',
    'backgroundScale',
    'backgroundOffsetX',
    'backgroundOffsetY',
  );
  const splitMode = useSelector((s: RootState) => s.heatmapCanvas.splitMode);

  const [visibleTimelineRange, setVisibleTimelineRange] = useState<PlayerTimelinePointsTimeRange>({ start: 0, end: 0 });

  const task = useMemo(() => service.task, [service.task]);

  // プロジェクトデータを取得 (via service)
  const { data: project } = useQuery({
    queryKey: ['project', service.projectId],
    queryFn: () => service.getProject(),
    staleTime: DefaultStaleTime,
    enabled: !!service.projectId,
  });

  // 2D/3D判定（オーバーライド > プロジェクトのis2D > taskのzVisible）
  const dimensionality = useMemo(() => detectDimensionality(dimensionalityOverride, project?.is2D, task), [dimensionalityOverride, project?.is2D, task]);

  const { data: mapList } = useQuery({
    queryKey: ['mapList', service.projectId],
    queryFn: async () => {
      return service.getMapList();
    },
    staleTime: DefaultStaleTime, // 5 minutes
    enabled: service.isInitialized,
  });

  const { data: mapContent } = useQuery({
    queryKey: ['mapData', mapName, service.projectId],
    queryFn: async () => {
      if (!mapName) return null;
      return service.getMapContent(mapName);
    },
    staleTime: 1000 * 60 * 20,
    enabled: !!mapName && service.isInitialized,
  });

  const { data: generalLogKeys } = useQuery({
    queryKey: ['generalLogKeys', service.projectId, service.sessionId],
    queryFn: async () => {
      return service.getGeneralLogKeys();
    },
    staleTime: DefaultStaleTime,
    enabled: service.isInitialized,
  });

  const { data: fieldObjectLogs } = useQuery({
    queryKey: ['fieldObjectLogs', service.projectId, service.sessionId],
    queryFn: () => service.getFieldObjectLogs(),
    staleTime: DefaultStaleTime,
    enabled: !!service.projectId && !!service.sessionId,
  });

  useEffect(() => {
    if (!mapContent) return;
    setMap(mapContent.data);
    setModelType('server');
    setServerModelFileType(mapContent.fileType);
  }, [mapContent]);

  // ローカルモデルがある場合はmodelTypeを'server'に設定
  useEffect(() => {
    if (localModel) {
      setModelType('server');
    }
  }, [localModel]);

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

  const handleOnPerformance = useCallback((api: PerformanceMonitorApi) => {
    setDpr(Math.floor(0.5 + 1.5 * api.factor));
    // setPerformance(api);
  }, []);

  // ローカルモデルが設定されている場合はそれを使用、なければサーバーモデルを使用
  const activeBuffer = useMemo(() => {
    if (localModel) {
      return localModel.buffer;
    }
    if (typeof map === 'string') {
      return null;
    }
    return map;
  }, [map, localModel]);

  const activeFileType = useMemo(() => {
    if (localModel) {
      return localModel.fileType;
    }
    return serverModelFileType;
  }, [localModel, serverModelFileType]);

  const model = useModelFromArrayBuffer(activeBuffer, activeFileType);

  // ローカルモデル変更ハンドラ
  const handleLocalModelChange = useCallback((data: LocalModelData | null) => {
    setLocalModel(data);
  }, []);

  const store = useStore<RootState>();
  const handleExportView = useCallback(async () => {
    try {
      const d: Record<string, PositionEventLog[]> = store
        .getState()
        .heatmapCanvas.eventLog.logs.map((s) => {
          return { k: s.key, d: service.getEventLogSnapshot(s.key) };
        })
        .reduce(
          (acc, curr) => {
            if (!curr.d || curr.d.length === 0) return acc;
            acc[curr.k] = curr.d;
            return acc;
          },
          {} as Record<string, PositionEventLog[]>,
        );
      await exportHeatmap(task, d, generalLogKeys, mapContent, mapList, store.getState().heatmapCanvas);
      // 成功メッセージ
      toast.showToast('Export completed successfully', 3000, 'success');
    } catch (error) {
      // eslint-disable-next-line
      console.error('エクスポート中にエラーが発生しました:', error);
      toast.showToast('Export failed', 3000, 'error');
    }
  }, [generalLogKeys, mapContent, mapList, service, store, task, toast]);

  useEffect(() => {
    // Create div element on client side only
    const div = document.createElement('div');
    divRef.current = div;
    document.body.appendChild(div);
    div.id = 'stats';
    div.style.position = 'relative';
    div.style.top = '0';
    div.style.left = '0';
    setStatsReady(true);

    return () => {
      setStatsReady(false);
      if (div.parentNode) {
        document.body.removeChild(div);
      }
    };
  }, []);

  // 背景画像のスタイルを計算
  const backgroundStyle = useMemo(() => {
    if (!backgroundImage) return null;
    // offsetは-100〜100の範囲で、0が中央（50%）
    const posX = 50 + backgroundOffsetX;
    const posY = 50 + backgroundOffsetY;
    return {
      position: 'absolute' as const,
      inset: 0,
      zIndex: 0,
      backgroundImage: `url(${backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: `${posX}% ${posY}%`,
      backgroundRepeat: 'no-repeat',
      transform: `scale(${backgroundScale})`,
      transformOrigin: 'center center',
      pointerEvents: 'none' as const,
    };
  }, [backgroundImage, backgroundScale, backgroundOffsetX, backgroundOffsetY]);

  const renderCanvas = useCallback(
    (paneId?: string) => (
      <Canvas
        key={paneId}
        style={{ flex: 1, position: 'relative', zIndex: 1 }}
        camera={
          dimensionality === '2d'
            ? { position: [0, 5000, 0], up: [0, 0, -1], near: 10, far: 20000 } // 2D: 真上から俯瞰
            : { position: [2500, 5000, -2500], fov: 50, near: 10, far: 10000 } // 3D: 斜め視点
        }
        orthographic={dimensionality === '2d'} // 2Dは正投影カメラ
        ref={canvasRef}
        dpr={dpr}
        gl={{ alpha: true }} // 背景を透明にして後ろの画像が見えるようにする
      >
        <PerformanceMonitor factor={1} onChange={handleOnPerformance} />
        <HeatMapCanvas
          service={service}
          pointList={pointList}
          map={map}
          modelType={modelType}
          model={model}
          visibleTimelineRange={visibleTimelineRange}
          dimensionality={dimensionality}
          fieldObjectLogs={fieldObjectLogs}
          hasLocalModel={!!localModel}
        />
        {statsReady && <Stats parent={divRef} className={`${className}__stats`} />}
      </Canvas>
    ),
    [
      dimensionality,
      dpr,
      handleOnPerformance,
      service,
      pointList,
      map,
      modelType,
      model,
      visibleTimelineRange,
      statsReady,
      className,
      fieldObjectLogs,
      localModel,
    ],
  );

  return (
    <div className={`${className}__view`}>
      <FlexRow style={{ width: '100%', height: '100%' }} align={'center'} wrap={'nowrap'}>
        {splitMode.enabled ? (
          <FlexRow className={`${className}__splitContainer`} style={{ flex: 1, flexDirection: splitMode.direction === 'horizontal' ? 'row' : 'column' }}>
            <FlexColumn className={`${className}__canvasBox ${className}__canvasBox--split`}>
              {backgroundStyle && <div style={backgroundStyle} />}
              {renderCanvas('left')}
            </FlexColumn>
            <FlexColumn className={`${className}__canvasBox ${className}__canvasBox--split`}>
              {backgroundStyle && <div style={backgroundStyle} />}
              {renderCanvas('right')}
            </FlexColumn>
          </FlexRow>
        ) : (
          <FlexColumn className={`${className}__canvasBox`}>
            {backgroundStyle && <div style={backgroundStyle} />}
            {renderCanvas()}
            {/*{performance && <PerformanceList api={performance} className={`${className}__performance`} />}*/}
          </FlexColumn>
        )}
        <div className={`${className}__player`}>
          <TimelineControlWrapper setVisibleTimelineRange={setVisibleTimelineRange} visibleTimelineRange={visibleTimelineRange} />
        </div>
      </FlexRow>
      <div className={`${className}__canvasMenuBox`}>
        <HeatmapMenuContent
          mapOptions={useMemo(() => mapList ?? [], [mapList])}
          model={model}
          handleExportView={handleExportView}
          eventLogKeys={generalLogKeys ?? undefined}
          service={service}
          dimensionality={dimensionality}
          localModel={localModel}
          onLocalModelChange={handleLocalModelChange}
        />
      </div>

      <div className={`${className}__selectionInspector`}>
        <InspectorModal />
      </div>

      {/* ズームコントロール（キャンバス右下） */}
      <div className={`${className}__zoomControls`}>
        <ZoomControls />
      </div>

      {/* AIリンク/外部postMessage→focus */}
      <FocusLinkBridge />
    </div>
  );
};

export const HeatMapViewer = memo(
  styled(Component)`
    &__view {
      position: relative;
      width: calc(100% - 2px);
      height: 100%;
      overflow: hidden;
      border-top: ${({ theme }) => `1px solid ${theme.colors.border.default}`};
    }

    &__canvasMenuBox {
      position: absolute;
      top: 0;
      left: 0;
      z-index: ${zIndexes.content + 2};
      display: flex;
      width: max-content;
      height: 100%;
      padding-top: ${dimensions.headerHeight}px;
    }

    &__selectionInspector {
      position: absolute;
      top: 60px;
      right: 16px;
      z-index: ${zIndexes.content + 2};
      max-width: 360px;
      max-height: 200px;
    }

    &__inputfile {
      width: 100%;
      height: 40px;
    }

    &__splitContainer {
      position: relative;
      gap: 2px;
      width: 100%;
      height: 100%;
    }

    &__canvasBox {
      position: relative;
      flex: 1;
      width: 100%;
      max-width: 1900px;
      height: 100%;
      margin: 0 auto;
      overflow: hidden;
      background-color: ${({ theme }) => theme.colors.background.overlay};
      border: ${({ theme }) => `1px solid ${theme.colors.border.default}`};
    }

    &__canvasBox--split {
      max-width: none;
      border: ${({ theme }) => `2px solid ${theme.colors.border.default}`};
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
      z-index: ${zIndexes.content + 2};
      transform: translateX(-50%);
    }

    &__zoomControls {
      position: absolute;
      right: 16px;
      bottom: 16px;
      z-index: ${zIndexes.content + 2};
    }

    &__stats {
      position: absolute;
      top: calc(${dimensions.headerHeight}px + 2px) !important;
      right: 0 !important;
      left: unset !important;
      z-index: ${zIndexes.content + 1};
      pointer-events: none;
    }
  `,
  (prev, next) => {
    return (
      prev.className === next.className &&
      prev.service.task === next.service.task &&
      prev.service.projectId === next.service.projectId &&
      prev.service.sessionId === next.service.sessionId
    );
  },
);
