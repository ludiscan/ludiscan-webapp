import type * as THREE from 'three';

const reg = new Map<string, THREE.Object3D>();

export function registerLiveObject(key: string, obj: THREE.Object3D) {
  reg.set(key, obj);
  // three の removed イベントで自動クリーン（補助）
  obj.addEventListener?.('removed', () => reg.delete(key));
  return () => reg.delete(key);
}

export function getLiveObject(key: string) {
  return reg.get(key) ?? null;
}
