import { useCallback, useMemo } from 'react';
import { Box3 } from 'three';

import type { ThreeEvent } from '@react-three/fiber';
import type { Vec3 } from '@src/slices/selectionSlice';

import { useAppDispatch, useAppSelector } from '@src/hooks/useDispatch';
import { focusByCoord as focusByCoordAction, setFocusTarget, setSelected } from '@src/slices/selectionSlice';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

/* ========= 型 ========= */
export type PlayerArrowExtra = {
  playerId: number;
  tick: number;
  liveRefKey?: string;
};

type Handlers = {
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
  onPointerDown: (e: ThreeEvent<MouseEvent>) => void;
};

export function useSelection() {
  return useAppSelector((s) => s.selection);
}

export function useFocusActions() {
  const dispatch = useAppDispatch();

  const setSelectedAny = useCallback((sel: Parameters<typeof setSelected>[0]) => dispatch(setSelected(sel)), [dispatch]);

  const focusBox3 = useCallback(
    (box: Box3, padding?: number) => {
      dispatch(
        setFocusTarget({
          type: 'box',
          box: {
            min: { x: box.min.x, y: box.min.y, z: box.min.z },
            max: { x: box.max.x, y: box.max.y, z: box.max.z },
          },
          padding,
        }),
      );
    },
    [dispatch],
  );

  const focusPoint = useCallback(
    (p: Vec3, keepDistance = false) => {
      dispatch(setFocusTarget({ type: 'point', point: p, keepDistance }));
    },
    [dispatch],
  );

  const focusSphere = useCallback(
    (center: Vec3, radius: number) => {
      dispatch(setFocusTarget({ type: 'sphere', center, radius }));
    },
    [dispatch],
  );

  const focusByCoord = useCallback(
    (p: Vec3, openInspector = true) => {
      dispatch(focusByCoordAction({ point: p, openInspector }));
    },
    [dispatch],
  );

  return { setSelected: setSelectedAny, focusBox3, focusPoint, focusSphere, focusByCoord };
}

/* ========= オプション型定義 ========= */
type SelectableOptions =
  | {
      fit?: 'object' | 'point' | 'none';
      fitPadding?: number;
      stopPropagation?: boolean;
      extra?: Record<string, never>;
      getSelection?: never;
    }
  | {
      getSelection: (e: ThreeEvent<MouseEvent>) => {
        kind: 'heatmap-cell';
        index: number;
        worldPosition: Vec3;
        density?: number;
      };
      fit?: 'point' | 'none';
      stopPropagation?: boolean;
      extra?: never;
      fitPadding?: never;
    }
  | {
      extra: PlayerArrowExtra;
      fit?: 'point' | 'sphere' | 'none';
      fitPadding?: number;
      stopPropagation?: boolean;
      getSelection?: never;
    };

/* ========= useSelectable オーバーロード ========= */
// map-mesh
export function useSelectable(
  kind: 'map-mesh',
  options?: {
    fit?: 'object' | 'point' | 'none';
    fitPadding?: number;
    stopPropagation?: boolean;
    extra?: Record<string, never>;
  },
): Handlers;

// point
export function useSelectable(
  kind: 'point',
  options?: {
    fit?: 'point' | 'none';
    stopPropagation?: boolean;
    extra?: Record<string, never>;
  },
): Handlers;

// heatmap-cell（基本は instanceId なので getSelection 推奨）
export function useSelectable(
  kind: 'heatmap-cell',
  options: {
    getSelection: (e: ThreeEvent<MouseEvent>) => {
      kind: 'heatmap-cell';
      index: number;
      worldPosition: Vec3;
      density?: number;
    };
    fit?: 'point' | 'none';
    stopPropagation?: boolean;
  },
): Handlers;

// player-arrow（★ extra 必須）
export function useSelectable(
  kind: 'player-arrow',
  options: {
    extra: PlayerArrowExtra; // ← 必須（playerId, tick を強制）
    fit?: 'point' | 'sphere' | 'none';
    fitPadding?: number;
    stopPropagation?: boolean;
  },
): Handlers;

/* ========= 実装 ========= */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useSelectable(kind: 'map-mesh' | 'point' | 'heatmap-cell' | 'player-arrow', options?: any): Handlers {
  const { setSelected, focusBox3, focusPoint, focusSphere } = useFocusActions();

  return useMemo(() => {
    const stop = options ? options.stopPropagation : true;

    const onPointerOver = (e: ThreeEvent<PointerEvent>) => {
      if (stop) e.stopPropagation();
      // (e.target as HTMLElement).style.cursor = 'pointer';
    };

    const onPointerOut = (e: ThreeEvent<PointerEvent>) => {
      if (stop) e.stopPropagation();
      // (e.target as HTMLElement).style.cursor = 'default';
    };

    const onPointerDown = (e: ThreeEvent<MouseEvent>) => {
      if (stop) e.stopPropagation();

      // heatmap-cell は getSelection で完成形を渡すのを推奨
      if (kind === 'heatmap-cell' && options?.getSelection) {
        const sel = options.getSelection(e);
        setSelected(sel);
        if (options.fit === 'point') focusPoint(sel.worldPosition);
        return;
      }

      const p = e.point;
      const world = { x: p.x, y: p.y, z: p.z } as Vec3;

      switch (kind) {
        case 'map-mesh': {
          const obj = e.object;
          setSelected({
            kind: 'map-mesh',
            uuid: obj.uuid,
            name: obj.name,
            worldPosition: world,
            ...(options?.extra || {}),
          });
          const box = new Box3().setFromObject(obj); // ✅ constructor 経由はNG
          if (options?.fit !== 'none') {
            if (options?.fit === 'point') {
              focusPoint(world);
            } else {
              focusBox3(box, options?.fitPadding);
            }
          }
          break;
        }
        case 'point': {
          setSelected({ kind: 'point', worldPosition: world, ...(options?.extra || {}) });
          if (options?.fit !== 'none') focusPoint(world);
          heatMapEventBus.emit('focus:ping', { position: world });
          break;
        }
        case 'player-arrow': {
          const { playerId, tick, liveRefKey } = options.extra! as PlayerArrowExtra;
          setSelected({
            kind: 'player-arrow',
            playerId: String(playerId),
            tick,
            worldPosition: world, // スナップショット
            liveRefKey,
          });
          if (options?.fit === 'sphere') focusSphere(world, options?.fitPadding ?? 2.0);
          else focusPoint(world);
          break;
        }
        // heatmap-cell（getSelection なしの簡易版も許容したい場合はここに追加）
      }
    };

    return { onPointerOver, onPointerOut, onPointerDown };
  }, [kind, options, setSelected, focusBox3, focusPoint, focusSphere]);
}
