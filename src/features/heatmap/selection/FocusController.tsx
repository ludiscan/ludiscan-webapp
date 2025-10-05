// src/features/heatmap/FocusController.tsx
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

import type { FocusTarget } from '@src/slices/selectionSlice';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { getLiveObject } from '@src/features/heatmap/selection/liveObjectRegistry';
import { useAppSelector } from '@src/hooks/useDispatch';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

function fitToBoxOrbit(controls: OrbitControlsImpl, cam: THREE.Camera, box: THREE.Box3, padding = 1.15) {
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  if ((cam as THREE.PerspectiveCamera).isPerspectiveCamera) {
    const pcam = cam as THREE.PerspectiveCamera;
    const radius = size.length() / 2;
    const fov = (pcam.fov * Math.PI) / 180;
    const dist = (radius * padding) / Math.tan(fov / 2);
    const dir = pcam.position.clone().sub(controls.target).normalize();
    const nextPos = center.clone().add(dir.multiplyScalar(dist));
    controls.target.copy(center);
    pcam.position.copy(nextPos);
    pcam.updateProjectionMatrix();
    controls.update();
    return;
  }

  // Orthographic（簡易）
  const ocam = cam as THREE.OrthographicCamera;
  controls.target.copy(center);
  ocam.updateProjectionMatrix();
  controls.update();
}

export function FocusController({ orbit, sceneRoot }: { orbit: React.RefObject<OrbitControlsImpl | null>; sceneRoot: React.RefObject<THREE.Group | null> }) {
  const focusTarget = useAppSelector((s) => s.selection.focusTarget);

  const lastTargetRef = useRef<FocusTarget | null>(null);
  const tmp = useRef(new THREE.Vector3()).current;

  // 単発フォーカス（point/box/sphere/object）は useEffect で処理
  useEffect(() => {
    const controls = orbit.current;
    if (!controls || !focusTarget) return;
    const cam = controls.object as THREE.PerspectiveCamera | THREE.OrthographicCamera;

    const execOnce = (t: FocusTarget) => {
      switch (t.type) {
        case 'object': {
          const obj = sceneRoot.current?.getObjectByProperty('uuid', t.uuid);
          if (!obj) return;
          const box = new THREE.Box3().setFromObject(obj);
          fitToBoxOrbit(controls, cam, box, t.padding ?? 1.15);
          break;
        }
        case 'box': {
          const box = new THREE.Box3(new THREE.Vector3(t.box.min.x, t.box.min.y, t.box.min.z), new THREE.Vector3(t.box.max.x, t.box.max.y, t.box.max.z));
          fitToBoxOrbit(controls, cam, box, t.padding ?? 1.15);
          break;
        }
        case 'sphere': {
          const center = new THREE.Vector3(t.center.x, t.center.y, t.center.z);
          if ((cam as THREE.PerspectiveCamera).isPerspectiveCamera) {
            const pcam = cam as THREE.PerspectiveCamera;
            const fov = (pcam.fov * Math.PI) / 180;
            const dist = (t.radius * 1.2) / Math.tan(fov / 2);
            const dir = pcam.position.clone().sub(controls.target).normalize();
            const nextPos = center.clone().add(dir.multiplyScalar(dist));
            controls.target.copy(center);
            pcam.position.copy(nextPos);
            pcam.updateProjectionMatrix();
            controls.update();
          } else {
            const ocam = cam as THREE.OrthographicCamera;
            controls.target.copy(center);
            ocam.updateProjectionMatrix();
            controls.update();
          }
          break;
        }
        case 'point': {
          const p = new THREE.Vector3(t.point.x, t.point.y, t.point.z);
          const keep = !!t.keepDistance;
          const dist = controls.target.distanceTo(cam.position);
          const dir = cam.position.clone().sub(controls.target).normalize();
          const nextPos = keep ? p.clone().add(dir.multiplyScalar(dist)) : p.clone().add(dir.multiplyScalar(5));
          controls.target.copy(p);
          cam.position.copy(nextPos);
          cam.updateProjectionMatrix?.();
          controls.update();

          heatMapEventBus.emit('focus:ping', { position: { x: p.x, y: p.y, z: p.z } });
          break;
        }
        case 'follow':
          // 追尾は useFrame 側で継続的に処理する
          break;
      }
    };

    execOnce(focusTarget);
    lastTargetRef.current = focusTarget;
  }, [focusTarget, orbit, sceneRoot]);

  // 追尾フォーカス（毎フレーム）
  useFrame(() => {
    const controls = orbit.current;
    const t = lastTargetRef.current;
    if (!controls || !t || t.type !== 'follow') return;

    const cam = controls.object as THREE.PerspectiveCamera | THREE.OrthographicCamera;
    const obj = getLiveObject(t.liveRefKey);
    if (!obj) return;

    obj.getWorldPosition(tmp);

    // 現在距離を維持して target を追随
    const smooth = t.smooth ?? 0.15; // 0..1（0:即時, 1:動かない）→少し小さめで追随
    const dist = controls.target.distanceTo(cam.position);
    const dir = cam.position.clone().sub(controls.target).normalize();

    // target の補間
    controls.target.lerp(tmp, smooth);

    // カメラ位置（距離維持）
    const desired = controls.target.clone().add(dir.multiplyScalar(Math.max(0.001, dist)));
    cam.position.lerp(desired, smooth);

    cam.updateProjectionMatrix?.();
    controls.update();
  });

  return null;
}
