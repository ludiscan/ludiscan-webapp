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
        <Canvas camera={{ position: [500, 500, 500], fov: 75 }} frameloop='demand'>
          <ambientLight intensity={0.5} /> {/* eslint-disable-line react/no-unknown-property */}
          <directionalLight position={[10, 10, 10]} intensity={1} /> {/* eslint-disable-line react/no-unknown-property */}
          <RouteVisualization {...args} />
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} enableDamping={false} autoRotate={false} />
        </Canvas>
      </div>
    );
  },
};

// Wrapper component to emit route-selected event
const RouteVisualizationWith2DRoute = () => {
  useEffect(() => {
    // Emit a sample route after component mounts
    setTimeout(() => {
      heatMapEventBus.emit('route-selected', {
        route: {
          id: 1,
          from: { x: 0, z: 0 },
          to: { x: 200, z: 200 },
          traversal_count: 10,
          avg_duration_ms: 5000,
          death_count: 0,
          death_rate: 0,
          success_rate: 0.8,
          avg_time_to_success_ms: 4500,
        },
      });
    }, 100);
  }, []);

  return (
    <div style={{ width: '100%', height: '500px', backgroundColor: '#20232a' }}>
      <Canvas camera={{ position: [500, 500, 500], fov: 75 }} frameloop='demand'>
        <ambientLight intensity={0.5} /> {/* eslint-disable-line react/no-unknown-property */}
        <directionalLight position={[10, 10, 10]} intensity={1} /> {/* eslint-disable-line react/no-unknown-property */}
        <RouteVisualization dimensionality='2d' />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} enableDamping={false} autoRotate={false} />
      </Canvas>
    </div>
  );
};

const RouteVisualizationWith3DRoute = () => {
  useEffect(() => {
    // Emit a sample route after component mounts
    setTimeout(() => {
      heatMapEventBus.emit('route-selected', {
        route: {
          id: 2,
          from: { x: -150, z: -150 },
          to: { x: 150, z: 150 },
          traversal_count: 25,
          avg_duration_ms: 7000,
          death_count: 1,
          death_rate: 0.04,
          success_rate: 0.95,
          avg_time_to_success_ms: 6800,
        },
      });
    }, 100);
  }, []);

  return (
    <div style={{ width: '100%', height: '500px', backgroundColor: '#20232a' }}>
      <Canvas camera={{ position: [500, 500, 500], fov: 75 }} frameloop='demand'>
        <ambientLight intensity={0.5} /> {/* eslint-disable-line react/no-unknown-property */}
        <directionalLight position={[10, 10, 10]} intensity={1} /> {/* eslint-disable-line react/no-unknown-property */}
        <RouteVisualization dimensionality='3d' />
        <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} enableDamping={false} autoRotate={false} />
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
