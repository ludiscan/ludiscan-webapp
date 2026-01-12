import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/nextjs';

import { Button } from '@src/component/atoms/Button';
import { Text } from '@src/component/atoms/Text';
import { ResponsiveSidebar } from '@src/component/molecules/ResponsiveSidebar';

export default {
  component: ResponsiveSidebar,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof ResponsiveSidebar>;

const Template: Story = {
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [isOpen, setIsOpen] = useState(true);
    return (
      <>
        <Button onClick={() => setIsOpen(true)} scheme={'primary'} fontSize={'base'}>
          <Text text='Open Sidebar' />
        </Button>
        <ResponsiveSidebar isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Text text={'Sidebar Content'} />
        </ResponsiveSidebar>
      </>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'Default ResponsiveSidebar',
};
