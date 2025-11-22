import styled from '@emotion/styled';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { FC } from 'react';

/**
 * Animated heatmap particles for landing page background
 */
const HeatmapParticles: FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 2000;

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Create a wave-like distribution
      positions[i3] = (Math.random() - 0.5) * 20;
      positions[i3 + 1] = (Math.random() - 0.5) * 20;
      positions[i3 + 2] = (Math.random() - 0.5) * 20;

      // Heatmap colors (blue to red gradient)
      const t = Math.random();
      if (t < 0.33) {
        // Blue
        colors[i3] = 0.2;
        colors[i3 + 1] = 0.4;
        colors[i3 + 2] = 1.0;
      } else if (t < 0.66) {
        // Green/Yellow
        colors[i3] = 0.9;
        colors[i3 + 1] = 0.9;
        colors[i3 + 2] = 0.2;
      } else {
        // Red
        colors[i3] = 1.0;
        colors[i3 + 1] = 0.2;
        colors[i3 + 2] = 0.2;
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    return geo;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;

    const time = state.clock.elapsedTime;

    // Rotate the entire particle system slowly
    particlesRef.current.rotation.y = time * 0.05;
    particlesRef.current.rotation.x = Math.sin(time * 0.1) * 0.2;

    // Animate individual particles with wave effect
    const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = positions[i3];
      const z = positions[i3 + 2];

      // Create wave pattern
      positions[i3 + 1] = Math.sin(x * 0.3 + time) * 0.5 + Math.cos(z * 0.2 + time * 0.5) * 0.5;
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    // eslint-disable-next-line react/no-unknown-property
    <points ref={particlesRef} geometry={geometry}>
      <pointsMaterial
        size={0.15}
        // eslint-disable-next-line react/no-unknown-property
        vertexColors
        // eslint-disable-next-line react/no-unknown-property
        transparent
        opacity={0.6}
        // eslint-disable-next-line react/no-unknown-property
        sizeAttenuation
        // eslint-disable-next-line react/no-unknown-property
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

/**
 * Grid floor to enhance 3D depth perception
 */
const GridFloor: FC = () => {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (!gridRef.current) return;
    const time = state.clock.elapsedTime;
    gridRef.current.position.y = Math.sin(time * 0.5) * 0.5 - 5;
  });

  return (
    <gridHelper
      ref={gridRef}
      // eslint-disable-next-line react/no-unknown-property
      args={[50, 50, 0x00ffff, 0x004466]}
      // eslint-disable-next-line react/no-unknown-property
      position={[0, -5, 0]}
    />
  );
};

type HeatmapBackgroundDemoProps = {
  className?: string;
};

const Component: FC<HeatmapBackgroundDemoProps> = ({ className }) => {
  return (
    <div className={className}>
      <Canvas
        camera={{
          position: [0, 5, 15],
          fov: 60,
        }}
        gl={{
          alpha: true,
          antialias: true,
        }}
      >
        {/* eslint-disable-next-line react/no-unknown-property */}
        <ambientLight intensity={0.5} />
        {/* eslint-disable-next-line react/no-unknown-property */}
        <pointLight position={[10, 10, 10]} intensity={1} />
        <HeatmapParticles />
        <GridFloor />
      </Canvas>
    </div>
  );
};

export const HeatmapBackgroundDemo = styled(Component)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  opacity: 0.3;

  canvas {
    width: 100% !important;
    height: 100% !important;
  }
`;
