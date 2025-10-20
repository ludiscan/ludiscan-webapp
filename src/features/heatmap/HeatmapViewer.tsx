import styled from '@emotion/styled';
import { PerformanceMonitor, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector, useStore } from 'react-redux';

import type { PerformanceMonitorApi } from '@react-three/drei';
import type { PlayerTimelinePointsTimeRange } from '@src/features/heatmap/PlayerTimelinePoints';
import type { Menus } from '@src/hooks/useHeatmapSideBarMenus';
import type { PositionEventLog } from '@src/modeles/heatmaptask';
import type { RootState } from '@src/store';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { HeatMapCanvas } from '@src/features/heatmap/HeatmapCanvas';
import { HeatmapMenuContent } from '@src/features/heatmap/HeatmapMenuContent';
import { useOBJFromArrayBuffer } from '@src/features/heatmap/ModelLoader';
import { QuickToolbar } from '@src/features/heatmap/QuickToolbar';
import { TimelineControlWrapper } from '@src/features/heatmap/TimelineControlWrapper';
import { exportHeatmap } from '@src/features/heatmap/export-heatmap';
import { HeatmapMenuSideBar } from '@src/features/heatmap/menu/HeatmapMenuSideBar';
import { FocusLinkBridge } from '@src/features/heatmap/selection/FocusLinkBridge';
import { InspectorModal } from '@src/features/heatmap/selection/InspectorModal';
import { useGeneralSelect } from '@src/hooks/useGeneral';
import { DefaultStaleTime, createClient } from '@src/modeles/qeury';
import { dimensions, zIndexes } from '@src/styles/style';
import { heatMapEventBus } from '@src/utils/canvasEventBus';
import { detectDimensionality } from '@src/utils/heatmap/detectDimensionality';

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

  const mapName = useGeneralSelect((s) => s.mapName);
  const splitMode = useSelector((s: RootState) => s.heatmapCanvas.splitMode);

  const [visibleTimelineRange, setVisibleTimelineRange] = useState<PlayerTimelinePointsTimeRange>({ start: 0, end: 0 });

  const task = useMemo(() => service.task, [service.task]);

  // プロジェクトデータを取得
  const { data: project } = useQuery({
    queryKey: ['project', service.projectId],
    queryFn: async () => {
      if (!service.projectId) return null;
      const res = await createClient().GET('/api/v0/projects/{id}', {
        params: { path: { id: service.projectId } },
      });
      return res.data ?? null;
    },
    staleTime: DefaultStaleTime,
    enabled: !!service.projectId,
  });

  // 2D/3D判定（プロジェクトのis2Dを優先）
  const dimensionality = useMemo(() => detectDimensionality(project?.is2D, task), [project?.is2D, task]);

  const { data: mapList } = useQuery({
    queryKey: ['mapList', service],
    queryFn: async () => {
      return service.getMapList();
    },
    staleTime: DefaultStaleTime, // 5 minutes
    enabled: service.isInitialized,
  });

  const { data: mapContent } = useQuery({
    queryKey: ['mapData', mapName, service],
    queryFn: async () => {
      if (!mapName) return null;
      return service.getMapContent(mapName);
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
      alert('エクスポートが完了しました！');
    } catch (error) {
      // eslint-disable-next-line
      console.error('エクスポート中にエラーが発生しました:', error);
      alert('エクスポートに失敗しました。');
    }
  }, [generalLogKeys, mapContent, mapList, service, store, task]);

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

  const renderCanvas = useCallback(
    (paneId?: string) => (
      <Canvas
        key={paneId}
        style={{ flex: 1 }}
        camera={
          dimensionality === '2d'
            ? { position: [0, 5000, 0], up: [0, 0, -1], near: 10, far: 20000 } // 2D: 真上から俯瞰
            : { position: [2500, 5000, -2500], fov: 50, near: 10, far: 10000 } // 3D: 斜め視点
        }
        orthographic={dimensionality === '2d'} // 2Dは正投影カメラ
        ref={canvasRef}
        dpr={dpr}
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
        />
        <Stats parent={divRef} className={`${className}__stats`} />
      </Canvas>
    ),
    [dimensionality, dpr, handleOnPerformance, service, pointList, map, modelType, model, visibleTimelineRange, divRef, className],
  );

  return (
    <div className={`${className}__view`}>
      <FlexRow style={{ width: '100%', height: '100%' }} align={'center'} wrap={'nowrap'}>
        <HeatmapMenuSideBar className={`${className}__sideMenu`} service={service} currentMenu={openMenu} />
        {splitMode.enabled ? (
          <FlexRow className={`${className}__splitContainer`} style={{ flex: 1, flexDirection: splitMode.direction === 'horizontal' ? 'row' : 'column' }}>
            <FlexColumn className={`${className}__canvasBox ${className}__canvasBox--split`}>
              {renderCanvas('left')}
              <QuickToolbar className={`${className}__footToolbar`} service={service} />
            </FlexColumn>
            <FlexColumn className={`${className}__canvasBox ${className}__canvasBox--split`}>
              {renderCanvas('right')}
              <QuickToolbar className={`${className}__footToolbar`} service={service} />
            </FlexColumn>
          </FlexRow>
        ) : (
          <FlexColumn className={`${className}__canvasBox`}>
            {renderCanvas()}
            {/*{performance && <PerformanceList api={performance} className={`${className}__performance`} />}*/}
            <QuickToolbar className={`${className}__footToolbar`} service={service} />
          </FlexColumn>
        )}
        <div className={`${className}__player`}>
          <TimelineControlWrapper setOpenMenu={setOpenMenu} setVisibleTimelineRange={setVisibleTimelineRange} visibleTimelineRange={visibleTimelineRange} />
        </div>
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

      <div className={`${className}__selectionInspector`}>
        <InspectorModal />
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
      border: ${({ theme }) => `1px solid ${theme.colors.border.main}`};
    }

    &__canvasBox--split {
      max-width: none;
      border: ${({ theme }) => `2px solid ${theme.colors.border.main}`};
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
  `,
  (prev, next) => {
    return (
      prev.className == next.className &&
      prev.service.task == next.service.task &&
      prev.service.projectId == next.service.projectId &&
      prev.service.sessionId == next.service.sessionId
    );
  },
);
