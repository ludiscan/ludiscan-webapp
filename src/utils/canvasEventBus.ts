import type { Menus } from '@src/pages/heatmap/tasks/[task_id]/HeatmapMenuContent';

export interface HeatMapEventMap {
  'click-menu-icon': { name: Menus };
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
