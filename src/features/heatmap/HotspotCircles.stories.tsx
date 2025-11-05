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
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
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

// High density cluster
const denseCluster = Array.from({ length: 50 }, (_) => ({
  x: Math.random() * 100 - 50,
  y: 0,
  z: Math.random() * 100 - 50,
  density: Math.floor(Math.random() * 10) + 1,
}));

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
    points: [
      ...denseCluster,
      ...Array.from({ length: 30 }, (_) => ({
        x: Math.random() * 100 + 150,
        y: 0,
        z: Math.random() * 100 + 150,
        density: Math.floor(Math.random() * 10) + 1,
      })),
      ...Array.from({ length: 20 }, (_) => ({
        x: Math.random() * 100 - 150,
        y: 0,
        z: Math.random() * 100 - 150,
        density: Math.floor(Math.random() * 10) + 1,
      })),
    ],
  },
};
