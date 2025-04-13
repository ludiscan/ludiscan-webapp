import darkTheme from '../../styles/dark';
import lightTheme from '../../styles/light';
import { Button } from '../atoms/Button';
import { Text } from '../atoms/Text';

import { CreateHeatmapTaskModal } from './CreateHeatmapTaskModal';

import type { Meta, StoryObj } from '@storybook/react';

import { SharedThemeProvider } from '@src/hooks/useSharedTheme';

export default {
  component: CreateHeatmapTaskModal,
  controls: { hideNoControlsWarning: true },
} as Meta;
type Story = StoryObj<typeof CreateHeatmapTaskModal>;

const Template: Story = {
  render: (args) => {
    return (
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      <SharedThemeProvider initialTheme={args.type === 'light' ? lightTheme : darkTheme}>
        <CreateHeatmapTaskModal {...args}>
          <Button onClick={() => {}} scheme={'primary'} fontSize={'medium'}>
            <Text text={'Close'} />
          </Button>
        </CreateHeatmapTaskModal>
      </SharedThemeProvider>
    );
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {
    isOpen: true,
    env: {
      HOSTNAME: 'https://localhost',
      API_BASE_URL: 'https://localhost:8080',
    },
    onClose: () => {
      /* eslint-disable-next-line no-console */
      console.log('onClose');
    },
  },
};
