import type { Menus } from '@src/hooks/useHeatmapSideBarMenus';

export interface RouteEdgeData {
  id: number;
  from: { x?: number; z?: number };
  to: { x?: number; z?: number };
  traversal_count: number;
  avg_duration_ms: number | null;
  death_count: number;
  death_rate: number;
  success_rate: number;
  avg_time_to_success_ms: number | null;
}

export interface HeatMapEventMap {
  'click-menu-icon': { name: Menus };
  'add-waypoint': { waypoint: { x: number; y: number; z: number } };
  'click-event-log': { logName: string; id: number };
  'event-log-detail-loaded': { logName: string; id: number };
  'camera:percent': { percent: number };
  'camera:set-zoom-percent': { percent: number };
  'camera:fit': object;
  'focus:ping': { position: { x: number; y: number; z: number } };
  'route-selected': { route: RouteEdgeData | null };
}

class EventBus<T> extends EventTarget {
  emit<K extends keyof T>(eventName: K, detail?: T[K]) {
    this.dispatchEvent(new CustomEvent<T[K]>(eventName as string, { detail }));
  }

  on<K extends keyof T>(eventName: K, callback: (event: CustomEvent<T[K]>) => void) {
    this.addEventListener(eventName as string, callback as EventListener);
  }

  off<K extends keyof T>(eventName: K, callback: (event: CustomEvent<T[K]>) => void) {
    this.removeEventListener(eventName as string, callback as EventListener);
  }
}

// 型安全なイベントバスのインスタンスを作成
export const heatMapEventBus = new EventBus<HeatMapEventMap>();
