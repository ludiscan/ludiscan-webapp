import { useFrame, useThree } from '@react-three/fiber';
import { useRef, useState } from 'react';
import * as THREE from 'three';

import type { FC, RefObject } from 'react';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type TransparentObjects = Map<THREE.Object3D, number>;

export type CameraWallTransparencyProps = {
  controlsRef: RefObject<OrbitControls>;
};

export const CameraWallTransparency: FC<CameraWallTransparencyProps> = ({ controlsRef }) => {
  const { camera, scene } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const [previousHits, setPreviousHits] = useState<TransparentObjects>(new Map());

  useFrame(() => {
    if (!camera || !scene || !controlsRef.current) return;

    // eslint-disable-next-line @react-three/no-clone-in-loop
    const target = controlsRef.current.target.clone();
    raycaster.current.set(camera.position, target.sub(camera.position).normalize());

    // **カメラとターゲットの間にあるオブジェクトのうち、一番近いものだけを透明化**
    const intersects = raycaster.current.intersectObjects(scene.children, true).filter((hit) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return hit.object !== camera && hit.object !== controlsRef.current?.target;
    });

    // eslint-disable-next-line @react-three/no-new-in-loop
    const newHits: TransparentObjects = new Map();

    if (intersects.length > 0) {
      const closestObject = intersects[0].object; // **最初にヒットしたオブジェクトのみ透明化**
      if (closestObject instanceof THREE.Mesh) {
        const material = closestObject.material as THREE.MeshStandardMaterial;
        if (!material.transparent) {
          material.transparent = true;
        }
        newHits.set(closestObject, material.opacity);
        material.opacity = 0.3;
      }
    }

    // 透明化されていたが、もう障害物でなくなったものを元の透明度に戻す
    previousHits.forEach((originalOpacity, object) => {
      if (!newHits.has(object)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        const material = object.material as THREE.MeshStandardMaterial;
        material.opacity = originalOpacity;
        material.transparent = originalOpacity < 1.0;
      }
    });

    setPreviousHits(newHits);
  });

  return null;
};
