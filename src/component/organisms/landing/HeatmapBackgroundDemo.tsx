import styled from '@emotion/styled';
import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

import type { FC } from 'react';

/**
 * Heatmap grid visualization - creates animated heatmap cells
 */
const HeatmapGrid: FC = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const gridSize = 20;
  const cellCount = gridSize * gridSize;
  const cellSize = 0.8;
  const gap = 0.1;

  // Store intensity values for animation
  const intensities = useRef<Float32Array>(new Float32Array(cellCount));
  const targetIntensities = useRef<Float32Array>(new Float32Array(cellCount));
  const hotspots = useRef<{ x: number; z: number; intensity: number; decay: number }[]>([]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Heatmap color function: blue -> cyan -> green -> yellow -> red
  const getHeatmapColor = (intensity: number): THREE.Color => {
    const color = new THREE.Color();

    if (intensity < 0.25) {
      // Blue to Cyan
      const t = intensity / 0.25;
      color.setRGB(0, t * 0.8, 1);
    } else if (intensity < 0.5) {
      // Cyan to Green
      const t = (intensity - 0.25) / 0.25;
      color.setRGB(0, 0.8 + t * 0.2, 1 - t);
    } else if (intensity < 0.75) {
      // Green to Yellow
      const t = (intensity - 0.5) / 0.25;
      color.setRGB(t, 1, 0);
    } else {
      // Yellow to Red
      const t = (intensity - 0.75) / 0.25;
      color.setRGB(1, 1 - t * 0.8, 0);
    }

    return color;
  };

  // Initialize positions
  useMemo(() => {
    for (let i = 0; i < cellCount; i++) {
      intensities.current[i] = Math.random() * 0.3;
      targetIntensities.current[i] = Math.random() * 0.3;
    }
  }, [cellCount]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;

    // Randomly create new hotspots
    if (Math.random() < 0.02) {
      hotspots.current.push({
        x: Math.floor(Math.random() * gridSize),
        z: Math.floor(Math.random() * gridSize),
        intensity: 0.7 + Math.random() * 0.3,
        decay: 0.005 + Math.random() * 0.01,
      });
    }

    // Update hotspots and calculate target intensities
    targetIntensities.current.fill(0.05);

    hotspots.current = hotspots.current.filter((hotspot) => {
      hotspot.intensity -= hotspot.decay;

      if (hotspot.intensity <= 0) return false;

      // Apply hotspot influence to nearby cells
      for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
          const dx = x - hotspot.x;
          const dz = z - hotspot.z;
          const distance = Math.sqrt(dx * dx + dz * dz);
          const influence = Math.max(0, hotspot.intensity * (1 - distance / 4));
          const idx = z * gridSize + x;
          targetIntensities.current[idx] = Math.min(1, targetIntensities.current[idx] + influence);
        }
      }

      return true;
    });

    // Add base wave pattern
    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const idx = z * gridSize + x;
        const wave = Math.sin(x * 0.3 + time * 0.5) * Math.cos(z * 0.3 + time * 0.3) * 0.15 + 0.15;
        targetIntensities.current[idx] = Math.min(1, targetIntensities.current[idx] + wave);
      }
    }

    // Smooth interpolation and update instances
    const offset = (gridSize * (cellSize + gap)) / 2;

    for (let i = 0; i < cellCount; i++) {
      // Smooth interpolation
      intensities.current[i] += (targetIntensities.current[i] - intensities.current[i]) * 0.05;

      const x = i % gridSize;
      const z = Math.floor(i / gridSize);
      const intensity = intensities.current[i];

      // Position
      dummy.position.set(x * (cellSize + gap) - offset, intensity * 2 - 1, z * (cellSize + gap) - offset);

      // Scale based on intensity
      const scale = 0.5 + intensity * 0.5;
      dummy.scale.set(scale, 0.1 + intensity * 0.5, scale);

      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      // Color based on intensity
      const color = getHeatmapColor(intensity);
      meshRef.current.setColorAt(i, color);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  });

  return (
    // eslint-disable-next-line react/no-unknown-property
    <instancedMesh ref={meshRef} args={[undefined, undefined, cellCount]}>
      {/* eslint-disable-next-line react/no-unknown-property */}
      <boxGeometry args={[cellSize, 0.3, cellSize]} />
      <meshBasicMaterial
        // eslint-disable-next-line react/no-unknown-property
        transparent
        opacity={0.7}
        // eslint-disable-next-line react/no-unknown-property
        toneMapped={false}
      />
    </instancedMesh>
  );
};

/**
 * Floating data points that rise from hot areas
 */
const FloatingParticles: FC = () => {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 200;

  const { positions, velocities, colors, lifetimes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Start at random positions
      positions[i * 3] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 1] = Math.random() * -2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;

      // Upward velocity with slight horizontal drift
      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = 0.02 + Math.random() * 0.03;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;

      // Random heatmap color
      const t = Math.random();
      if (t < 0.3) {
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 0.8;
        colors[i * 3 + 2] = 1;
      } else if (t < 0.6) {
        colors[i * 3] = 0.5;
        colors[i * 3 + 1] = 1;
        colors[i * 3 + 2] = 0;
      } else {
        colors[i * 3] = 1;
        colors[i * 3 + 1] = 0.5;
        colors[i * 3 + 2] = 0;
      }

      lifetimes[i] = Math.random();
    }

    return { positions, velocities, colors, lifetimes };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  useFrame(() => {
    if (!particlesRef.current) return;

    const positionAttribute = particlesRef.current.geometry.attributes.position;
    const array = positionAttribute.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;

      // Update position
      array[i3] += velocities[i3];
      array[i3 + 1] += velocities[i3 + 1];
      array[i3 + 2] += velocities[i3 + 2];

      lifetimes[i] += 0.005;

      // Reset particle when it goes too high or lifetime ends
      if (array[i3 + 1] > 4 || lifetimes[i] > 1) {
        array[i3] = (Math.random() - 0.5) * 16;
        array[i3 + 1] = -1;
        array[i3 + 2] = (Math.random() - 0.5) * 16;
        lifetimes[i] = 0;
      }
    }

    positionAttribute.needsUpdate = true;
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
        // eslint-disable-next-line react/no-unknown-property
        depthWrite={false}
      />
    </points>
  );
};

/**
 * Grid lines for reference
 */
const GridLines: FC = () => {
  const gridRef = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (!gridRef.current) return;
    gridRef.current.position.y = -1.5 + Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
  });

  return (
    <gridHelper
      ref={gridRef}
      // eslint-disable-next-line react/no-unknown-property
      args={[20, 20, 0x004466, 0x002233]}
      // eslint-disable-next-line react/no-unknown-property
      position={[0, -1.5, 0]}
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
          position: [0, 8, 12],
          fov: 50,
          near: 0.1,
          far: 100,
        }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
      >
        {/* eslint-disable-next-line react/no-unknown-property */}
        <ambientLight intensity={0.5} />
        <HeatmapGrid />
        <FloatingParticles />
        <GridLines />
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
  height: 100dvh;
  pointer-events: none;
  opacity: 0.5;

  canvas {
    width: 100% !important;
    height: 100% !important;
  }
`;
