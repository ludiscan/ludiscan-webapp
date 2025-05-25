import type { Meta, StoryObj } from '@storybook/react';

import { DesktopLayout } from '@src/component/molecules/responsive';

export default {
  component: DesktopLayout,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof DesktopLayout>;

export const Default: Story = {
  render: () => {
    return (
      <DesktopLayout>
        <div style={{ padding: '20px', backgroundColor: '#f0f0f0', height: '100vh' }}>
          <h1>Desktop Layout</h1>
          <p>This is a simple desktop layout example.</p>
        </div>
      </DesktopLayout>
    );
  },
};
