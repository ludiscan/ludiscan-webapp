import darkTheme from '../../styles/dark';
import lightTheme from '../../styles/light';
import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';

import { Modal } from './Modal';

import type { Meta, StoryObj } from '@storybook/react';

import { SharedThemeProvider } from '@src/hooks/useSharedTheme';

export default {
  component: Modal,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof Modal>;

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <Modal {...args}>
          <Button onClick={() => {}} scheme={'primary'} fontSize={'medium'}>
            <Text text={'Close'} />
          </Button>
        </Modal>
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {
    isOpen: true,
    onClose: () => {
      /* eslint-disable-next-line no-console */
      console.log('onClose');
    },
  },
};
