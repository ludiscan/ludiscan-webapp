import styled from '@emotion/styled';
import { PerformanceMonitor, Stats } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useQuery } from '@tanstack/react-query';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';

import type { PerformanceMonitorApi } from '@react-three/drei';
import type { LocalModelData } from '@src/features/heatmap/HeatmapMenuContent';
import type { ModelFileType } from '@src/features/heatmap/ModelLoader';
import type { PlayerTimelinePointsTimeRange } from '@src/features/heatmap/PlayerTimelinePoints';
import type { EventLogData, FieldObjectData, PlayerTimelineDetail } from '@src/modeles/heatmapView';
import type { PositionEventLog } from '@src/modeles/heatmaptask';
import type { RootState } from '@src/store';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';

import { FlexColumn, FlexRow } from '@src/component/atoms/Flex';
import { VisuallyHidden } from '@src/component/atoms/VisuallyHidden';
import { useToast } from '@src/component/templates/ToastContext';
import { EventLogPanel } from '@src/features/heatmap/EventLogPanel';
import { HeatMapCanvas } from '@src/features/heatmap/HeatmapCanvas';
import { SMALL_SCREEN_BREAKPOINT, HeatmapMenuContent } from '@src/features/heatmap/HeatmapMenuContent';
import { useModelFromArrayBuffer } from '@src/features/heatmap/ModelLoader';
import { SettingsButton } from '@src/features/heatmap/SettingsButton';
import { TimelineControlWrapper } from '@src/features/heatmap/TimelineControlWrapper';
import { ZoomControls } from '@src/features/heatmap/ZoomControls';
import { exportHeatmap } from '@src/features/heatmap/export-heatmap';
import { HintProvider } from '@src/features/heatmap/hints';
import { FocusLinkBridge } from '@src/features/heatmap/selection/FocusLinkBridge';
import { InspectorModal } from '@src/features/heatmap/selection/InspectorModal';
import { useA11yAnnounce } from '@src/hooks/useA11yAnnounce';
import { useEventLogPatch, useEventLogSelect } from '@src/hooks/useEventLog';
import { useFieldObjectPatch, useFieldObjectSelect } from '@src/hooks/useFieldObject';
import { useGeneralPatch, useGeneralPick } from '@src/hooks/useGeneral';
import { useGetApi } from '@src/hooks/useGetApi';
import { useLocale } from '@src/hooks/useLocale';
import { usePlayerTimelinePatch } from '@src/hooks/usePlayerTimeline';
import { useFieldObjectTypes } from '@src/modeles/heatmapView';
import { DefaultStaleTime } from '@src/modeles/qeury';
import { setMenuPanelCollapsed } from '@src/slices/uiSlice';
import { dimensions, zIndexes } from '@src/styles/style';
import { getRandomPrimitiveColor } from '@src/utils/color';
import { detectDimensionality } from '@src/utils/heatmap/detectDimensionality';

// デフォルトのHVQLクエリ（FieldObject用）
const DEFAULT_FIELD_OBJECT_HVQL = `map status.hand {
  rock     -> icon: hand-rock;
  paper    -> icon: hand-paper;
  scissors  -> icon: hand-scissor;
  *        -> icon: hand-paper;
}
map object_type {
  RandomHandChangeItem -> icon: question;
}
`;

// デフォルトのHVQLクエリ（PlayerTimeline用）
const DEFAULT_PLAYER_TIMELINE_HVQL = `map status.hand {
  rock     -> player-icon: hand-rock;
  paper    -> player-icon: hand-paper;
  scissors  -> player-icon: hand-scissor;
  *        -> player-icon: target;
}
`;

export type HeatmapViewerProps = {
  className?: string | undefined;
  service: HeatmapDataService;
  isEmbed?: boolean;
};

