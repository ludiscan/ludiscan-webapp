import type { Meta, StoryObj } from '@storybook/nextjs';

import { Text } from '@src/component/atoms/Text';
import { ResponsiveSidebar } from '@src/component/molecules/ResponsiveSidebar';

export default {
  component: ResponsiveSidebar,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof ResponsiveSidebar>;

const Template: Story = {
  render: () => {
    return (
      <ResponsiveSidebar>
        <Text text={'Hover over me'} />
      </ResponsiveSidebar>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default ResponsiveSidebar',
};
