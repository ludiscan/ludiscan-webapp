import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { TimelineControllerBlock } from '@src/component/templates/TimelineControllerBlock';

export default {
  component: TimelineControllerBlock,
  controls: { hideNoControlsWarning: true },
} as Meta;

type Story = StoryObj<typeof TimelineControllerBlock>;

const Template: Story = {
  render: (args) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [seekRatio, setSeekRatio] = useState(0);
    return <TimelineControllerBlock {...args} maxTime={60 * 3 * 1000} currentTime={seekRatio} onSeek={setSeekRatio} />;
  },
};

export const Default: Story = {
  ...Template,
  name: 'default style',
  args: {
    isPlaying: false,
    onClickMenu: () => {
      /* eslint-disable-next-line no-console */
      console.log('Menu clicked');
    },
    onClickPlay: () => {
      /* eslint-disable-next-line no-console */
      console.log('Play/Pause clicked');
    },
  },
};