const Component: FC<HeatmapViewerProps> = ({ className, service, isEmbed = false }) => {
  const toast = useToast();
  const { t } = useLocale();
  const { announceStatus } = useA11yAnnounce();
  const dispatch = useDispatch();
  const menuPanelCollapsed = useSelector((s: RootState) => s.ui.menuPanelCollapsed);
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

  const { mapName, dimensionalityOverride, backgroundImage, backgroundScale, backgroundOffsetX, backgroundOffsetY, showStats } = useGeneralPick(
    'mapName',
    'dimensionalityOverride',
    'backgroundImage',
    'backgroundScale',
    'backgroundOffsetX',
    'backgroundOffsetY',
    'showStats',
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

  // マップリストのactiveOnlyフィルター（デフォルトtrue: アップロード済みのマップのみ表示）
  const [mapActiveOnly, setMapActiveOnly] = useState(true);

  // EventLogPanelのcollapsed状態（スマホ時のキャンバスタップで閉じるため外部管理、デフォルトは閉じた状態）
  const [eventLogPanelCollapsed, setEventLogPanelCollapsed] = useState(true);

  const { data: mapList } = useQuery({
    queryKey: ['mapList', service.projectId, mapActiveOnly],
    queryFn: async () => {
      return service.getMapList(mapActiveOnly);
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

  // Field Object Types のフェッチと初期化（メニューを開かなくても実行される）
  const fieldObjects = useFieldObjectSelect((s) => s.objects);
  const fieldObjectQueryText = useFieldObjectSelect((s) => s.queryText);
  const setFieldObjects = useFieldObjectPatch();
  const { data: objectTypes } = useFieldObjectTypes(service.projectId ?? undefined, service.sessionId ?? undefined);

  useEffect(() => {
    if (objectTypes && Array.isArray(objectTypes.data)) {
      const currentTypes = fieldObjects.map((e) => e.objectType);
      const setA = new Set(objectTypes.data);
      const setB = new Set(currentTypes);
      const isSameSet = setA.size === setB.size && [...setA].every((k) => setB.has(k));
      if (isSameSet) return;

      const fieldObjectDatas: FieldObjectData[] = (objectTypes.data as string[]).map((type) => {
        const index = fieldObjects.findIndex((e) => e.objectType === type);
        return {
          objectType: type,
          visible: index !== -1 ? fieldObjects[index].visible : true,
          color: fieldObjects[index]?.color || getRandomPrimitiveColor(),
          iconName: fieldObjects[index]?.iconName || 'spawn',
          hvqlScript: fieldObjects[index]?.hvqlScript,
        };
      });

      // デフォルトのHVQLクエリを設定（未設定の場合のみ）
      const updates: { objects: FieldObjectData[]; queryText?: string } = { objects: fieldObjectDatas };
      if (!fieldObjectQueryText) {
        updates.queryText = DEFAULT_FIELD_OBJECT_HVQL;
      }
      setFieldObjects(updates);
    }
  }, [objectTypes, fieldObjects, fieldObjectQueryText, setFieldObjects]);

  // Event Log の初期化（メニューを開かなくても実行される）
  const eventLogs = useEventLogSelect((s) => s.logs);
  const setEventLogs = useEventLogPatch();

  useEffect(() => {
    if (generalLogKeys && Array.isArray(generalLogKeys)) {
      const currentKeys = eventLogs.map((e) => e.key);
      const setA = new Set(generalLogKeys);
      const setB = new Set(currentKeys);
      const isSameSet = setA.size === setB.size && [...setA].every((k) => setB.has(k));
      if (isSameSet) return;

      const eventLogDatas: EventLogData[] = generalLogKeys.map((key) => {
        const index = eventLogs.findIndex((e) => e.key === key);
        return {
          key,
          visible: index !== -1 ? eventLogs[index].visible : false,
          color: eventLogs[index]?.color || getRandomPrimitiveColor(),
          iconName: eventLogs[index]?.iconName || 'CiStreamOn',
          hvqlScript: eventLogs[index]?.hvqlScript,
        };
      });

      setEventLogs({ logs: eventLogDatas });
    }
  }, [generalLogKeys, eventLogs, setEventLogs]);

  // PlayerTimeline の自動有効化ロジック（メニューを開かなくても実行される）
  const setPlayerTimelineData = usePlayerTimelinePatch();

  const getPlayers = useGetApi('/api/v0/projects/{project_id}/play_session/{session_id}/player_position_log/{session_id}/players', {
    staleTime: DefaultStaleTime,
  });

  const { data: players } = useQuery({
    queryKey: ['players', service.sessionId, service.projectId],
    queryFn: async () => {
      if (!service.sessionId || !service.projectId) return null;
      const { data } = await getPlayers.fetch([
        {
          params: {
            path: {
              project_id: service.projectId,
              session_id: service.sessionId,
            },
          },
        },
      ]);
      return data;
    },
    staleTime: DefaultStaleTime,
    enabled: !!service.sessionId && !!service.projectId,
  });

  // プレイヤーを追加して表示を有効化するコールバック
  const enableWithPlayers = useCallback(() => {
    if (!players) return;
    const session_id = service.sessionId;
    const project_id = service.projectId;
    if (!session_id || !project_id) return;

    setPlayerTimelineData((prev) => {
      const newDetails: PlayerTimelineDetail[] = players
        .map((player) => {
          if (prev.details?.some((d) => d.player === player && d.session_id === session_id)) {
            return null;
          }
          return { player, project_id, session_id, visible: true };
        })
        .filter((s): s is PlayerTimelineDetail => s !== null);
      return {
        ...prev,
        visible: true,
        details: [...(prev.details || []), ...newDetails],
        // デフォルトのHVQLクエリを設定（未設定の場合のみ）
        queryText: prev.queryText || DEFAULT_PLAYER_TIMELINE_HVQL,
      };
    });
    // playerTimelineがONの時、fieldObjectもデフォルトで表示
    setFieldObjects({ visible: true });
  }, [players, service.projectId, service.sessionId, setPlayerTimelineData, setFieldObjects]);

  // プレイヤーがロードされたら自動的に表示を有効化（セッションごとに1回のみ）
  const initializedSessionRef = useRef<number | null>(null);
  useEffect(() => {
    if (players && players.length > 0 && service.sessionId && initializedSessionRef.current !== service.sessionId) {
      initializedSessionRef.current = service.sessionId;
      enableWithPlayers();
    }
  }, [service.sessionId, players, enableWithPlayers]);

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

  // v0.1 API: normalizedDensity is already 0-1 range
  const pointList = useMemo(() => {
    if (!task) return [];

    return (
      task.result?.map((point) => ({
        x: point.x - task.stepSize / 2,
        y: point.y - task.stepSize / 2,
        z: (point.z ?? 0) - task.stepSize / 2,
        normalizedDensity: point.normalizedDensity,
      })) ?? []
    );
  }, [task]);

  // Announce when heatmap data is loaded (for screen readers)
  const prevPointListLengthRef = useRef(0);
  useEffect(() => {
    if (pointList.length > 0 && prevPointListLengthRef.current === 0) {
      announceStatus(t('accessibility.dataLoaded'));
    }
    prevPointListLengthRef.current = pointList.length;
  }, [pointList.length, announceStatus, t]);

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

  // マップが正常にロードされた時、heatmapTypeをデフォルトで'fill'に設定
  const setGeneral = useGeneralPatch();
  const modelLoadedRef = useRef<boolean>(false);
  useEffect(() => {
    if (model && !modelLoadedRef.current) {
      modelLoadedRef.current = true;
      setGeneral({ heatmapType: 'fill' });
    }
  }, [model, setGeneral]);

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

  const canvasAriaLabel = dimensionality === '2d' ? t('accessibility.heatmapCanvas2D') : t('accessibility.heatmapCanvas');

  // スマホ時にキャンバスをタップしたらメニューとEventLogPanelを閉じる（縦向き・横向き両対応）
  const handleCanvasClick = useCallback(() => {
    const isSmallScreen = window.innerWidth < SMALL_SCREEN_BREAKPOINT;
    if (isSmallScreen) {
      if (!menuPanelCollapsed) {
        dispatch(setMenuPanelCollapsed(true));
      }
      if (!eventLogPanelCollapsed) {
        setEventLogPanelCollapsed(true);
      }
    }
  }, [menuPanelCollapsed, eventLogPanelCollapsed, dispatch]);

  const renderCanvas = useCallback(
    (paneId?: string) => (
      <>
        {/* Keyboard shortcut instructions for screen readers */}
        <VisuallyHidden>{t('accessibility.heatmapKeyboardShortcuts')}</VisuallyHidden>
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
          shadows // シャドウマップを有効化
          gl={{ alpha: true }} // 背景を透明にして後ろの画像が見えるようにする
          role='application'
          aria-label={canvasAriaLabel}
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
          {statsReady && showStats && <Stats parent={divRef} className={`${className}__stats`} />}
        </Canvas>
      </>
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
      showStats,
      className,
      fieldObjectLogs,
      localModel,
      canvasAriaLabel,
      t,
    ],
  );

  return (
    <HintProvider>
      <div className={`${className}__view ${isEmbed ? `${className}--embed` : ''}`}>
        <FlexRow style={{ width: '100%', height: '100%' }} align={'center'} wrap={'nowrap'}>
          {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
          <div onClick={handleCanvasClick} style={{ display: 'contents' }}>
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
          </div>
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
            mapActiveOnly={mapActiveOnly}
            onMapActiveOnlyChange={setMapActiveOnly}
            isEmbed={isEmbed}
          />
        </div>

        {/* EventLogパネル（セッション選択時に表示） */}
        {service.sessionId && (
          <div className={`${className}__eventLogPanel`}>
            <EventLogPanel
              service={service}
              eventLogKeys={generalLogKeys ?? null}
              collapsed={eventLogPanelCollapsed}
              onCollapsedChange={setEventLogPanelCollapsed}
            />
          </div>
        )}

        <div className={`${className}__selectionInspector`}>
          <InspectorModal />
        </div>

        {/* ズームコントロール（キャンバス右下） */}
        <div className={`${className}__zoomControls`}>
          <ZoomControls />
        </div>

        {/* 設定ボタン（キャンバス左下） */}
        <div className={`${className}__settingsButton`}>
          <SettingsButton />
        </div>

        {/* AIリンク/外部postMessage→focus */}
        <FocusLinkBridge />
      </div>
    </HintProvider>
  );
};

export const HeatMapViewer = memo(
  styled(Component)`
    &__view {
      --header-offset: ${dimensions.headerHeight}px;

      position: relative;
      width: calc(100% - 2px);
      height: 100%;
      overflow: hidden;
      border-top: ${({ theme }) => `1px solid ${theme.colors.border.default}`};
    }

    /* Embed mode: no header offset */

    &--embed {
      --header-offset: 0px;
    }

    /* noinspection CssUnresolvedCustomProperty */

    &__canvasMenuBox {
      position: absolute;
      top: 0;
      left: 0;
      z-index: ${zIndexes.content + 3};
      display: flex;
      width: max-content;
      height: 100%;
      padding-top: var(--header-offset);

      /* スマホ縦向き時は高さを60%に制限 */
      @media (width <= 768px) and (orientation: portrait) {
        height: 60%;
        max-height: 60vh;
      }
    }

    &__eventLogPanel {
      position: absolute;
      top: calc(var(--header-offset) + 16px);
      right: 16px;
      z-index: ${zIndexes.content + 2};
    }

    &__selectionInspector {
      position: absolute;
      top: 340px;
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
      bottom: var(--spacing-2xl);
      left: 50%;
      z-index: ${zIndexes.content + 2};
      width: max-content;
      transform: translateX(-50%);

      @media (width <= 920px) and (orientation: landscape) {
        bottom: 5px;
      }
    }

    &__zoomControls {
      position: absolute;
      right: 16px;
      bottom: 16px;
      z-index: ${zIndexes.content + 2};
    }

    &__settingsButton {
      position: absolute;
      bottom: 16px;
      left: 16px;
      z-index: ${zIndexes.content + 4};
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
