import styled from '@emotion/styled';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import type { ModelFileType } from '@src/features/heatmap/ModelLoader';
import type { Menus } from '@src/hooks/useHeatmapSideBarMenus';
import type { RootState } from '@src/store';
import type { HeatmapDataService } from '@src/utils/heatmap/HeatmapDataService';
import type { FC } from 'react';
import type { Group } from 'three';

import { PanelCard } from '@src/component/atoms/Card';
import { FlexColumn } from '@src/component/atoms/Flex';
import { HeatmapMenuListRow } from '@src/component/organisms/HeatmapMenuListRow';
import { QuickToolbar } from '@src/features/heatmap/QuickToolbar';
import { useGeneralPatch, useGeneralSelect } from '@src/hooks/useGeneral';
import { MenuContents } from '@src/hooks/useHeatmapSideBarMenus';
import { useSharedTheme } from '@src/hooks/useSharedTheme';
import { setMenuPanelWidth } from '@src/slices/uiSlice';
import { heatMapEventBus } from '@src/utils/canvasEventBus';
import { saveRecentMenu } from '@src/utils/localstrage';

export type LocalModelData = {
  buffer: ArrayBuffer;
  fileType: ModelFileType;
  fileName: string;
};

export type HeatmapMenuProps = {
  model: Group | null;
  className?: string | undefined;
  name?: Menus | undefined;
  toggleMenu?: (value: boolean) => void;
  eventLogKeys?: string[] | undefined;
  handleExportView: () => Promise<void>;
  mapOptions: string[];
  service: HeatmapDataService;
  extra?: object;
  dimensionality: '2d' | '3d'; // 2D/3Dモード（一部のメニューは3D専用）
  // ローカルファイルの一時表示用
  localModel?: LocalModelData | null;
  onLocalModelChange?: (data: LocalModelData | null) => void;
};

const MIN_WIDTH = 300;
const MAX_WIDTH = 800;

const HeatmapMenuContentComponent: FC<HeatmapMenuProps> = (props) => {
  const { className, mapOptions, service, dimensionality } = props;
  const mapName = useGeneralSelect((s) => s.mapName);
  const setGeneral = useGeneralPatch();
  const dispatch = useDispatch();
  const menuPanelWidth = useSelector((s: RootState) => s.ui.menuPanelWidth);
  const { theme } = useSharedTheme();

  const [openMenu, setOpenMenu] = useState<Menus | undefined>(undefined);
  const [menuExtra, setMenuExtra] = useState<object | undefined>(undefined);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const handleMenuClose = useCallback(() => {
    setOpenMenu(undefined);
  }, []);

  // Resize handlers
  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      setIsResizing(true);
      resizeRef.current = { startX: e.clientX, startWidth: menuPanelWidth };
    },
    [menuPanelWidth],
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const delta = e.clientX - resizeRef.current.startX;
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resizeRef.current.startWidth + delta));
      dispatch(setMenuPanelWidth(newWidth));
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, dispatch]);

  // Listen to eventBus events
  useEffect(() => {
    const clickMenuIconHandler = (event: CustomEvent<{ name: Menus }>) => {
      const menuName = event.detail.name;
      setOpenMenu(menuName);
      // Save to recent menus (except for 'more' and 'eventLogDetail')
      if (menuName !== 'more' && menuName !== 'eventLogDetail') {
        saveRecentMenu(menuName);
      }
    };
    const clickEventLogHandler = (event: CustomEvent<{ logName: string; id: number }>) => {
      setMenuExtra(event.detail);
      setOpenMenu('eventLogDetail');
    };
    const closeMenuHandler = () => {
      setOpenMenu(undefined);
    };

    heatMapEventBus.on('click-menu-icon', clickMenuIconHandler);
    heatMapEventBus.on('click-event-log', clickEventLogHandler);
    heatMapEventBus.on('close-menu', closeMenuHandler);
    return () => {
      heatMapEventBus.off('click-menu-icon', clickMenuIconHandler);
      heatMapEventBus.off('click-event-log', clickEventLogHandler);
      heatMapEventBus.off('close-menu', closeMenuHandler);
    };
  }, []);

  useEffect(() => {
    // mapOptionsが変わった時のみ実行
    if (mapOptions.length > 0) {
      // mapNameが空、または現在のmapNameがmapOptionsに含まれていない場合のみ、最初のオプションを設定
      if (!mapName || mapName === '' || !mapOptions.includes(mapName)) {
        setGeneral({ mapName: mapOptions[0] });
      }
    }
  }, [mapOptions, mapName, setGeneral]);

  const content = useMemo(() => MenuContents.find((content) => content.name === openMenu), [openMenu]);

  // Build props for menu content component
  const menuProps: HeatmapMenuProps = {
    ...props,
    name: openMenu,
    toggleMenu: handleMenuClose,
    extra: menuExtra,
  };

  return (
    <div className={className} style={{ width: menuPanelWidth }}>
      <PanelCard className={`${className}__card`} padding={'2px'} color={theme.colors.surface.raised}>
        <FlexColumn className={`${className}__container`}>
          {/* Menu icons row */}
          <div className={`${className}__row`}>
            <HeatmapMenuListRow currentMenu={openMenu} onClose={handleMenuClose} />
          </div>

          {/* Menu content - scrollable */}
          <FlexColumn gap={8} align={'flex-start'} wrap='nowrap' className={`${className}__content`}>
            {content && <content.Component {...menuProps} />}
          </FlexColumn>

          {/* Quick toolbar at bottom */}
          <div className={`${className}__toolbar`} key='qt-container'>
            <QuickToolbar service={service} dimensionality={dimensionality} />
          </div>
        </FlexColumn>
      </PanelCard>
      {/* Resize handle */}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div className={`${className}__resizeHandle`} onMouseDown={handleResizeStart} />
    </div>
  );
};

