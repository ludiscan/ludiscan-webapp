import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';

import { Modal } from './Modal';

import type { Meta, StoryObj } from '@storybook/nextjs';

export default {
  component: Modal,
  controls: { hideNoControlsWarning: true },
  argTypes: {
    onClose: {
      action: 'onClose',
    },
  },
} as Meta;
type Story = StoryObj<typeof Modal>;

const Template: Story = {
  render: (args) => {
    return (
      <Modal {...args}>
        <Button onClick={() => {}} scheme={'primary'} fontSize={'base'}>
          <Text text={'Close'} />
        </Button>
      </Modal>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {
    isOpen: true,
  },
};
