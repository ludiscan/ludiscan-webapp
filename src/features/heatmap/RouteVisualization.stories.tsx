import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useEffect } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs';

import { RouteVisualization } from '@src/features/heatmap/RouteVisualization';
import { heatMapEventBus } from '@src/utils/canvasEventBus';

export default {
  component: RouteVisualization,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof RouteVisualization>;

const Template: Story = {
  render: (args) => {
    return (
      <div style={{ width: '100%', height: '500px', backgroundColor: '#20232a' }}>
        <Canvas camera={{ position: [500, 500, 500], fov: 75 }}>
          <ambientLight intensity={0.5} /> {/* eslint-disable-line react/no-unknown-property */}
          <directionalLight position={[10, 10, 10]} intensity={1} /> {/* eslint-disable-line react/no-unknown-property */}
          <RouteVisualization {...args} />
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
        </Canvas>
      </div>
    );
  },
};

// Wrapper component to emit route-selected event
const RouteVisualizationWith2DRoute: React.FC = () => {
  useEffect(() => {
    // Emit a sample route after component mounts
    setTimeout(() => {
      heatMapEventBus.emit('route-selected', {
        route: {
          from: { x: 0, y: 0, z: 0 },
          to: { x: 200, y: 0, z: 200 },
          count: 10,
          probability: 0.8,
        },
      });
    }, 100);
  }, []);

  return (
    <div style={{ width: '100%', height: '500px', backgroundColor: '#20232a' }}>
      <Canvas camera={{ position: [500, 500, 500], fov: 75 }}>
        <ambientLight intensity={0.5} /> {/* eslint-disable-line react/no-unknown-property */}
        <directionalLight position={[10, 10, 10]} intensity={1} /> {/* eslint-disable-line react/no-unknown-property */}
        <RouteVisualization dimensionality="2d" />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

const RouteVisualizationWith3DRoute: React.FC = () => {
  useEffect(() => {
    // Emit a sample route after component mounts
    setTimeout(() => {
      heatMapEventBus.emit('route-selected', {
        route: {
          from: { x: -150, y: 0, z: -150 },
          to: { x: 150, y: 0, z: 150 },
          count: 25,
          probability: 0.95,
        },
      });
    }, 100);
  }, []);

  return (
    <div style={{ width: '100%', height: '500px', backgroundColor: '#20232a' }}>
      <Canvas camera={{ position: [500, 500, 500], fov: 75 }}>
        <ambientLight intensity={0.5} /> {/* eslint-disable-line react/no-unknown-property */}
        <directionalLight position={[10, 10, 10]} intensity={1} /> {/* eslint-disable-line react/no-unknown-property */}
        <RouteVisualization dimensionality="3d" />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} />
      </Canvas>
    </div>
  );
};

export const NoRoute: Story = {
  ...Template,
  name: 'No Route Selected',
  args: {
    dimensionality: '2d',
  },
};

export const Route2D: Story = {
  render: () => <RouteVisualizationWith2DRoute />,
  name: '2D Mode with Route',
};

export const Route3D: Story = {
  render: () => <RouteVisualizationWith3DRoute />,
  name: '3D Mode with Route',
};