export const HeatmapMenuContent = memo(
  styled(HeatmapMenuContentComponent)`
    position: relative;
    display: flex;
    flex-direction: column;
    align-content: center;
    height: calc(100% - 12px);
    margin: 6px;
    color: ${({ theme }) => theme.colors.text.primary};

    &__card {
      height: 100%;
    }

    &__row {
      align-self: center;
      margin: 12px 24px;
    }

    &__container {
      height: 100%;
    }

    &__content {
      flex: 1;
      width: 100%;
      height: 0;
      min-height: 0;
      padding: 16px;
      overflow: hidden auto;
    }

    &__toolbar {
      flex-shrink: 0;
      flex-wrap: nowrap;
      width: 100%;
      overflow: auto hidden;
      border-top: ${({ theme }) => `1px solid ${theme.colors.border.default}`};
    }

    &__resizeHandle {
      position: absolute;
      top: 0;
      right: -4px;
      width: 8px;
      height: 100%;
      cursor: ew-resize;
      background: transparent;
      transition: background 0.2s;

      &:hover {
        background: ${({ theme }) => theme.colors.primary.light};
      }
    }

    &__toggle {
      width: 100%;
      background: none;
      border: none;
    }

    &__searchBox {
      display: flex;
      gap: 8px;
      align-items: center;
      width: 100%;
      padding: 2px 8px;
      font-size: ${({ theme }) => theme.typography.fontSize.sm};
      font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
      color: ${({ theme }) => theme.colors.text.primary};
      background: ${({ theme }) => theme.colors.surface.raised};
      border-radius: 12px;

      & input {
        flex: 1;
        color: ${({ theme }) => theme.colors.text.primary};
        outline: none;
        background: transparent;
        border: none;
      }
    }

    &__meshesRow {
      max-height: 200px;
      padding: 0 8px;
      overflow: hidden auto;
    }

    &__label {
      width: 120px;
    }

    &__input {
      flex: 1;
      width: fit-content;
      padding: 0 8px;
    }
  `,
  (prev, next) => {
    return (
      prev.className == next.className &&
      prev.name == next.name &&
      prev.mapOptions == next.mapOptions &&
      prev.toggleMenu == next.toggleMenu &&
      prev.service.task == next.service.task &&
      prev.service.projectId == next.service.projectId &&
      prev.service.sessionId == next.service.sessionId &&
      prev.model === next.model &&
      prev.eventLogKeys === next.eventLogKeys &&
      prev.handleExportView === next.handleExportView &&
      prev.extra === prev.extra &&
      prev.dimensionality === next.dimensionality &&
      prev.localModel === next.localModel &&
      prev.onLocalModelChange === next.onLocalModelChange
    );
  },
);
