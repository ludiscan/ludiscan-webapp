import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { HeatmapPointsMarker } from './HeatmapPointsMarker';

import type { Meta, StoryObj } from '@storybook/react';

import { SharedThemeProvider } from '@src/hooks/useSharedTheme';
import darkTheme from '@src/styles/dark';
import lightTheme from '@src/styles/light';

export default {
  component: HeatmapPointsMarker,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof HeatmapPointsMarker>;

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <div style={{ width: '100%', height: '500px', backgroundColor: '#20232a' }}>
          <Canvas camera={{ position: [3, 3, 3], fov: 75 }}>
            <ambientLight intensity={0.5} /> {/* eslint-disable-line react/no-unknown-property */}
            <directionalLight position={[10, 10, 10]} intensity={1} /> {/* eslint-disable-line react/no-unknown-property */}
            <HeatmapPointsMarker {...args} />
            {/* カメラ移動・回転を可能にする */}
            <OrbitControls
              enableZoom={true} // ズーム可能
              enablePan={true} // 平行移動可能
              enableRotate={true} // 回転可能
            />
          </Canvas>
        </div>
      </SharedThemeProvider>
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
