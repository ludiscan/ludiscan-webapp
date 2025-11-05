import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { HeatmapObjectOverlay } from './HeatmapObjectOverlay';

import type { Meta, StoryObj } from '@storybook/nextjs';

export default {
  component: HeatmapObjectOverlay,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof HeatmapObjectOverlay>;

const Template: Story = {
  render: (args) => {
    return (
      <div style={{ width: '100%', height: '500px', backgroundColor: '#20232a' }}>
        <Canvas camera={{ position: [3, 3, 3], fov: 75 }}>
          <ambientLight intensity={0.5} /> {/* eslint-disable-line react/no-unknown-property */}
          <directionalLight position={[10, 10, 10]} intensity={1} /> {/* eslint-disable-line react/no-unknown-property */}
          <HeatmapObjectOverlay {...args} />
          {/* カメラ移動・回転を可能にする */}
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} enableDamping={false} autoRotate={false} />
        </Canvas>
      </div>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {
    points: [
      { x: 0, y: 0, z: 0, density: 1 },
      { x: 1, y: 1, z: 1, density: 2 },
      { x: 2, y: 2, z: 2, density: 3 },
      { x: 3, y: 3, z: 3, density: 4 },
    ],
  },
};
