import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';

import type { Meta, StoryObj } from '@storybook/nextjs';

import { WaypointMarker } from '@src/features/heatmap/WaypointMarker';

export default {
  component: WaypointMarker,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof WaypointMarker>;

const Template: Story = {
  render: (args) => {
    return (
      <div style={{ width: '100%', height: '500px', backgroundColor: '#20232a' }}>
        <Canvas camera={{ position: [500, 500, 500], fov: 75 }}>
          <ambientLight intensity={0.5} /> {/* eslint-disable-line react/no-unknown-property */}
          <directionalLight position={[10, 10, 10]} intensity={1} /> {/* eslint-disable-line react/no-unknown-property */}
          <WaypointMarker {...args} />
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} enableDamping={false} autoRotate={false} />
        </Canvas>
      </div>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default',
  args: {
    position: new Vector3(0, 0, 0),
    selected: false,
    // eslint-disable-next-line no-console
    onClick: () => console.log('Waypoint clicked'),
  },
};

export const Selected: Story = {
  ...Template,
  name: 'Selected',
  args: {
    position: new Vector3(0, 0, 0),
    selected: true,
    // eslint-disable-next-line no-console
    onClick: () => console.log('Waypoint clicked'),
  },
};

export const MultipleWaypoints: Story = {
  render: () => {
    return (
      <div style={{ width: '100%', height: '500px', backgroundColor: '#20232a' }}>
        <Canvas camera={{ position: [500, 500, 500], fov: 75 }}>
          <ambientLight intensity={0.5} /> {/* eslint-disable-line react/no-unknown-property */}
          <directionalLight position={[10, 10, 10]} intensity={1} /> {/* eslint-disable-line react/no-unknown-property */}
          <WaypointMarker position={new Vector3(0, 0, 0)} selected={true} onClick={() => {}} />
          <WaypointMarker position={new Vector3(200, 0, 0)} selected={false} onClick={() => {}} />
          <WaypointMarker position={new Vector3(-200, 0, 0)} selected={false} onClick={() => {}} />
          <WaypointMarker position={new Vector3(0, 0, 200)} selected={false} onClick={() => {}} />
          <WaypointMarker position={new Vector3(0, 0, -200)} selected={false} onClick={() => {}} />
          <OrbitControls enableZoom={true} enablePan={true} enableRotate={true} enableDamping={false} autoRotate={false} />
        </Canvas>
      </div>
    );
  },
  name: 'Multiple Waypoints',
};
