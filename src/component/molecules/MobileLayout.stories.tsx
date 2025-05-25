import type { Meta, StoryObj } from '@storybook/react';

import { MobileLayout } from '@src/component/molecules/responsive';

export default {
  component: MobileLayout,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof MobileLayout>;

export const Default: Story = {
  render: () => {
    return (
      <MobileLayout>
        <div style={{ padding: '20px', backgroundColor: '#f0f0f0', height: '100vh' }}>
          <h1>Mobile Layout</h1>
          <p>This is a simple mobile layout example.</p>
        </div>
      </MobileLayout>
    );
  },
};
