export type CanvasEventMap = {
  invalidate: void;
};

class CanvasEventBus<T extends CanvasEventMap> extends EventTarget {
  emit<K extends keyof T>(eventName: K, detail?: T[K]) {
    this.dispatchEvent(new CustomEvent<T[K]>(eventName as string, { detail }));
  }

  addListener<K extends keyof T>(eventName: K, callback: (event: CustomEvent<T[K]>) => void) {
    this.addEventListener(eventName as string, callback as EventListener);
  }

  removeListener<K extends keyof T>(eventName: K, callback: (event: CustomEvent<T[K]>) => void) {
    this.removeEventListener(eventName as string, callback as EventListener);
  }
}

// 型安全なイベントバスのインスタンスを作成
export const canvasEventBus = new CanvasEventBus();
