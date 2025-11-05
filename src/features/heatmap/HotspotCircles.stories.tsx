import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import type { Meta, StoryObj } from '@storybook/nextjs';

import { HotspotCircles } from '@src/features/heatmap/HotspotCircles';

export default {
  component: HotspotCircles,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof HotspotCircles>;

const Template: Story = {
  render: (args) => {
    return (
      <div style={{ width: '100%', height: '500px', backgroundColor: '#20232a' }}>
        <Canvas camera={{ position: [500, 500, 500], fov: 75 }}>
          <ambientLight intensity={0.5} /> {/* eslint-disable-line react/no-unknown-property */}
          <directionalLight position={[10, 10, 10]} intensity={1} /> {/* eslint-disable-line react/no-unknown-property */}
          <HotspotCircles {...args} />
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} enableDamping={false} autoRotate={false} />
        </Canvas>
      </div>
    );
  },
};

// Sample data: scattered points with varying density
const samplePoints = [
  { x: 0, y: 0, z: 0, density: 5 },
  { x: 10, y: 0, z: 10, density: 3 },
  { x: 20, y: 0, z: 0, density: 7 },
  { x: 30, y: 0, z: 10, density: 2 },
  { x: 15, y: 0, z: 5, density: 4 },
  { x: 100, y: 0, z: 100, density: 8 },
  { x: 110, y: 0, z: 110, density: 6 },
  { x: 120, y: 0, z: 100, density: 9 },
  { x: -50, y: 0, z: -50, density: 4 },
  { x: -60, y: 0, z: -60, density: 3 },
];

// High density cluster - using seeded random for consistent screenshots
const createSeededCluster = (seed: number, count: number, offsetX: number, offsetZ: number, range: number) => {
  // Simple seeded random number generator for reproducible results
  const seededRandom = (index: number) => {
    const x = Math.sin(seed + index * 0.1) * 10000;
    return x - Math.floor(x);
  };

  return Array.from({ length: count }, (_, i) => ({
    x: seededRandom(i * 2) * range + offsetX,
    y: 0,
    z: seededRandom(i * 2 + 1) * range + offsetZ,
    density: Math.floor(seededRandom(i * 3) * 10) + 1,
  }));
};

const denseCluster = createSeededCluster(1, 50, -50, -50, 100);
const cluster2 = createSeededCluster(2, 30, 150, 150, 100);
const cluster3 = createSeededCluster(3, 20, -150, -150, 100);

export const Default: Story = {
  ...Template,
  name: 'Default',
  args: {
    points: samplePoints,
  },
};

export const DenseCluster: Story = {
  ...Template,
  name: 'Dense Cluster',
  args: {
    points: denseCluster,
  },
};

export const MultipleClusters: Story = {
  ...Template,
  name: 'Multiple Clusters',
  args: {
    points: [...denseCluster, ...cluster2, ...cluster3],
  },
};
